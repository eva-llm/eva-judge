import { generateText, Output } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { mistral } from '@ai-sdk/mistral';
import Mustache from 'mustache';
import z from 'zod';

import {
  GEVAL_EVALUATE_PROMPT,
  GEVAL_STEPS_PROMPT,
  LLM_RUBRIC_SYSTEM_PROMPT,
  LLM_RUBRIC_USER_PROMPT,
} from './prompt';


export const PROVIDERS: Record<string, Function> = {
    openai,
    anthropic,
    google,
    mistral,
};

export interface EvalOptions {
  temperature?: number;
  providerOptions?: Record<string, any>;
}

export const RubricResultSchema = z.object({
  reason: z.string().describe('Detailed explanation of the score based on the rubric'),
  pass: z.boolean().describe('Whether the output satisfies the minimum requirements'),
  score: z.number().min(0).max(1).describe('Numeric representation of quality'),
});
export type RubricResult = z.infer<typeof RubricResultSchema>;

export const GevalStepsResultSchema = z.object({
  steps: z.array(z.string()).describe('List of concise evaluation steps derived from the criteria'),
});
export type GevalStepsResult = z.infer<typeof GevalStepsResultSchema>;

export const GevalEvaluateResultSchema = z.object({
  reason: z.string().describe('Detailed explanation of the score based on the rubric'),
  score: z.number().min(0).max(10).describe('Numeric representation of quality'),
});
export type GevalEvaluateResult = z.infer<typeof GevalEvaluateResultSchema>;

export async function llmRubric(
  output: string,
  rubric: string,
  provider: string,
  model: string,
  options: EvalOptions = {}
): Promise<RubricResult> {
  const userPrompt = Mustache.render(LLM_RUBRIC_USER_PROMPT, { output, rubric });

  const { output: result } = await generateText({
    model: PROVIDERS[provider](model),
    system: LLM_RUBRIC_SYSTEM_PROMPT,
    prompt: userPrompt,
    output: Output.object({
      schema: RubricResultSchema,
    }),
    ...options,
  });

  return result;
}

export async function gEval(
  prompt: string,
  answer: string,
  criteria: string,
  provider: string,
  model: string,
  options: EvalOptions = {}
): Promise<GevalEvaluateResult> {
  const stepsPrompt = Mustache.render(GEVAL_STEPS_PROMPT, { criteria });

  const { output: stepsResult } = await generateText({
    model: PROVIDERS[provider](model),
    prompt: stepsPrompt,
    output: Output.object({
      schema: GevalStepsResultSchema,
    }),
    ...options,
  });

  const evaluationPrompt = Mustache.render(GEVAL_EVALUATE_PROMPT, {
    criteria,
    steps: stepsResult.steps.join('\n- '),
    input: prompt,
    output: answer,
    maxScore: 10, // NOTE: Hardcoded to 10 because it's optimal for G-Eval, but can be made configurable in the future if needed
  });

  const { output: evalResult } = await generateText({
    model: PROVIDERS[provider](model),
    prompt: evaluationPrompt,
    output: Output.object({
      schema: GevalEvaluateResultSchema,
    }),
    ...options,
  });

  return evalResult;
}
