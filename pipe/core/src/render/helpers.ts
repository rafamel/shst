import { IValue } from '~/types';
import assert from 'assert';
import Dependencies from './Dependencies';

export function renderType(
  obj: IValue,
  is: 'in' | 'out',
  dependencies: Dependencies
): string {
  assert(typeof obj.type === 'string');
  assert(typeof obj.list === 'boolean');

  if (obj.list) {
    dependencies.addCustom('List', 'list');
    return `List<${obj.type}>` + (is === 'in' ? ` | ${obj.type}[]` : '');
  }

  return obj.type;
}

export function renderDoc(doc?: string): string {
  assert(!doc || typeof doc === 'string');

  return doc ? `\n/* ${doc.trim()} */\n` : '';
}
