import { generateText, Output } from 'ai';
import Mustache from 'mustache';
import z from 'zod';

import {
  GEVAL_EVALUATE_PROMPT,
  GEVAL_STEPS_PROMPT,
  LLM_RUBRIC_SYSTEM_PROMPT,
  LLM_RUBRIC_USER_PROMPT,
} from './prompt';
import { getModel, getSteps, setSteps } from './registry';
import CONF from './config';


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
  score: z.number().min(0).describe('Numeric representation of quality'),
});
export type GevalEvaluateResult = z.infer<typeof GevalEvaluateResultSchema>;

export const llmRubric = async (
  output: string,
  rubric: string,
  providerName: string,
  modelName: string,
  options: EvalOptions = {}
): Promise<RubricResult> => {
  const userPrompt = Mustache.render(LLM_RUBRIC_USER_PROMPT, { output, rubric });

  const { output: result } = await generateText({
    model: getModel(providerName, modelName),
    system: LLM_RUBRIC_SYSTEM_PROMPT,
    prompt: userPrompt,
    output: Output.object({
      schema: RubricResultSchema,
    }),
    ...options,
  });

  return result;
}

export const gEval = async (
  prompt: string,
  answer: string,
  criteria: string,
  providerName: string,
  modelName: string,
  options: EvalOptions = {}
): Promise<GevalEvaluateResult> => {
  const model = getModel(providerName, modelName);
  let steps = await getSteps(criteria);

  if (!steps) {
    const stepsPrompt = Mustache.render(GEVAL_STEPS_PROMPT, { criteria });

    const { output: stepsResult } = await generateText({
      model,
      prompt: stepsPrompt,
      output: Output.object({
        schema: GevalStepsResultSchema,
      }),
      ...options,
    });

    steps = stepsResult.steps;

    setSteps(criteria, stepsResult.steps);
  }

  const evaluationPrompt = Mustache.render(GEVAL_EVALUATE_PROMPT, {
    criteria,
    steps: steps.join('\n- '),
    input: prompt,
    output: answer,
    maxScore: CONF.gevalMaxScore,
  });

  const { output: evalResult } = await generateText({
    model,
    prompt: evaluationPrompt,
    output: Output.object({
      schema: GevalEvaluateResultSchema,
    }),
    ...options,
  });

  return evalResult;
}
