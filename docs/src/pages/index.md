A TypeScript/Node.js library for automated text evaluation with AI analysis through **LLM-Rubric**, **G-Eval**, or **B-Eval** (Binary G-Eval).

## Project Inspiration & Attribution

This project is inspired by [promptfoo](https://github.com/promptfoo/promptfoo), including [author's work](https://github.com/promptfoo/promptfoo/issues?q=state%3Aclosed%20is%3Apr%20author%3A%40schipiga) on the [G-Eval](https://www.promptfoo.dev/docs/configuration/expected-outputs/model-graded/g-eval/) framework there.<br />
The LLM-as-a-Judge prompts are copied from promptfoo and adapted for project-specific issues.

## Quick Start

```bash
npm install @eva-llm/eva-judge
```

```ts
import { llmRubric, gEval, bEval } from '@eva-llm/eva-judge';

const prompt = 'Hello! How are you?';
const answer = 'Hi! I am fine. And you?';

await llmRubric(answer, 'answer is polite', 'openai', 'gpt-4.1-mini');
// { pass: true, score: 1, reason: "The answer is definitely polite and sympathetic" }

await gEval(prompt, answer, 'answer is relevant to question', 'openai', 'gpt-4.1-mini');
// { score: 0.9, reason: 'The answer is quite well relevant to the question' }

await bEval(prompt, answer, 'answer is coherent to question', 'openai', 'gpt-4.1-mini');
// { score: 1, reason: 'The answer is definitely coherent to the question' }
```

## API
### llmRubric

Evaluates an output against a rubric using an LLM. Returns a reason, pass/fail, and normalized score.

```typescript
const result = await llmRubric(
  output,      // string: the output to grade
  rubric,      // string: the rubric to use
  provider,    // string: LLM provider name
  model,       // string: LLM model name
  options      // optional: { temperature, providerOptions }
);
// result: { reason: string, pass: boolean, score: number }
```

### gEval

Evaluates a reply against criteria and derived steps using an LLM. Returns a reason and normalized score (0.0-1.0).

```typescript
const result = await gEval(
  prompt,      // string: the prompt given to the model
  answer,      // string: the reply to evaluate
  criteria,    // string: evaluation criteria
  provider,    // string: LLM provider name
  model,       // string: LLM model name
  options      // optional: { temperature, providerOptions }
);
// result: { reason: string, score: number }
```

### bEval (Binary G-Eval)

Evaluates a reply against criteria and derived steps using an LLM, but with binary scoring (0 or 1). Returns a reason and a normalized score (0 or 1).

```typescript
const result = await bEval(
  prompt,      // string: the prompt given to the model
  answer,      // string: the reply to evaluate
  criteria,    // string: evaluation criteria
  provider,    // string: LLM provider name
  model,       // string: LLM model name
  options      // optional: { temperature, providerOptions }
);
// result: { reason: string, score: number } // score will be 0 or 1
```

## Supported Providers

The following LLM providers are supported (via [Vercel ai-sdk](https://github.com/vercel/ai)): 

- OpenAI (`openai`)
- Anthropic (`anthropic`)
- Google (`google`)
- Mistral (`mistral`)
- Amazon Bedrock (`bedrock`)
- Azure (`azure`)
- DeepSeek (`deepseek`)
- Groq (`groq`)
- Perplexity (`perplexity`)
- xAI (`xai`)

Specify the provider name and model name in `llmRubric`, `gEval`, or `bEval`.

> **Note:** Each provider integration is based on its respective ai-sdk package. Be sure to follow the provider's documentation for setup and authentication. Most providers require you to export an API key or token as an environment variable (e.g., `export OPENAI_API_KEY=...`).

## Enterprise
### LLM Judge Hooks

You can provide hooks to receive notifications about evaluation events (success or error) for logging, monitoring, or custom handling. Hooks can also be used to integrate with observability tools such as OpenTelemetry for tracing and metrics. Set these in the config:

```typescript
import Config from '@eva-llm/eva-judge';

Config.hooks = {
  onSuccess: ({ method, params, result, duration }) => {
    // handle successful evaluation
  },
  onError: ({ method, error, duration }) => {
    // handle evaluation error
  }
};
```

### Configuring

```ts
import Config from '@eva-llm/eva-judge';

Config.restartModelCache(500); // cache 500 (default 100) models by provider:model with LRU Cache
Config.restartStepsCache(1000); // cache 1000 (default 500) Evaluations Steps by criteria with LRU Cache
Config.enableModelCache();
Config.disableModelCache();
Config.enableStepsCache();
Config.disableStepsCache();
```

### G-Eval/B-Eval Evaluation Steps Persistent Storage

For advanced use, you can implement your own cache storage for evaluation steps (e.g., using Redis or another backend) by providing a custom cache via `setStepsCache()`:

```typescript
import Config, { type IStepsCache } from '@eva-llm/eva-judge';

class RedisCache implements IStepsCache {
...
};

Config.setStepsCache(RedisCache);
```

## License

MIT
