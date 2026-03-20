import crypto from 'node:crypto';
import { type LanguageModel } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { mistral } from '@ai-sdk/mistral';
import { LRUCache } from 'lru-cache/raw';


const PROVIDERS: Record<string, Function> = {
  openai,
  anthropic,
  google,
  mistral,
};

const modelCache = new LRUCache<string, LanguageModel>({ max: 100 });
const stepsCache = new LRUCache<string, string[]>({ max: 500 });

export const getModel = (providerName: string, modelName: string): LanguageModel => {
  const cacheKey = `${providerName}:${modelName}`;

  let model = modelCache.get(cacheKey);

  if (!model) {
    model = PROVIDERS[providerName](modelName);

    modelCache.set(cacheKey, model);
  }

  return model!;
}

const md5 = (str: string) => {
  return crypto.createHash('md5').update(str).digest('hex');
}

export const getSteps = (criteria: string) => {
  return stepsCache.get(md5(criteria));
}

export const setSteps = (criteria: string, steps: string[]) => {
  stepsCache.set(md5(criteria), steps);
}
