import assert from 'assert';
import getName from '../get-name';
import typesMap from '../types-map';
import { IPropDef } from '../types';

export function structField(name: string, obj: any): IPropDef {
  assert(typeof name === 'string');
  assert(typeof obj === 'object');

  return {
    ...resolveProp(name, obj.type),
    doc: obj.doc
  };
}

export function structMethod(name: string, obj: any): any {
  assert(typeof name === 'string');
  assert(typeof obj === 'object');

  return {};
}

export function resolveProp(name: string, obj: any): IPropDef {
  assert(typeof name === 'string');

  if (typeof obj === 'string') {
    return {
      was: name,
      is: getName(name, 'prop'),
      list: false,
      type: typesMap.get(obj).is
    };
  }
  if (typeof obj === 'object') {
    switch (obj.kind) {
      case 'list':
        return { ...resolveProp(name, obj.elem), list: true };
      case 'pointer':
        return resolveProp(name, obj.elem);
      default:
        break;
    }
  }
  // eslint-disable-next-line no-console
  console.error(name, obj);
  throw Error(`Couldn't resolve prop`);
}
