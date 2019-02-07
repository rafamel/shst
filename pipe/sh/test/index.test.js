// TODO test that __internal_object__ and $type
// exist for all structs, as we depend on it

module.exports = function(sh) {
  const { syntax } = sh;

  test('test', () => {
    expect(() => syntax.NewParser()).not.toThrow();
  });
};
