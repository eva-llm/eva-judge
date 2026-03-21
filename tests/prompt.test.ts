import * as prompt from '../src/prompt';

describe('Prompt module', () => {
  it('should export LLM_RUBRIC_SYSTEM_PROMPT', () => {
    expect(prompt.LLM_RUBRIC_SYSTEM_PROMPT).toBeDefined();
  });
  it('should export LLM_RUBRIC_USER_PROMPT', () => {
    expect(prompt.LLM_RUBRIC_USER_PROMPT).toBeDefined();
  });
  it('should export GEVAL_STEPS_PROMPT', () => {
    expect(prompt.GEVAL_STEPS_PROMPT).toBeDefined();
  });
  it('should export GEVAL_EVALUATE_PROMPT', () => {
    expect(prompt.GEVAL_EVALUATE_PROMPT).toBeDefined();
  });
});
