export type EvalMethod = 'bEval' | 'gEval' | 'llmRubric';

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
