import * as registry from '../src/registry';

describe('Registry module', () => {
  it('should export getModel', () => {
    expect(registry.getModel).toBeDefined();
  });
});
