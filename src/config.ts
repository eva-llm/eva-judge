import { LRUCache } from 'lru-cache';
import { type LanguageModel } from 'ai';


interface IStepsCache {
    set(key: string, value: string[]): Promise<void>;
    get(key: string): Promise<string[] | undefined>;
};

class StepsMemoryAdapter implements IStepsCache {
    private cache: LRUCache<string, string[]>;

    constructor(size: number) {
        this.cache = new LRUCache({ max: size });
    }

    async set(key: string, value: string[]): Promise<void> {
        this.cache.set(key, value);
    }

    async get(key: string): Promise<string[] | undefined> {
        return this.cache.get(key);
    }
}

export default {
  gevalMaxScore: 10,
  isModelCached: true,
  isStepsCached: true,
  modelCache: new LRUCache<string, LanguageModel>({ max: 100 }),
  stepsCache: new StepsMemoryAdapter(500) as IStepsCache,

  restartModelCache(size: number = 100) {
    this.modelCache = new LRUCache<string, LanguageModel>({ max: size });
  },

  restartStepsCache(size: number = 500) {
    this.stepsCache = new StepsMemoryAdapter(size) as IStepsCache;
  },

  setStepsCache(cache: IStepsCache) {
    this.stepsCache = cache;
  },

  enableModelCache() {
    this.isModelCached = true;
  },

  disableModelCache() {
    this.isModelCached = false;
  },

  enableStepsCache() {
    this.isStepsCached = true;
  },
  
  disableStepsCache() {
    this.isStepsCached = false;
  },
};
