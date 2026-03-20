export const LLM_RUBRIC_SYSTEM_PROMPT = `You are grading output according to a user-specified rubric. If the statement in the rubric is true, then the output passes the test. You respond with a JSON object with this structure: {reason: string, pass: boolean, score: number}

Examples:

<Output>Hello world</Output>
<Rubric>Content contains a greeting</Rubric>
{"reason": "the content contains the word 'Hello'", "pass": true, "score": 1.0}

<Output>Avast ye swabs, repel the invaders!</Output>
<Rubric>Does not speak like a pirate</Rubric>
{"reason": "'avast ye' is a common pirate term", "pass": false, "score": 0.0}
`;

export const LLM_RUBRIC_USER_PROMPT = '<Output>\n{{output}}\n</Output>\n<Rubric>\n{{rubric}}\n</Rubric>';

export const GEVAL_STEPS_PROMPT = `
Given an evaluation criteria which outlines how you should judge a piece of text, generate 3-4 concise evaluation steps applicable to any text based on the criteria below.

**EVALUATION CRITERIA**
{{criteria}}

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

export const GEVAL_EVALUATE_PROMPT = `
You will be given one Reply for a Prompt below. Your task is to rate the Reply on one metric.
Please make sure you read and understand these instructions carefully. Please keep this document open while reviewing, and refer to it as needed.

**Evaluation Criteria**
{{criteria}}

**Evaluation Steps**
- {{steps}}
Given the evaluation steps, return a JSON with two keys: 
  1) a "score" key that MUST be an integer from 0 to {{maxScore}}, with {{maxScore}} being that Reply follows the Evaluation Criteria outlined in the Evaluation Steps and 0 being that Reply does not;
  2) a "reason" key, a reason for the given score, but DO NOT QUOTE THE SCORE in your reason. Please mention specific information from Prompt and Reply in your reason, but be very concise with it!

**Prompt**
{{input}}

**Reply**
{{output}}

**OUTPUT FORMAT**
IMPORTANT: 
- Return output ONLY as a minified JSON object (no code fences).
- The JSON object must contain exactly two keys: "score" and "reason".
- No additional words, explanations, or formatting are needed.
- Absolutely no additional text, explanations, line breaks, or formatting outside the JSON object are allowed.

Example JSON:
{"score":0,"reason":"The text of reply does not follow the evaluation criteria provided."}

Here is the final evaluation in the required minified JSON format:
JSON:
`;
