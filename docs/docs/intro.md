---
sidebar_position: 1
---

# Project Inspiration & Attribution

This project is inspired by [promptfoo](https://github.com/promptfoo/promptfoo), including author's work on the G-Eval framework there. The LLM-as-a-Judge prompts are copied from promptfoo and adapted for project-specific issues.

# eva-judge

A TypeScript/Node.js package for evaluating and managing test cases, prompts, and registry logic for AI or code evaluation workflows with LLM-Rubric or G-Eval.

## Features
- Configuration management for evaluation workflows
- Prompt handling and manipulation
- Registry for test cases and evaluation items
- Designed for integration with Jest and other test runners

## Getting Started

### Installation

```bash
npm install @eva-llm/eva-judge
# or
pnpm add @eva-llm/eva-judge
```

### Running Tests

```bash
pnpm test
```

## Usage

Import and use the modules in your TypeScript/Node.js project:

```typescript
import { llmRubric, gEval, bEval } from '@eva-llm/eva-judge';
```

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

Evaluates a reply against criteria and derived steps using an LLM. Returns a reason and normalized score (0.0–1.0).

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

## Development
- Source code is in `src/`
- Tests are in `tests/`
- Uses TypeScript and Jest for testing

## License
MIT

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

Specify the provider name and model name in `llmRubric` or `gEval`.

> **Note:** Each provider integration is based on its respective ai-sdk package. Be sure to follow the provider's documentation for setup and authentication. Most providers require you to export an API key or token as an environment variable (e.g., `export OPENAI_API_KEY=...`).

## Hooks

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

For advanced use, you can implement your own cache storage for evaluation steps (e.g., using Redis or another backend) by providing a custom cache via `setStepsCache()`:

```typescript
import Config from '@eva-llm/eva-judge';

Config.setStepsCache(RedisCache); // RedisCache must implement IStepsCache
```

See `src/config.ts` for more details on available hooks and configuration options.
