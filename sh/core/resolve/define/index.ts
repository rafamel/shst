import assert from 'assert';
import { structField, structMethod } from './structs';
import {
  IInterfaceDef,
  IStructDef,
  IEnumDef,
  TTypeDefs,
  ITypeDef
} from '../../types';
import typesMap from '../types-map';
import getName from '../get-name';

export default function define(name: string, obj: any): TTypeDefs {
  assert(typeof name === 'string');
  assert(typeof obj === 'object');

  const def = typesMap.get(name);

  switch (def.kind) {
    case 'enum':
      return defineEnum(def, obj);
    case 'interface':
      return defineInterface(def, obj);
    case 'struct':
      return defineStruct(def, obj);
    default:
      throw Error(`Type ${name} is of no identifiable kind`);
  }
}

function defineEnum(def: ITypeDef, obj: any): IEnumDef {
  assert(def.kind === 'enum');
  assert(obj.type === 'uint32' || obj.type === 'int');
  assert(Array.isArray(obj.enumvalues));

  return {
    ...def,
    kind: 'enum',
    doc: obj.doc,
    values: obj.enumvalues.map((name: string) => getName(name, 'value'))
  };
}

function defineInterface(def: ITypeDef, obj: any): IInterfaceDef {
  assert(def.kind === 'interface');
  assert(Array.isArray(obj.implementers));
  assert(obj.implementers.length);

  return {
    ...def,
    kind: 'interface',
    doc: obj.doc,
    values: obj.implementers.map((name: string) => typesMap.get(name).is)
  };
}

function defineStruct(def: ITypeDef, obj: any): IStructDef {
  assert(def.kind === 'struct');

  return {
    ...def,
    kind: 'struct',
    doc: obj.doc,
    fields: obj.type.fields
      ? Object.entries(obj.type.fields).map(([key, value]) =>
          structField(key, value)
        )
      : [],
    methods: obj.methods
      ? Object.entries(obj.methods).map(([key, value]) =>
          structMethod(key, value)
        )
      : []
  };
}
