import * as index from '../src/index';
import { llmRubric, gEval, bEval } from '../src/index';
import CONF from '../src/config';
import * as registry from '../src/registry';
import { generateText, Output } from 'ai';

jest.mock('node:crypto', () => ({
  default: {
    randomBytes: () => ({
      toString: () => 'abcdef1234567890abcdef1234567890',
    }),
  },
  randomBytes: () => ({
    toString: () => 'abcdef1234567890abcdef1234567890',
  }),
}));

jest.mock('ai', () => ({
  generateText: jest.fn(),
  Output: {
    object: jest.fn(({ schema }: any) => ({ type: 'object', schema })),
  },
}));

jest.mock('../src/registry', () => ({
  getModel: jest.fn().mockReturnValue('mock-model'),
  getSteps: jest.fn(),
  setSteps: jest.fn(),
}));

const mockedGenerateText = generateText as jest.MockedFunction<typeof generateText>;
const mockedGetModel = registry.getModel as jest.MockedFunction<typeof registry.getModel>;
const mockedGetSteps = registry.getSteps as jest.MockedFunction<typeof registry.getSteps>;
const mockedSetSteps = registry.setSteps as jest.MockedFunction<typeof registry.setSteps>;

describe('Index module exports', () => {
  it('should export RubricResultSchema', () => {
    expect(index.RubricResultSchema).toBeDefined();
  });
  it('should export GevalStepsResultSchema', () => {
    expect(index.GevalStepsResultSchema).toBeDefined();
  });
  it('should export GevalEvaluateResultSchema', () => {
    expect(index.GevalEvaluateResultSchema).toBeDefined();
  });
  it('should export CONF as default', () => {
    expect(index.default).toBeDefined();
  });
  it('should export llmRubric, gEval, bEval', () => {
    expect(llmRubric).toBeInstanceOf(Function);
    expect(gEval).toBeInstanceOf(Function);
    expect(bEval).toBeInstanceOf(Function);
  });
});

describe('llmRubric', () => {
  const originalHooks = { ...CONF.hooks };

  beforeEach(() => {
    jest.clearAllMocks();
    CONF.hooks = {};
  });

  afterEach(() => {
    CONF.hooks = originalHooks;
  });

  it('should return a rubric result on success', async () => {
    const mockResult = { reason: 'Good output', pass: true, score: 0.9 };
    mockedGenerateText.mockResolvedValue({ output: mockResult } as any);

    const result = await llmRubric('hello world', 'Contains greeting', 'openai', 'gpt-4');

    expect(result).toEqual(mockResult);
    expect(mockedGetModel).toHaveBeenCalledWith('openai', 'gpt-4');
    expect(mockedGenerateText).toHaveBeenCalledTimes(1);

    const callArgs = mockedGenerateText.mock.calls[0][0] as any;
    expect(callArgs.model).toBe('mock-model');
    expect(callArgs.prompt).toContain('hello world');
    expect(callArgs.prompt).toContain('Contains greeting');
    expect(callArgs.system).toBeDefined();
    expect(callArgs.output).toBeDefined();
  });

  it('should pass EvalOptions through to generateText', async () => {
    mockedGenerateText.mockResolvedValue({ output: { reason: '', pass: true, score: 1 } } as any);

    await llmRubric('out', 'rubric', 'openai', 'gpt-4', {
      temperature: 0.5,
      providerOptions: { key: 'val' },
    });

    const callArgs = mockedGenerateText.mock.calls[0][0] as any;
    expect(callArgs.temperature).toBe(0.5);
    expect(callArgs.providerOptions).toEqual({ key: 'val' });
  });

  it('should call onSuccess hook with correct data', async () => {
    const mockResult = { reason: 'ok', pass: true, score: 1 };
    mockedGenerateText.mockResolvedValue({ output: mockResult } as any);
    const onSuccess = jest.fn();
    CONF.hooks = { onSuccess };

    await llmRubric('out', 'rubric', 'openai', 'gpt-4');

    expect(onSuccess).toHaveBeenCalledTimes(1);
    const hookData = onSuccess.mock.calls[0][0];
    expect(hookData.method).toBe('llmRubric');
    expect(hookData.params).toEqual({
      output: 'out',
      rubric: 'rubric',
      providerName: 'openai',
      modelName: 'gpt-4',
      options: {},
    });
    expect(hookData.result).toEqual(mockResult);
    expect(typeof hookData.duration).toBe('number');
    expect(hookData.duration).toBeGreaterThanOrEqual(0);
  });

  it('should call onError hook and rethrow on failure', async () => {
    const error = new Error('API failure');
    mockedGenerateText.mockRejectedValue(error);
    const onError = jest.fn();
    CONF.hooks = { onError };

    await expect(llmRubric('out', 'rubric', 'openai', 'gpt-4')).rejects.toThrow('API failure');

    expect(onError).toHaveBeenCalledTimes(1);
    const hookData = onError.mock.calls[0][0];
    expect(hookData.method).toBe('llmRubric');
    expect(hookData.error).toBe(error);
    expect(typeof hookData.duration).toBe('number');
  });

  it('should not fail if hooks are not set', async () => {
    mockedGenerateText.mockResolvedValue({ output: { reason: '', pass: true, score: 1 } } as any);
    CONF.hooks = {};

    await expect(llmRubric('out', 'rubric', 'openai', 'gpt-4')).resolves.toBeDefined();
  });

  it('should not fail on error if onError hook is not set', async () => {
    mockedGenerateText.mockRejectedValue(new Error('fail'));
    CONF.hooks = {};

    await expect(llmRubric('out', 'rubric', 'openai', 'gpt-4')).rejects.toThrow('fail');
  });
});

