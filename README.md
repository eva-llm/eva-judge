# Project Inspiration & Attribution

This project is inspired by [promptfoo](https://github.com/promptfoo/promptfoo), including author's work on the G-Eval framework there. The LLM-as-a-judge prompts are copied from promptfoo and adapted for project-specific issues.

# eva-judge

A TypeScript/Node.js package for evaluating and managing test cases, prompts, and registry logic for AI or code evaluation workflows.

## Features
- Configuration management for evaluation workflows
- Prompt handling and manipulation
- Registry for test cases and evaluation items
- Designed for integration with Jest and other test runners

## Project Structure
- `src/` — Main source code
  - `config.ts` — Configuration logic
  - `prompt.ts` — Prompt utilities
  - `registry.ts` — Registry management
  - `index.ts` — Entry point
- `tests/` — Unit tests for all modules

## Getting Started

### Prerequisites
- Node.js (>= 16)
- pnpm (recommended) or npm/yarn

### Installation

Clone the repository and install dependencies:

```bash
pnpm install
```

### Running Tests

```bash
pnpm test
```

## Usage

Import and use the modules in your TypeScript/Node.js project:

```typescript
import { llmRubric, gEval } from 'eva-judge';
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

Evaluates a reply against criteria and derived steps using an LLM. Returns a reason and normalized score.

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

## Development
- Source code is in `src/`
- Tests are in `tests/`
- Uses TypeScript and Jest for testing

## License
MIT
