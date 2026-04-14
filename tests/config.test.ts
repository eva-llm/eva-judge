import CONF from '../src/config';
import type { IStepsCache, EvaHooks } from '../src/types';

describe('Config module', () => {
  beforeEach(() => {
    // Reset to defaults before each test
    CONF.isModelCached = true;
    CONF.isStepsCached = true;
    CONF.hooks = {} as EvaHooks;
    CONF.restartModelCache();
    CONF.restartStepsCache();
  });

  it('should have a default export', () => {
    expect(CONF).toBeDefined();
  });

  describe('default values', () => {
    it('should have gevalMaxScore of 10', () => {
      expect(CONF.gevalMaxScore).toBe(10);
    });

    it('should have model caching enabled by default', () => {
      expect(CONF.isModelCached).toBe(true);
    });

    it('should have steps caching enabled by default', () => {
      expect(CONF.isStepsCached).toBe(true);
    });

    it('should have an empty hooks object', () => {
      expect(CONF.hooks).toEqual({});
    });

    it('should have a modelCache', () => {
      expect(CONF.modelCache).toBeDefined();
    });

    it('should have a stepsCache', () => {
      expect(CONF.stepsCache).toBeDefined();
    });
  });

  describe('model cache controls', () => {
    it('enableModelCache sets isModelCached to true', () => {
      CONF.isModelCached = false;
      CONF.enableModelCache();
      expect(CONF.isModelCached).toBe(true);
    });

    it('disableModelCache sets isModelCached to false', () => {
      CONF.disableModelCache();
      expect(CONF.isModelCached).toBe(false);
    });
  });

  describe('steps cache controls', () => {
    it('enableStepsCache sets isStepsCached to true', () => {
      CONF.isStepsCached = false;
      CONF.enableStepsCache();
      expect(CONF.isStepsCached).toBe(true);
    });

    it('disableStepsCache sets isStepsCached to false', () => {
      CONF.disableStepsCache();
      expect(CONF.isStepsCached).toBe(false);
    });
  });

  describe('restartModelCache', () => {
    it('creates a new model cache with default size', () => {
      const oldCache = CONF.modelCache;
      CONF.restartModelCache();
      expect(CONF.modelCache).not.toBe(oldCache);
    });

    it('creates a new model cache with custom size', () => {
      const oldCache = CONF.modelCache;
      CONF.restartModelCache(50);
      expect(CONF.modelCache).not.toBe(oldCache);
      expect(CONF.modelCache.max).toBe(50);
    });
  });

  describe('restartStepsCache', () => {
    it('creates a new steps cache with default size', () => {
      const oldCache = CONF.stepsCache;
      CONF.restartStepsCache();
      expect(CONF.stepsCache).not.toBe(oldCache);
    });

    it('creates a new steps cache with custom size', () => {
      const oldCache = CONF.stepsCache;
      CONF.restartStepsCache(200);
      expect(CONF.stepsCache).not.toBe(oldCache);
    });
  });

  describe('setStepsCache', () => {
    it('replaces the steps cache with a custom implementation', async () => {
      const store = new Map<string, string[]>();
      const customCache: IStepsCache = {
        async set(key: string, value: string[]) {
          store.set(key, value);
        },
        async get(key: string) {
          return store.get(key);
        },
      };

      CONF.setStepsCache(customCache);
      expect(CONF.stepsCache).toBe(customCache);

      await CONF.stepsCache.set('key1', ['step1', 'step2']);
      const result = await CONF.stepsCache.get('key1');
      expect(result).toEqual(['step1', 'step2']);
    });
  });

  describe('default StepsMemoryAdapter', () => {
    it('can set and get values', async () => {
      const steps = ['step1', 'step2', 'step3'];
      await CONF.stepsCache.set('test-key', steps);
      const result = await CONF.stepsCache.get('test-key');
      expect(result).toEqual(steps);
    });

    it('returns undefined for missing keys', async () => {
      const result = await CONF.stepsCache.get('nonexistent');
      expect(result).toBeUndefined();
    });

    it('overwrites existing keys', async () => {
      await CONF.stepsCache.set('key', ['old']);
      await CONF.stepsCache.set('key', ['new']);
      const result = await CONF.stepsCache.get('key');
      expect(result).toEqual(['new']);
    });
  });

  describe('setHooks', () => {
    it('sets hooks object', () => {
      const hooks: EvaHooks = {
        onSuccess: jest.fn(),
        onError: jest.fn(),
      };
      CONF.setHooks(hooks);
      expect(CONF.hooks).toBe(hooks);
    });

    it('allows partial hooks', () => {
      const hooks: EvaHooks = { onSuccess: jest.fn() };
      CONF.setHooks(hooks);
      expect(CONF.hooks.onSuccess).toBeDefined();
      expect(CONF.hooks.onError).toBeUndefined();
    });
  });
});
