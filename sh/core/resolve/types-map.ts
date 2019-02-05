import assert from 'assert';
import types from '../raw';
import maps from '../maps.json';
import { ITypeMap, ITypeDef } from '../types';
import getName from './get-name';

let run = false;
let typesMap: ITypeMap = {};

export const queue: string[] = [];

function generate(): void {
  run = true;
  typesMap = {
    ...Object.keys(maps.scalars).reduce(
      (acc: ITypeMap, name: string): ITypeMap => {
        acc[name] = {
          was: name,
          is: getName(name, 'scalar'),
          kind: 'scalar'
        };
        return acc;
      },
      {}
    ),
    ...Object.keys(types).reduce((acc: ITypeMap, name: string): ITypeMap => {
      const obj = types[name];

      if (obj.type && obj.type.kind === 'struct') {
        acc[name] = {
          was: name,
          is: getName(name, 'struct'),
          kind: 'struct'
        };
      } else if (obj.type && obj.type.kind === 'interface') {
        acc[name] = {
          was: name,
          is: getName(name, 'interface'),
          kind: 'interface'
        };
      } else if (obj.enumvalues) {
        acc[name] = {
          was: name,
          is: getName(name, 'enum'),
          kind: 'enum'
        };
      } else {
        // eslint-disable-next-line no-console
        console.error(name, obj);
        throw Error('Type could not be identified for a kind');
      }
      return acc;
    }, {})
  };
}

const regex = /^mvdan\.cc\/sh\/syntax\./;
export default {
  get(name: string): ITypeDef {
    if (!run) generate();

    assert(typeof name === 'string');

    name = name.replace(regex, '');
    assert(typesMap.hasOwnProperty(name));

    const def = typesMap[name];
    if (def.kind !== 'scalar') queue.push(def.was);

    return def;
  },
  all(): ITypeMap {
    if (!run) generate();
    return typesMap;
  }
};
