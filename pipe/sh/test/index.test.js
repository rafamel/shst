const sh = require('../build/lib/index');

test('test', () => {
  expect(() => sh.syntax.NewParser()).not.toThrow();
});
