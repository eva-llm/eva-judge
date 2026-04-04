export type EvalMethod = 'bEval' | 'gEval' | 'llmRubric';
export type GEvalInput = string | { query: string; answer: string };

/**
 * Interface for a cache that stores evaluation steps.
 * Implementations should provide asynchronous set/get methods for storing and retrieving
 * arrays of strings, typically representing evaluation steps for a given key.
 */
export interface IStepsCache {
  /**
   * Store an array of steps in the cache for a given key.
   * @param key Unique identifier for the steps (e.g., criteria string).
   * @param value Array of step strings to cache.
   * @returns Promise that resolves when the value is set.
   */
  set(key: string, value: string[]): Promise<void>;
  /**
   * Retrieve an array of steps from the cache for a given key.
   * @param key Unique identifier for the steps (e.g., criteria string).
   * @returns Promise resolving to the cached array of steps, or undefined if not found.
   */
  get(key: string): Promise<string[] | undefined>;
}

/**
 * Options for evaluation functions.
 * Allows customization of LLM generation parameters and provider-specific options.
 */
export interface EvalOptions {
  /**
   * Temperature for model generation (controls randomness).
   */
  temperature?: number;
  /**
   * Additional provider-specific options (passed to the LLM provider).
   */
  providerOptions?: Record<string, any>;
}

/**
 * Optional hooks for receiving notifications about evaluation events.
 * Can be used to monitor or log success and error events for evaluation functions.
 */
export interface EvaHooks {
  /**
   * Called when an evaluation completes successfully.
   * @param data Information about the evaluation, including method, params, result, and duration (ms).
   */
  onSuccess?: (data: {
    method: EvalMethod;
    params: any;
    result: any;
    duration: number;
  }) => void;
  /**
   * Called when an evaluation throws an error.
   * @param data Information about the error, including method, error object, and duration (ms).
   */
  onError?: (data: {
    method: EvalMethod;
    error: any;
    duration: number;
  }) => void;
}
