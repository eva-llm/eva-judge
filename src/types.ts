import { z } from 'zod';

export type TJudgeMethod = 'bEval' | 'gEval' | 'llmRubric';
export type TGevalInput = string | { query: string; answer: string };

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

// NOTE: Just forward any Vercel ai-sdk options and mention it in the docs.
export type TVercelOptions = Record<string, any>;

/**
 * Optional hooks for receiving notifications about evaluation events.
 * Can be used to monitor or log success and error events for evaluation functions.
 */
export interface IJudgeHooks {
  /**
   * Called when an evaluation completes successfully.
   * @param data Information about the evaluation, including method, params, result, and duration (ms).
   */
  onSuccess?: (data: {
    method: TJudgeMethod;
    params: any;
    result: any;
    duration: number;
  }) => void;
  /**
   * Called when an evaluation throws an error.
   * @param data Information about the error, including method, error object, and duration (ms).
   */
  onError?: (data: {
    method: TJudgeMethod;
    error: any;
    duration: number;
  }) => void;
}

/**
 * Zod schema for rubric result.
 * Describes the structure of the result returned by rubric-based evaluation.
 */
export const RubricResultSchema = z.object({
  /** Detailed explanation of the score based on the rubric. */
  reason: z.string().describe('Detailed explanation of the score based on the rubric'),
  /** Whether the output satisfies the minimum requirements. */
  pass: z.boolean().describe('Whether the output satisfies the minimum requirements'),
  /** Numeric representation of quality (0-1). */
  score: z.number().min(0).max(1).describe('Numeric representation of quality'),
});
/**
 * Type for rubric result (inferred from RubricResultSchema).
 */
export type TRubricResult = z.infer<typeof RubricResultSchema>;

/**
 * Zod schema for evaluation steps result.
 * Describes the structure of the result containing evaluation steps derived from criteria.
 */
export const GevalStepsResultSchema = z.object({
  /** List of concise evaluation steps derived from the criteria. */
  steps: z.array(z.string()).describe('List of concise evaluation steps derived from the criteria'),
});
/**
 * Type for evaluation steps result (inferred from GevalStepsResultSchema).
 */
export type TGevalStepsResult = z.infer<typeof GevalStepsResultSchema>;

/**
 * Zod schema for evaluation result.
 * Describes the structure of the result returned by the main evaluation function.
 */
export const GevalEvaluateResultSchema = z.object({
  /** Detailed explanation of the score based on the rubric. */
  reason: z.string().describe('Detailed explanation of the score based on the rubric'),
  /** Numeric representation of quality (normalized score, 0-1). */
  score: z.number().min(0).describe('Numeric representation of quality'),
});
/**
 * Type for evaluation result (inferred from GevalEvaluateResultSchema).
 */
export type TGevalEvaluateResult = z.infer<typeof GevalEvaluateResultSchema>;
