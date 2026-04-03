import { LRUCache } from 'lru-cache';
import { type LanguageModel } from 'ai';

import { type EvalMethod, type IStepsCache } from './types';

/**
 * In-memory implementation of IStepsCache using an LRU (Least Recently Used) cache.
 * Useful for fast, ephemeral caching of evaluation steps during runtime.
 */
class StepsMemoryAdapter implements IStepsCache {
  private cache: LRUCache<string, string[]>;

  /**
   * Construct a new StepsMemoryAdapter.
   * @param size Maximum number of items to store in the cache.
   */
  constructor(size: number) {
    this.cache = new LRUCache({ max: size });
  }

  /**
   * Store an array of steps in the cache for a given key.
   * @inheritdoc
   */
  async set(key: string, value: string[]): Promise<void> {
    this.cache.set(key, value);
  }

  /**
   * Retrieve an array of steps from the cache for a given key.
   * @inheritdoc
   */
  async get(key: string): Promise<string[] | undefined> {
    return this.cache.get(key);
  }
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

/**
 * Global configuration and cache management for evaluation operations.
 * Provides options for enabling/disabling model and steps caching, and allows
 * customization of cache implementations and event hooks.
 */
export default {
  /**
   * Maximum score for evaluation (used for normalization).
   */
  gevalMaxScore: 10,
  /**
   * Whether model caching is enabled (for LLM instances).
   */
  isModelCached: true,
  /**
   * Whether steps caching is enabled (for evaluation steps).
   */
  isStepsCached: true,
  /**
   * LRU cache for language model instances.
   */
  modelCache: new LRUCache<string, LanguageModel>({ max: 100 }),
  /**
   * Cache for evaluation steps (criteria → steps).
   */
  stepsCache: new StepsMemoryAdapter(500) as IStepsCache,
  /**
   * Restart the model cache with a new maximum size.
   * @param size The new cache size (default: 100).
   */
  restartModelCache(size: number = 100) {
    this.modelCache = new LRUCache<string, LanguageModel>({ max: size });
  },
  /**
   * Restart the steps cache with a new maximum size.
   * @param size The new cache size (default: 500).
   */
  restartStepsCache(size: number = 500) {
    this.stepsCache = new StepsMemoryAdapter(size) as IStepsCache;
  },
  /**
   * Set a custom steps cache implementation.
   * @param cache The new IStepsCache implementation to use.
   */
  setStepsCache(cache: IStepsCache) {
    this.stepsCache = cache;
  },
  /**
   * Enable model caching (LLM instances).
   */
  enableModelCache() {
    this.isModelCached = true;
  },
  /**
   * Disable model caching (LLM instances).
   */
  disableModelCache() {
    this.isModelCached = false;
  },
  /**
   * Enable steps caching (criteria → steps).
   */
  enableStepsCache() {
    this.isStepsCached = true;
  },
  /**
   * Disable steps caching (criteria → steps).
   */
  disableStepsCache() {
    this.isStepsCached = false;
  },
  /**
   * Hooks for evaluation events (success/error notifications).
   */
  hooks: {} as EvaHooks,
  /**
   * Set the hooks for evaluation events.
   * @param hooks The hooks object implementing EvaHooks.
   */
  setHooks(hooks: EvaHooks) {
    this.hooks = hooks;
  }
};
