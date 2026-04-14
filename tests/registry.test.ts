import { getModel, getSteps, setSteps } from '../src/registry';
import CONF from '../src/config';

// Mock all provider modules
jest.mock('@ai-sdk/openai', () => ({
  openai: jest.fn((model: string) => ({ provider: 'openai', modelId: model })),
}));
jest.mock('@ai-sdk/anthropic', () => ({
  anthropic: jest.fn((model: string) => ({ provider: 'anthropic', modelId: model })),
}));
jest.mock('@ai-sdk/google', () => ({
  google: jest.fn((model: string) => ({ provider: 'google', modelId: model })),
}));
jest.mock('@ai-sdk/mistral', () => ({
  mistral: jest.fn((model: string) => ({ provider: 'mistral', modelId: model })),
}));
jest.mock('@ai-sdk/amazon-bedrock', () => ({
  bedrock: jest.fn((model: string) => ({ provider: 'bedrock', modelId: model })),
}));
jest.mock('@ai-sdk/azure', () => ({
  azure: jest.fn((model: string) => ({ provider: 'azure', modelId: model })),
}));
jest.mock('@ai-sdk/deepseek', () => ({
  deepseek: jest.fn((model: string) => ({ provider: 'deepseek', modelId: model })),
}));
jest.mock('@ai-sdk/groq', () => ({
  groq: jest.fn((model: string) => ({ provider: 'groq', modelId: model })),
}));
jest.mock('@ai-sdk/perplexity', () => ({
  perplexity: jest.fn((model: string) => ({ provider: 'perplexity', modelId: model })),
}));
jest.mock('@ai-sdk/xai', () => ({
  xai: jest.fn((model: string) => ({ provider: 'xai', modelId: model })),
}));

describe('Registry module', () => {
  beforeEach(() => {
    CONF.isModelCached = true;
    CONF.isStepsCached = true;
    CONF.restartModelCache();
    CONF.restartStepsCache();
  });

  describe('getModel', () => {
    it('should return a model for a valid provider', () => {
      const model = getModel('openai', 'gpt-4o');
      expect(model).toBeDefined();
      expect(model).toEqual({ provider: 'openai', modelId: 'gpt-4o' });
    });

    it('should work with all registered providers', () => {
      const providers = [
        'openai', 'anthropic', 'google', 'mistral',
        'bedrock', 'azure', 'deepseek', 'groq', 'perplexity', 'xai',
      ];

      for (const provider of providers) {
        const model = getModel(provider, 'test-model');
        expect(model).toBeDefined();
        expect(model).toEqual({ provider, modelId: 'test-model' });
      }
    });

    it('should throw for an unknown provider', () => {
      expect(() => getModel('unknown-provider', 'model')).toThrow(
        /Unknown provider: "unknown-provider"/,
      );
    });

    it('should list available providers in the error message', () => {
      expect(() => getModel('invalid', 'model')).toThrow(/Available providers:/);
    });

    it('should cache model instances when caching is enabled', () => {
      const model1 = getModel('openai', 'gpt-4o');
      const model2 = getModel('openai', 'gpt-4o');
      expect(model1).toBe(model2);
    });

    it('should not cache model instances when caching is disabled', () => {
      CONF.isModelCached = false;

      const model1 = getModel('openai', 'gpt-4o');
      const model2 = getModel('openai', 'gpt-4o');
      // Both calls create new objects since caching is off
      expect(model1).not.toBe(model2);
      expect(model1).toEqual(model2);
    });

    it('should use separate cache entries for different models', () => {
      const model1 = getModel('openai', 'gpt-4o');
      const model2 = getModel('openai', 'gpt-4o-mini');
      expect(model1).not.toEqual(model2);
    });

    it('should use separate cache entries for different providers', () => {
      const model1 = getModel('openai', 'test-model');
      const model2 = getModel('anthropic', 'test-model');
      expect(model1).not.toEqual(model2);
    });
  });

  describe('getSteps', () => {
    it('should return undefined for uncached criteria', async () => {
      const result = await getSteps('some criteria');
      expect(result).toBeUndefined();
    });

    it('should return cached steps after setSteps', async () => {
      const steps = ['step1', 'step2', 'step3'];
      await setSteps('my criteria', steps);

      const result = await getSteps('my criteria');
      expect(result).toEqual(steps);
    });

    it('should return undefined when caching is disabled', async () => {
      CONF.isStepsCached = false;

      const result = await getSteps('any criteria');
      expect(result).toBeUndefined();
    });

    it('should return undefined for cached criteria when caching is later disabled', async () => {
      const steps = ['step1'];
      await setSteps('criteria', steps);

      CONF.isStepsCached = false;
      const result = await getSteps('criteria');
      expect(result).toBeUndefined();
    });

    it('should use MD5 hashing so same criteria text returns same steps', async () => {
      const steps = ['a', 'b'];
      await setSteps('identical criteria', steps);
      const result = await getSteps('identical criteria');
      expect(result).toEqual(steps);
    });

    it('should not return steps for different criteria', async () => {
      await setSteps('criteria A', ['step1']);
      const result = await getSteps('criteria B');
      expect(result).toBeUndefined();
    });
  });

  describe('setSteps', () => {
    it('should store steps when caching is enabled', async () => {
      const steps = ['evaluate', 'score'];
      await setSteps('test criteria', steps);

      const result = await getSteps('test criteria');
      expect(result).toEqual(steps);
    });

    it('should not store steps when caching is disabled', async () => {
      CONF.isStepsCached = false;
      await setSteps('test criteria', ['step1']);

      CONF.isStepsCached = true;
      const result = await getSteps('test criteria');
      expect(result).toBeUndefined();
    });

    it('should overwrite previously cached steps', async () => {
      await setSteps('criteria', ['old']);
      await setSteps('criteria', ['new']);

      const result = await getSteps('criteria');
      expect(result).toEqual(['new']);
    });

    it('should resolve without error when caching is disabled', async () => {
      CONF.isStepsCached = false;
      await expect(setSteps('criteria', ['step'])).resolves.toBeUndefined();
    });
  });
});
