const sh = require('../build/lib/index');
const types = require('../build/lib/sh.types.json');
const fs = require('fs');
const path = require('path');
const draft06 = require('ajv/lib/refs/json-schema-draft-06.json');
const Ajv = require('ajv');
const typesSchema = require('./types-schema');

const parser = () => sh.syntax.NewParser();
const printer = () => sh.syntax.NewPrinter();
const parse = (str = "echo 'foo'") => parser().Parse(str);
const print = (tree) => printer().Print(tree);

describe(`Build`, () => {
  test(`type declaration file exists`, () => {
    expect(fs.existsSync(path.join(__dirname, '../build/lib/index.d.ts'))).toBe(
      true
    );
  });
  test(`LICENSE file exists`, () => {
    expect(fs.existsSync(path.join(__dirname, '../build/lib/LICENSE'))).toBe(
      true
    );
  });
  test(`types dump file exists`, () => {
    expect(
      fs.existsSync(path.join(__dirname, '../build/lib/sh.types.json'))
    ).toBe(true);
  });
  test(`type declaration file conforms to schema`, () => {
    const ajv = new Ajv();
    ajv.addMetaSchema(draft06);

    var valid = ajv.validate(typesSchema, types);
    // eslint-disable-next-line no-console
    if (!valid) console.log(ajv.errors);
    expect(valid).toBe(true);
  });
});

describe(`Preconditions`, () => {
  test(`packages are exported`, () => {
    expect(sh).toHaveProperty('packages');
  });
  test(`sh package exists`, () => {
    expect(sh.packages['mvdan.cc/sh/v3/syntax']).toBeTruthy();
  });
  test(`sh package has node definitions (File)`, () => {
    expect(sh.packages['mvdan.cc/sh/v3/syntax']).toHaveProperty('File');
  });
  test(`nodes (File) have zero(), ptr, and ptr.nil`, () => {
    const File = sh.packages['mvdan.cc/sh/v3/syntax'].File;

    expect(File).toHaveProperty('ptr');
    expect(File.ptr).toHaveProperty('nil');
    expect(() => File.zero()).not.toThrow();
  });
  test(`File.zero() prototype is File.ptr.nil prototype`, () => {
    const File = sh.packages['mvdan.cc/sh/v3/syntax'].File;

    expect(Object.getPrototypeOf(File.zero())).toBe(
      Object.getPrototypeOf(File.ptr.nil)
    );
  });
  test(`File.zero() has all expected fields`, () => {
    const File = sh.packages['mvdan.cc/sh/v3/syntax'].File;
    const zero = File.zero();

    expect(Object.keys(zero)).toHaveLength(3);
    expect(zero.$val).toBe(zero);
    expect(Object.keys(zero)).toEqual(['$val', 'Name', 'StmtList']);
  });
  test(`File.StmtList.Stmts exists and field has array prototype`, () => {
    const File = sh.packages['mvdan.cc/sh/v3/syntax'].File;
    const zero = File.zero();

    expect(zero.StmtList).toHaveProperty('Stmts');
    expect(Object.getPrototypeOf(File.fields[1].typ.fields[0].typ.nil)).toBe(
      Object.getPrototypeOf(zero.StmtList.Stmts)
    );
  });
  test(`Stmts array internal representation has expected fields & values`, () => {
    const File = sh.packages['mvdan.cc/sh/v3/syntax'].File;
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
  test(`Internal object has node prototype`, () => {
    const File = sh.packages['mvdan.cc/sh/v3/syntax'].File;

    expect(Object.getPrototypeOf(parse().__internal_object__)).toBe(
      Object.getPrototypeOf(File.ptr.nil)
    );
  });
  test(`Public/private fields are marked as such`, () => {
    const File = sh.packages['mvdan.cc/sh/v3/syntax'].File;
    const Pos = sh.packages['mvdan.cc/sh/v3/syntax'].Pos;

    expect(File).toHaveProperty('fields');
    expect(Pos).toHaveProperty('fields');

    const pFile = File.fields.filter((x) => !x.exported);
    const pPos = Pos.fields.filter((x) => !x.exported).map((x) => x.prop);

    expect(pFile).toHaveLength(0);
    expect(pPos).toEqual(['offs', 'line', 'col']);
  });
  test(`Private fields exist on zero() object`, () => {
    const Pos = sh.packages['mvdan.cc/sh/v3/syntax'].Pos;

    expect(Object.assign(Pos.zero(), { $val: 0 })).toEqual({
      $val: 0,
      offs: 0,
      line: 0,
      col: 0
    });
  });
});

describe(`Parser`, () => {
  test(`Exports Parser related fns`, () => {
    expect(typeof sh.syntax.NewParser).toBe('function');
    expect(typeof sh.syntax.StopAt).toBe('function');
    expect(typeof sh.syntax.KeepComments).toBe('function');
    expect(typeof sh.syntax.Variant).toBe('function');
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
  test(`doesn't throw`, () => {
    expect(printer).not.toThrow();
  });
  test(`print works`, () => {
    expect(print(parse()).trim()).toBe("echo 'foo'");
  });
});
