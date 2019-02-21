import camelcase from 'camelcase';
import { TKind } from '~/types';
import maps from './map.json';
import assert from 'assert';

export const replaceMap: { [key: string]: string } = {};

export function pascalcase(str: string): string {
  str = camelcase(str);
  return str[0].toUpperCase() + (str.length > 1 ? str.slice(1) : '');
}

export function map(obj: any, str: string): string {
  assert(obj);
  assert(str);
  if (obj.hasOwnProperty(str)) str = obj[str];
  assert(str);

  return str;
}

export default function getName(
  str: string,
  mode: TKind | 'prop' | 'value'
): string {
  function main(): string {
    switch (mode) {
      case 'scalar':
        return map(maps.scalars, str);
      case 'enum':
        return 'E' + pascalcase(map(maps.types, str));
      case 'interface':
        return 'T' + pascalcase(map(maps.types, str));
      case 'struct':
        return pascalcase(map(maps.types, str));
      case 'prop':
        return camelcase(map(maps.props, str));
      case 'value':
        return pascalcase(map(maps.values, str));
      default:
        // eslint-disable-next-line no-console
        console.error(str, mode);
        throw Error('No mode recognized for new name');
    }
  }

  const res = main();
  if (str !== res) replaceMap[str] = res;
  return res;
}
