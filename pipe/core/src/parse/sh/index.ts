import { ITypeDefMap, IStructDef, IPrivateDef } from '~/types';
import assert from 'assert';
import typesMap from '../types-map';
import { pkg } from '~/pkg';

export default function defineSh(all: ITypeDefMap): void {
  Object.values(all)
    .filter((x) => x.kind === 'struct')
    .forEach((current) => each(current as IStructDef));
}

function each(item: IStructDef): void {
  const struct = pkg[item.was];

  assert(!!struct);
  assert(!!struct.ptr);
  assert(!!struct.ptr.nil);
  assert(typeof struct.zero === 'function');

  const structFields = struct.fields
    .map((x: any, i: number) => ({ ...x, i }))
    .filter((x: any) => {
      assert(x.hasOwnProperty('exported'));
      return x.exported;
    });

  // structFields and item.fields should be identical
  assert(structFields.length === item.fields.length);
  item.fields.forEach((field) => {
    const match = structFields.filter((x: any) => x.prop === field.was);
    assert(match.length === 1);

    const structField = match[0];
    field.index = structField.i;
  });

  // all item.methods should map to structMethods
  const internalProto = Object.getPrototypeOf(struct.ptr.nil);
  const structMethods = Object.entries(internalProto)
    .filter(([key, value]) => {
      return typeof value === 'function' && /^[A-Z]/.exec(key);
    })
    .map(([key]) => key);
  item.methods.forEach((method) => assert(structMethods.includes(method.was)));

  // Add private
  const structPrivate = struct.fields
    .map((x: any, i: number) => ({ ...x, i }))
    .filter((x: any) => !x.exported);

  item.private = structPrivate.map(
    (gdef: any): IPrivateDef => {
      assert(!!gdef.prop);
      assert(!!gdef.typ.string);
      const type = typesMap.get(gdef.typ.string);
      return {
        is: gdef.prop,
        was: gdef.prop,
        index: gdef.i,
        value: {
          pointer: false,
          list: false,
          type: type.is,
          kind: type.kind
        }
      };
    }
  );
}