describe('gEval', () => {
  const originalHooks = { ...CONF.hooks };

  beforeEach(() => {
    jest.clearAllMocks();
    CONF.hooks = {};
    CONF.gevalMaxScore = 10;
  });

  afterEach(() => {
    CONF.hooks = originalHooks;
  });

  it('should generate steps when not cached, then evaluate', async () => {
    mockedGetSteps.mockResolvedValue(undefined);
    mockedGenerateText
      .mockResolvedValueOnce({ output: { steps: ['step1', 'step2'] } } as any)
      .mockResolvedValueOnce({ output: { reason: 'Good', score: 8 } } as any);

    const result = await gEval(
      { query: 'What is 2+2?', answer: '4' },
      'Correctness',
      'openai',
      'gpt-4',
    );

    expect(result).toEqual({ reason: 'Good', score: 0.8 });
    expect(mockedGetSteps).toHaveBeenCalledWith('Correctness');
    expect(mockedSetSteps).toHaveBeenCalledWith('Correctness', ['step1', 'step2']);
    expect(mockedGenerateText).toHaveBeenCalledTimes(2);
  });

  it('should use cached steps and skip step generation', async () => {
    mockedGetSteps.mockResolvedValue(['cached-step1', 'cached-step2']);
    mockedGenerateText.mockResolvedValue({ output: { reason: 'Fine', score: 7 } } as any);

    const result = await gEval(
      { query: 'q', answer: 'a' },
      'Relevance',
      'anthropic',
      'claude-3',
    );

    expect(result).toEqual({ reason: 'Fine', score: 0.7 });
    expect(mockedGenerateText).toHaveBeenCalledTimes(1);
    expect(mockedSetSteps).not.toHaveBeenCalled();
  });

  it('should handle string input by wrapping to {query: "", answer: input}', async () => {
    mockedGetSteps.mockResolvedValue(['s1']);
    mockedGenerateText.mockResolvedValue({ output: { reason: 'ok', score: 5 } } as any);

    const result = await gEval('just some text', 'Fluency', 'openai', 'gpt-4');

    expect(result).toEqual({ reason: 'ok', score: 0.5 });

    const evalCallArgs = mockedGenerateText.mock.calls[0][0] as any;
    expect(evalCallArgs.prompt).toContain('just some text');
  });

  it('should use GEVAL_EVALUATE_PROMPT when query is present', async () => {
    mockedGetSteps.mockResolvedValue(['s1']);
    mockedGenerateText.mockResolvedValue({ output: { reason: 'ok', score: 10 } } as any);

    await gEval({ query: 'my query', answer: 'my answer' }, 'Criteria', 'openai', 'gpt-4');

    const evalCallArgs = mockedGenerateText.mock.calls[0][0] as any;
    expect(evalCallArgs.prompt).toContain('my query');
    expect(evalCallArgs.prompt).toContain('my answer');
  });

  it('should use GEVAL_EVALUATE_REPLY_PROMPT when query is empty', async () => {
    mockedGetSteps.mockResolvedValue(['s1']);
    mockedGenerateText.mockResolvedValue({ output: { reason: 'ok', score: 5 } } as any);

    await gEval({ query: '', answer: 'an answer' }, 'Criteria', 'openai', 'gpt-4');

    const evalCallArgs = mockedGenerateText.mock.calls[0][0] as any;
    // GEVAL_EVALUATE_REPLY_PROMPT does not contain <Prompt> tags
    expect(evalCallArgs.prompt).not.toContain('<Prompt>');
    expect(evalCallArgs.prompt).toContain('an answer');
  });

  it('should normalize score by gevalMaxScore', async () => {
    CONF.gevalMaxScore = 5;
    mockedGetSteps.mockResolvedValue(['s1']);
    mockedGenerateText.mockResolvedValue({ output: { reason: 'r', score: 3 } } as any);

    const result = await gEval('text', 'C', 'openai', 'gpt-4');

    expect(result.score).toBeCloseTo(0.6);
  });

  it('should call onSuccess hook with method "gEval"', async () => {
    mockedGetSteps.mockResolvedValue(['s1']);
    mockedGenerateText.mockResolvedValue({ output: { reason: 'r', score: 10 } } as any);
    const onSuccess = jest.fn();
    CONF.hooks = { onSuccess };

    await gEval({ query: 'q', answer: 'a' }, 'C', 'openai', 'gpt-4');

    expect(onSuccess).toHaveBeenCalledTimes(1);
    const hookData = onSuccess.mock.calls[0][0];
    expect(hookData.method).toBe('gEval');
    expect(hookData.result).toEqual({ reason: 'r', score: 1 });
    expect(hookData.params).toMatchObject({
      query: 'q',
      answer: 'a',
      criteria: 'C',
      providerName: 'openai',
      modelName: 'gpt-4',
    });
  });

  it('should call onError hook and rethrow on failure', async () => {
    const error = new Error('eval fail');
    mockedGetSteps.mockResolvedValue(['s1']);
    mockedGenerateText.mockRejectedValue(error);
    const onError = jest.fn();
    CONF.hooks = { onError };

    await expect(
      gEval({ query: 'q', answer: 'a' }, 'C', 'openai', 'gpt-4'),
    ).rejects.toThrow('eval fail');

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0].method).toBe('gEval');
  });

  it('should pass EvalOptions to generateText calls', async () => {
    mockedGetSteps.mockResolvedValue(undefined);
    mockedGenerateText
      .mockResolvedValueOnce({ output: { steps: ['s'] } } as any)
      .mockResolvedValueOnce({ output: { reason: 'r', score: 5 } } as any);

    await gEval('text', 'C', 'openai', 'gpt-4', { temperature: 0.2 });

    expect((mockedGenerateText.mock.calls[0][0] as any).temperature).toBe(0.2);
    expect((mockedGenerateText.mock.calls[1][0] as any).temperature).toBe(0.2);
  });

  it('should rethrow when step generation fails', async () => {
    mockedGetSteps.mockResolvedValue(undefined);
    mockedGenerateText.mockRejectedValue(new Error('step gen fail'));
    const onError = jest.fn();
    CONF.hooks = { onError };

    await expect(gEval('text', 'C', 'openai', 'gpt-4')).rejects.toThrow('step gen fail');
    expect(onError).toHaveBeenCalledTimes(1);
  });
});

