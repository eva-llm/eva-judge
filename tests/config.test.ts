import CONF from '../src/config';

describe('Config module', () => {
  it('should have a default export', () => {
    expect(CONF).toBeDefined();
  });
});
