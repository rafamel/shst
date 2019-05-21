import get, { declaration } from '../pkg';
import path from 'path';
import fs from 'fs-extra';
import Ajv from 'ajv';
import typesSchema from './types-schema';

// TODO test ShError
const sh = get();
const parser = (): any => sh.syntax.NewParser();
const printer = (): any => sh.syntax.NewPrinter();
const parse = (str = `echo 'foo'`): any => parser().Parse(str);
const print = (tree: any): string => printer().Print(tree);
const at = (file: string): string => path.join(__dirname, '../pkg', file);

describe(`Build`, () => {
  test(`type declaration file exists`, async () => {
    await expect(fs.pathExists(at('dist-types/index.d.ts'))).resolves.toBe(
      true
    );
  });
  test(`LICENSE file exists`, async () => {
    await expect(fs.pathExists(at('SH.LICENSE'))).resolves.toBe(true);
  });
  test(`type declaration conforms to schema`, async () => {
    const ajv = new Ajv();

    var valid = ajv.validate(typesSchema, declaration);
    // eslint-disable-next-line no-console
    if (!valid) console.log(ajv.errors);
    expect(valid).toBe(true);
  });
});

describe(`Preconditions`, () => {
  test(`exports syntax, path, package, packages`, () => {
    expect(Object.keys(sh).sort()).toMatchInlineSnapshot(`
      Array [
        "package",
        "packages",
        "path",
        "syntax",
      ]
    `);
  });
  test(`sh package exists`, () => {
    expect(sh.package).toBe(sh.packages[sh.path]);
  });
  test(`sh package has node definitions (File)`, () => {
    expect(sh.package).toHaveProperty('File');
  });
  test(`nodes (File) have zero(), ptr, and ptr.nil`, () => {
    const File = sh.package.File;

    expect(File).toHaveProperty('ptr');
    expect(File.ptr).toHaveProperty('nil');
    expect(() => File.zero()).not.toThrow();
  });
  test(`File.zero() prototype is File.ptr.nil prototype`, () => {
    const File = sh.package.File;

    expect(Object.getPrototypeOf(File.zero())).toBe(
      Object.getPrototypeOf(File.ptr.nil)
    );
  });
  test(`File.zero() has all expected fields`, () => {
    const File = sh.package.File;
    const zero = File.zero();

    expect(Object.keys(zero)).toHaveLength(3);
    expect(zero.$val).toBe(zero);
    expect(Object.keys(zero)).toEqual(['$val', 'Name', 'StmtList']);
  });
  test(`File.StmtList.Stmts exists and field has array prototype`, () => {
    const File = sh.package.File;
    const zero = File.zero();

    expect(zero.StmtList).toHaveProperty('Stmts');
    expect(Object.getPrototypeOf(File.fields[1].typ.fields[0].typ.nil)).toBe(
      Object.getPrototypeOf(zero.StmtList.Stmts)
    );
  });
  test(`Stmts array internal representation has expected fields & values`, () => {
    const File = sh.package.File;
    const zero = File.zero();
    const stmts = zero.StmtList.Stmts;

    expect(stmts.$val).toBe(stmts);
    expect(Object.assign(stmts, { $val: 0 })).toEqual({
      $array: [],
      $offset: 0,
      $length: 0,
      $capacity: 0,
      $val: 0
    });
  });
  test(`Parser returns structure with __internal_object__`, () => {
    expect(parse()).toHaveProperty('__internal_object__');
    expect(parse().StmtList).toHaveProperty('__internal_object__');
  });
  test(`internal object has node prototype`, () => {
    const File = sh.package.File;

    expect(Object.getPrototypeOf(parse().__internal_object__)).toBe(
      Object.getPrototypeOf(File.ptr.nil)
    );
  });
  test(`public/private fields are marked as such`, () => {
    const File = sh.package.File;
    const Pos = sh.package.Pos;

    expect(File).toHaveProperty('fields');
    expect(Pos).toHaveProperty('fields');

    const pFile = File.fields.filter((x: any) => !x.exported);
    const pPos = Pos.fields
      .filter((x: any) => !x.exported)
      .map((x: any) => x.prop);

    expect(pFile).toHaveLength(0);
    expect(pPos).toEqual(['offs', 'line', 'col']);
  });
  test(`private fields exist on zero() object`, () => {
    const Pos = sh.package.Pos;

    expect(Object.assign(Pos.zero(), { $val: 0 })).toEqual({
      $val: 0,
      offs: 0,
      line: 0,
      col: 0
    });
  });
});

describe(`Parser`, () => {
  test(`exports Parser related fns and constants`, () => {
    expect(typeof sh.syntax.NewParser).toBe('function');
    expect(typeof sh.syntax.KeepComments).toBe('function');
    expect(typeof sh.syntax.StopAt).toBe('function');
    expect(typeof sh.syntax.Variant).toBe('function');
    expect(typeof sh.syntax.LangBash).toBe('number');
    expect(typeof sh.syntax.LangPOSIX).toBe('number');
    expect(typeof sh.syntax.LangMirBSDKorn).toBe('number');
  });
  test(`doesn't throw`, () => {
    expect(parser).not.toThrow();
  });
  test(`has methods`, () => {
    expect(typeof parser().Parse).toBe('function');
  });
  test(`parse works`, () => {
    expect(parse().StmtList).toBeTruthy();
  });
});

describe(`Printer`, () => {
  test(`exports Printer related fns`, () => {
    expect(typeof sh.syntax.Minify).toBe('function');
    expect(typeof sh.syntax.Indent).toBe('function');
    expect(typeof sh.syntax.KeepPadding).toBe('function');
    expect(typeof sh.syntax.SwitchCaseIndent).toBe('function');
    expect(typeof sh.syntax.BinaryNextLine).toBe('function');
    expect(typeof sh.syntax.SpaceRedirects).toBe('function');
  });
  test(`doesn't throw`, () => {
    expect(printer).not.toThrow();
  });
  test(`has methods`, () => {
    expect(typeof printer().Print).toBe('function');
  });
  test(`print works`, () => {
    expect(print(parse()).trim()).toBe("echo 'foo'");
  });
});

describe(`independent functions`, () => {
  test(`exports independent functions`, () => {
    expect(typeof sh.syntax.Simplify).toBe('function');
    expect(typeof sh.syntax.QuotePattern).toBe('function');
    expect(typeof sh.syntax.HasPattern).toBe('function');
    expect(typeof sh.syntax.ValidName).toBe('function');
    expect(typeof sh.syntax.SplitBraces).toBe('function');
  });
});
