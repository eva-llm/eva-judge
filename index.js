// eva-judge: LLM-as-a-judge abstraction layer
// Node.js >=22, pnpm, ai-sdk planned

/**
 * Evaluates an answer using a rubric prompt with an LLM.
 * @param {string} prompt - The rubric or evaluation prompt.
 * @param {string} answer - The answer to be judged.
 * @returns {Promise<any>} - The evaluation result (to be implemented).
 */
async function llmRubric(prompt, answer) {
  // TODO: Implement using ai-sdk and plugins (OpenAI, Gemini, etc.)
  throw new Error('llmRubric not implemented yet');
}

/**
 * General evaluation function for LLM-based judging.
 * @param {string} prompt - The evaluation prompt.
 * @param {string} answer - The answer to be judged.
 * @returns {Promise<any>} - The evaluation result (to be implemented).
 */
async function gEval(prompt, answer) {
  // TODO: Implement using ai-sdk and plugins (OpenAI, Gemini, etc.)
  throw new Error('gEval not implemented yet');
}

module.exports = { llmRubric, gEval };
