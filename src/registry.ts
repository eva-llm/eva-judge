import * as crypto from 'node:crypto';
import { type LanguageModel } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { mistral } from '@ai-sdk/mistral';
import { bedrock } from '@ai-sdk/amazon-bedrock';
import { azure } from '@ai-sdk/azure';
import { deepseek } from '@ai-sdk/deepseek';
import { groq } from '@ai-sdk/groq';
import { perplexity } from '@ai-sdk/perplexity';
import { xai } from '@ai-sdk/xai';

import CONF from './config';


/**
 * Map of provider names to provider functions.
 */
const PROVIDERS: Record<string, Function> = {
  openai,
  anthropic,
  google,
  mistral,
  bedrock,
  azure,
  deepseek,
  groq,
  perplexity,
  xai,
};

/**
 * Get a language model instance from the provider and model name, using cache if enabled.
 * @param providerName The provider name (e.g., 'openai').
 * @param modelName The model name.
 * @returns The language model instance.
 */
export const getModel = (providerName: string, modelName: string): LanguageModel => {
  const cacheKey = `${providerName}:${modelName}`;

  let model = CONF.isModelCached ? CONF.modelCache.get(cacheKey) : undefined;

  if (!model) {
    const provider = PROVIDERS[providerName];

    if (!provider) {
      throw new Error(`Unknown provider: "${providerName}". Available providers: ${Object.keys(PROVIDERS).join(', ')}`);
    }

    model = provider(modelName);

    if (CONF.isModelCached) {
      CONF.modelCache.set(cacheKey, model);
    }
  }

  return model!;
}

/**
 * Compute the MD5 hash of a string.
 * @param str The input string.
 * @returns The MD5 hash as a hex string.
 */
const md5 = (str: string): string => {
  return crypto.createHash('md5').update(str).digest('hex');
}

/**
 * Get cached evaluation steps for a criteria, if caching is enabled.
 * @param criteria The evaluation criteria string.
 * @returns Promise resolving to the cached steps or undefined.
 */
export const getSteps = (criteria: string): Promise<string[] | undefined> => {
  return CONF.isStepsCached ? CONF.stepsCache.get(md5(criteria)) : Promise.resolve(undefined);
}

/**
 * Set evaluation steps for a criteria in the cache, if caching is enabled.
 * @param criteria The evaluation criteria string.
 * @param steps The steps to cache.
 * @returns Promise that resolves when the steps are set.
 */
export const setSteps = (criteria: string, steps: string[]): Promise<void> => {
  if (CONF.isStepsCached) {
    return CONF.stepsCache.set(md5(criteria), steps);
  }

  return Promise.resolve();
}