describe('bEval', () => {
  const originalHooks = { ...CONF.hooks };

  beforeEach(() => {
    jest.clearAllMocks();
    CONF.hooks = {};
    CONF.gevalMaxScore = 10;
  });

  afterEach(() => {
    CONF.hooks = originalHooks;
  });

  it('should use maxScore of 1 for binary evaluation', async () => {
    mockedGetSteps.mockResolvedValue(['s1']);
    mockedGenerateText.mockResolvedValue({ output: { reason: 'pass', score: 1 } } as any);

    const result = await bEval({ query: 'q', answer: 'a' }, 'C', 'openai', 'gpt-4');

    expect(result).toEqual({ reason: 'pass', score: 1 });
  });

  it('should return score 0 for binary fail', async () => {
    mockedGetSteps.mockResolvedValue(['s1']);
    mockedGenerateText.mockResolvedValue({ output: { reason: 'fail', score: 0 } } as any);

    const result = await bEval('text', 'C', 'openai', 'gpt-4');

    expect(result).toEqual({ reason: 'fail', score: 0 });
  });

  it('should call onSuccess with method "bEval"', async () => {
    mockedGetSteps.mockResolvedValue(['s1']);
    mockedGenerateText.mockResolvedValue({ output: { reason: 'ok', score: 1 } } as any);
    const onSuccess = jest.fn();
    CONF.hooks = { onSuccess };

    await bEval('text', 'C', 'openai', 'gpt-4');

    expect(onSuccess.mock.calls[0][0].method).toBe('bEval');
  });

  it('should call onError with method "bEval" on failure', async () => {
    mockedGetSteps.mockResolvedValue(['s1']);
    mockedGenerateText.mockRejectedValue(new Error('bEval fail'));
    const onError = jest.fn();
    CONF.hooks = { onError };

    await expect(bEval('text', 'C', 'openai', 'gpt-4')).rejects.toThrow('bEval fail');
    expect(onError.mock.calls[0][0].method).toBe('bEval');
  });

  it('should handle string input same as gEval', async () => {
    mockedGetSteps.mockResolvedValue(['s1']);
    mockedGenerateText.mockResolvedValue({ output: { reason: 'r', score: 1 } } as any);

    const result = await bEval('plain text', 'C', 'openai', 'gpt-4');

    expect(result.score).toBe(1);
    const callArgs = mockedGenerateText.mock.calls[0][0] as any;
    expect(callArgs.prompt).toContain('plain text');
  });

  it('should generate steps when not cached', async () => {
    mockedGetSteps.mockResolvedValue(undefined);
    mockedGenerateText
      .mockResolvedValueOnce({ output: { steps: ['check it'] } } as any)
      .mockResolvedValueOnce({ output: { reason: 'r', score: 1 } } as any);

    await bEval('text', 'C', 'openai', 'gpt-4');

    expect(mockedSetSteps).toHaveBeenCalledWith('C', ['check it']);
    expect(mockedGenerateText).toHaveBeenCalledTimes(2);
  });
});
