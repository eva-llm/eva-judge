import crypto from 'node:crypto';
import * as Mustache from 'mustache';
import {
  generateText,
  Output,
} from 'ai';

import CONF from './config';
import {
  GEVAL_EVALUATE_PROMPT,
  GEVAL_EVALUATE_REPLY_PROMPT,
  GEVAL_STEPS_PROMPT,
  GEVAL_SYSTEM_PROMPT,
  LLM_RUBRIC_SYSTEM_PROMPT,
  LLM_RUBRIC_USER_PROMPT,
} from './prompt';
import {
  getModel,
  getSteps,
  setSteps,
} from './registry';
import {
  type TVercelOptions,
  type TJudgeMethod,
  type TGevalInput,
  type TRubricResult,
  type TGevalEvaluateResult,
  RubricResultSchema,
  GevalStepsResultSchema,
  GevalEvaluateResultSchema,
} from './types';

export * from './config';
export { default } from './config';
export * from './types';

const getHashId = () => crypto.randomBytes(16).toString('hex'); // NOTE: 16 bytes = 128 bits of entropy, should be sufficient for uniqueness in prompts

/**
 * Evaluate output against a rubric using an LLM.
 * Uses a system and user prompt to instruct the LLM to grade the output according to the rubric.
 * @param output The output to grade.
 * @param rubric The rubric to use for grading.
 * @param providerName The provider name for the LLM.
 * @param modelName The model name for the LLM.
 * @param options Optional evaluation options (temperature, providerOptions, etc).
 * @returns The rubric result (reason, pass, score).
 */
export const llmRubric = async (
  output: string,
  rubric: string,
  providerName: string,
  modelName: string,
  options: TVercelOptions = {}
): Promise<TRubricResult> => {
  const start = Date.now();
  try {
    const userPrompt = Mustache.render(LLM_RUBRIC_USER_PROMPT, { output, rubric });

    const { output: result } = await generateText({
     ...options, // NOTE: if option accidently includes 'system' or 'prompt', it will be overridden by correct values.
      model: getModel(providerName, modelName),
      system: Mustache.render(LLM_RUBRIC_SYSTEM_PROMPT, { hash_id: getHashId() }),
      prompt: userPrompt,
      output: Output.object({
        schema: RubricResultSchema,
      }),
   });

    CONF.hooks.onSuccess?.({
      method: 'llmRubric',
      params: { output, rubric, providerName, modelName, options },
      result,
      duration: Date.now() - start,
    });

    return result;
  } catch (error) {

    CONF.hooks.onError?.({
      method: 'llmRubric',
      error,
      duration: Date.now() - start,
    });

    throw error;
  }
}

const _gEval = async (
  input: TGevalInput,
  criteria: string,
  providerName: string,
  modelName: string,
  maxScore: number,
  methodName: TJudgeMethod,
  options: TVercelOptions = {}
): Promise<TGevalEvaluateResult> => {
  if (typeof input === 'string') {
    input = { query: '', answer: input };
  }
  const { query, answer } = input;

  const start = Date.now();

  try {
    const model = getModel(providerName, modelName);
    let steps = await getSteps(criteria);

    if (!steps) {
      const stepsPrompt = Mustache.render(GEVAL_STEPS_PROMPT, { criteria });

      const { output: stepsResult } = await generateText({
        ...options, // NOTE: if option accidently includes 'system' or 'prompt', it will be overridden by correct values.
        system: undefined, // NOTE: no system prompt for steps generation, just the criteria in the user prompt.
        model,
        prompt: stepsPrompt,
        output: Output.object({
          schema: GevalStepsResultSchema,
        }),
      });

      steps = stepsResult.steps;

      setSteps(criteria, stepsResult.steps); // NOTE: cache asynchronously, without awaiting
    }

    const evaluationPrompt = Mustache.render(
      query ? GEVAL_EVALUATE_PROMPT : GEVAL_EVALUATE_REPLY_PROMPT,
      {
        criteria,
        steps: steps.join('\n- '),
        input: query,
        output: answer,
        maxScore,
      });

    const { output: evalResult } = await generateText({
      ...options, // NOTE: if option accidently includes 'system' or 'prompt', it will be overridden by correct values.
      model,
      system: Mustache.render(GEVAL_SYSTEM_PROMPT, { hash_id: getHashId() }),
      prompt: evaluationPrompt,
      output: Output.object({
        schema: GevalEvaluateResultSchema,
      }),
      ...options,
    });

    const result = {
      reason: evalResult.reason,
      score: evalResult.score / maxScore,
    };

    CONF.hooks.onSuccess?.({
      method: methodName,
      params: { query, answer, criteria, providerName, modelName, options },
      result,
      duration: Date.now() - start,
    });

    return result;
  } catch (error) {

    CONF.hooks.onError?.({
      method: methodName,
      error,
      duration: Date.now() - start,
    });

    throw error;
  }
}

/**
 * Evaluate an input against criteria and steps using an LLM-as-a-Judge G-Eval with gradient scoring 0.0-1.0.
 * If steps for the criteria are not cached, generates them first, then evaluates the answer.
 * @param input The input containing text or query-answer to evaluate.
 * @param criteria The evaluation criteria (used to derive steps).
 * @param providerName The provider name for the LLM.
 * @param modelName The model name for the LLM.
 * @param options Optional evaluation options (temperature, providerOptions, etc).
 * @returns The evaluation result with normalized score (reason, score).
 */
export const gEval = async (
  input: TGevalInput,
  criteria: string,
  providerName: string,
  modelName: string,
  options: TVercelOptions = {}
): Promise<TGevalEvaluateResult> => _gEval(
  input,
  criteria,
  providerName,
  modelName,
  CONF.gevalMaxScore,
  'gEval',
  options,
);

/**
 * Evaluate an input against criteria and steps using an LLM-as-a-Judge G-Eval with binary scoring 0|1.
 * If steps for the criteria are not cached, generates them first, then evaluates the answer.
 * @param input The input containing text or query-answer to evaluate.
 * @param criteria The evaluation criteria (used to derive steps).
 * @param providerName The provider name for the LLM.
 * @param modelName The model name for the LLM.
 * @param options Optional evaluation options (temperature, providerOptions, etc).
 * @returns The evaluation result with normalized score (reason, score).
 */
export const bEval = async (
  input: TGevalInput,
  criteria: string,
  providerName: string,
  modelName: string,
  options: TVercelOptions = {}
): Promise<TGevalEvaluateResult> => _gEval(
  input,
  criteria,
  providerName,
  modelName,
  1,
  'bEval',
  options,
);
