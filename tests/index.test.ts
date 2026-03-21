import * as index from '../src/index';

describe('Index module', () => {
  it('should export RubricResultSchema', () => {
    expect(index.RubricResultSchema).toBeDefined();
  });
  it('should export GevalStepsResultSchema', () => {
    expect(index.GevalStepsResultSchema).toBeDefined();
  });
  it('should export GevalEvaluateResultSchema', () => {
    expect(index.GevalEvaluateResultSchema).toBeDefined();
  });
});
