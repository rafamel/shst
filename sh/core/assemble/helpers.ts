import { IValue } from '../types';
import assert from 'assert';

export function valueType(obj: IValue): string {
  assert(typeof obj.type === 'string');
  assert(typeof obj.list === 'boolean');

  return obj.list ? `${obj.type}[]` : obj.type;
}

export function dumpDoc(doc?: string): string {
  assert(!doc || typeof doc === 'string');

  return doc ? `\n/* ${doc.trim()} */\n` : '';
}
