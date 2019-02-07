// TODO test that __internal_object__ and $type
// exist for all structs, as we depend on it

export default function(sh) {
  const { syntax } = sh;

  test('test', () => {
    expect(() => syntax.NewParser()).not.toThrow();
  });
}
