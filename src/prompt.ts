/*!
 * Portions of this code are based on Promptfoo (MIT License)
 * Copyright (c) 2025 Promptfoo
 */

/**
 * System prompt for LLM rubric-based grading. Guides the LLM to grade output according to a rubric and respond with a JSON object.
 */
export const LLM_RUBRIC_SYSTEM_PROMPT = `You are grading output according to a user-specified rubric. If the statement in the rubric is true, then the output passes the test. And score 1.0 indicates full compliance with the rubric, but 0.0 indicates no compliance at all. You respond with a JSON object with this structure: {reason: string, pass: boolean, score: number}

Examples:

<Output>Hello world</Output>
<Rubric>Content contains a greeting</Rubric>
{"reason": "the content contains the word 'Hello'", "pass": true, "score": 1.0}

<Output>Avast ye swabs, repel the invaders!</Output>
<Rubric>Does not speak like a pirate</Rubric>
{"reason": "'avast ye' is a common pirate term", "pass": false, "score": 0.0}
`;

/**
 * User prompt template for rubric-based grading. Used to inject output and rubric into the prompt.
 */
export const LLM_RUBRIC_USER_PROMPT = '<Output>\n{{output}}\n</Output>\n<Rubric>\n{{rubric}}\n</Rubric>';

/**
 * System prompt for generating evaluation steps from criteria. Guides the LLM to output a minified JSON array of steps.
 */
export const GEVAL_STEPS_PROMPT = `
Given an evaluation criteria which outlines how you should judge a piece of text, generate 3-4 concise evaluation steps applicable to any text based on the criteria below and designed to confirm the criteria.

**EVALUATION CRITERIA**
<Criteria>
{{criteria}}
</Criteria>

**OUTPUT FORMAT**
IMPORTANT:
- Return output ONLY as a minified JSON object (no code fences).
- The JSON object must contain a single key, "steps", whose value is a list of strings.
- Each string must represent one evaluation step.
- Do NOT include any explanations, commentary, extra text, or additional formatting.

Format:
{"steps": <list_of_strings>}

Example:
{"steps":["<Evaluation Step 1>","<Evaluation Step 2>","<Evaluation Step 3>","<Evaluation Step 4>"]}

Here are the 3-4 concise evaluation steps, formatted as required in a minified JSON:
JSON:
`;

/**
 * System prompt for evaluating a reply against criteria and steps. Guides the LLM to return a JSON with score and reason.
 */
export const GEVAL_EVALUATE_REPLY_PROMPT = `
You will be given one Reply below. Your task is to rate the Reply on one metric.
Please make sure you read and understand these instructions carefully. Please keep this document open while reviewing, and refer to it as needed.

**Evaluation Criteria**
<Criteria>
{{criteria}}
</Criteria>

**Evaluation Steps**
- {{steps}}
Given the evaluation steps, return a JSON with two keys: 
  1) a "score" key that MUST be an integer from 0 to {{maxScore}}, where {{maxScore}} indicates that the Evaluation Criteria is fully and clearly present in the Reply according to the Evaluation Steps, and 0 indicates the total absence of the Evaluation Criteria;
  2) a "reason" key, a reason for the given score, but DO NOT QUOTE THE SCORE in your reason. Please mention specific information from Reply in your reason, but be very concise with it!

**Reply**
<Reply>
{{output}}
</Reply>

**OUTPUT FORMAT**
IMPORTANT: 
- Return output ONLY as a minified JSON object (no code fences).
- The JSON object must contain exactly two keys: "score" and "reason".
- No additional words, explanations, or formatting are needed.
- Absolutely no additional text, explanations, line breaks, or formatting outside the JSON object are allowed.

Example JSON:
{"score":0,"reason":"The text of Reply does not follow the evaluation criteria provided."}

Here is the final evaluation in the required minified JSON format:
JSON:
`;

/**
 * System prompt for evaluating a reply with prompt against criteria and steps. Guides the LLM to return a JSON with score and reason.
 */
export const GEVAL_EVALUATE_PROMPT = `
You will be given one Reply for a Prompt below. Your task is to rate the Reply on one metric.
Please make sure you read and understand these instructions carefully. Please keep this document open while reviewing, and refer to it as needed.

**Evaluation Criteria**
<Criteria>
{{criteria}}
</Criteria>

**Evaluation Steps**
- {{steps}}
Given the evaluation steps, return a JSON with two keys: 
  1) a "score" key that MUST be an integer from 0 to {{maxScore}}, where {{maxScore}} indicates that the Evaluation Criteria is fully and clearly present in the Reply according to the Evaluation Steps, and 0 indicates the total absence of the Evaluation Criteria;
  2) a "reason" key, a reason for the given score, but DO NOT QUOTE THE SCORE in your reason. Please mention specific information from Prompt and Reply in your reason, but be very concise with it!

**Prompt**
<Prompt>
{{input}}
</Prompt>

**Reply**
<Reply>
{{output}}
</Reply>

**OUTPUT FORMAT**
IMPORTANT: 
- Return output ONLY as a minified JSON object (no code fences).
- The JSON object must contain exactly two keys: "score" and "reason".
- No additional words, explanations, or formatting are needed.
- Absolutely no additional text, explanations, line breaks, or formatting outside the JSON object are allowed.

Example JSON:
{"score":0,"reason":"The text of Reply does not follow the evaluation criteria provided."}

Here is the final evaluation in the required minified JSON format:
JSON:
`;
