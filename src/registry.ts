import crypto from 'node:crypto';
import { type LanguageModel } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { mistral } from '@ai-sdk/mistral';

import CONF from './config';


const PROVIDERS: Record<string, Function> = {
  openai,
  anthropic,
  google,
  mistral,
};

export const getModel = (providerName: string, modelName: string): LanguageModel => {
  const cacheKey = `${providerName}:${modelName}`;

  let model = CONF.modelCache.get(cacheKey);

  if (!model) {
    const provider = PROVIDERS[providerName];

    if (!provider) {
      throw new Error(`Unknown provider: "${providerName}". Available providers: ${Object.keys(PROVIDERS).join(', ')}`);
    }

    model = provider(modelName);

    CONF.modelCache.set(cacheKey, model);
  }

  return model!;
}

const md5 = (str: string): string => {
  return crypto.createHash('md5').update(str).digest('hex');
}

export const getSteps = (criteria: string): Promise<string[] | undefined> => {
  return CONF.stepsCache.get(md5(criteria));
}

export const setSteps = (criteria: string, steps: string[]): Promise<void> => {
  return CONF.stepsCache.set(md5(criteria), steps);
}
