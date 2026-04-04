import {
  llmRubric,
  gEval,
  bEval,
} from '../src/index';

const PROVIDER = 'openai';
const MODEL = 'gpt-4.1-mini';

async function main() {
  const query = 'What is the capital of France?';
  const answer = 'The capital of France is Paris.';

  console.log('LLM-Rubric', await llmRubric(
    answer,
    'text should be factually correct',
    PROVIDER,
    MODEL,
  ));

  console.log('G-Eval text', await gEval(
    answer,
    'text should be factually correct',
    PROVIDER,
    MODEL,
  ));

  console.log('B-Eval text', await bEval(
    answer,
    'text should be factually correct',
    PROVIDER,
    MODEL,
  ));

  console.log('G-Eval query-answer', await gEval(
    { query, answer },
    'answer should be coherent to question',
    PROVIDER,
    MODEL,
  ));

  console.log('B-Eval query-answer', await bEval(
    { query, answer },
    'answer should be coherent to question',
    PROVIDER,
    MODEL,
  ));
}

main().catch(console.error);
