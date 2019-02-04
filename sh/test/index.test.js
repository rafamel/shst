export default function(sh) {
  const { syntax } = sh;

  test('test', () => {
    expect(() => syntax.NewParser()).not.toThrow();
  });
}
