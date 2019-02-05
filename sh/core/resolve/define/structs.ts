import assert from 'assert';
import getName from '../get-name';
import typesMap from '../types-map';
import { IFieldDef, IMethodDef, IValue } from '../../types';

export function structField(name: string, obj: any): IFieldDef {
  assert(typeof name === 'string');
  assert(typeof obj === 'object');

  return {
    was: name,
    is: getName(name, 'prop'),
    doc: obj.doc,
    value: resolveProp(obj.type)
  };
}

export function structMethod(name: string, obj: any): IMethodDef {
  assert(typeof name === 'string');
  assert(typeof obj === 'object');
  assert(obj.type.kind === 'function');
  assert(Array.isArray(obj.type.results));
  // We're not prepared to handle functions of 2+ arguments
  assert(obj.type.results.length <= 1);
  assert(typeof obj.type.results[0] === 'object');

  const generate = paramNameGenerator();
  return {
    was: name,
    is: getName(name, 'prop'),
    doc: obj.doc,
    params: obj.type.params.map((param: any) => {
      const value = resolveProp(param.type);
      return {
        name: generate([param.name, value.type + (value.list ? 's' : '')]),
        value
      };
    }),
    returns: resolveProp(obj.type.results[0].type)
  };
}

export function resolveProp(obj: any): IValue {
  if (typeof obj === 'string') {
    return {
      list: false,
      type: typesMap.get(obj).is
    };
  }
  if (typeof obj === 'object') {
    switch (obj.kind) {
      case 'list':
        return { ...resolveProp(obj.elem), list: true };
      case 'pointer':
        return resolveProp(obj.elem);
      default:
        break;
    }
  }
  // eslint-disable-next-line no-console
  console.error(obj);
  throw Error(`Couldn't resolve prop`);
}

export function paramNameGenerator() {
  let char = 97; // Must be from 97 (a) to 122 (z)
  const names: any = {};
  return function generateName(preferredArr?: string[]): string {
    assert(char <= 122);

    if (preferredArr) {
      let preferred = preferredArr[0];
      if (preferred) {
        preferred = getName(preferred, 'prop');
        if (!names.hasOwnProperty(preferred)) {
          names[preferred] = true;
          return preferred;
        }
      }
      if (preferredArr.length > 1) {
        return generateName(preferredArr.slice(1));
      }
    }

    const generated = String.fromCharCode(char);
    char++;
    return names.hasOwnProperty(generated) ? generateName() : generated;
  };
}
