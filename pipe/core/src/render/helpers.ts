import { IValue } from '~/types';
import assert from 'assert';
import Dependencies from './Dependencies';

export function renderType(obj: IValue, dependencies: Dependencies): string {
  assert(typeof obj.type === 'string');
  assert(typeof obj.list === 'boolean');

  dependencies.add(obj);
  if (obj.list) {
    return `${obj.type}[]`;
  }

  return obj.type;
}

export function renderDoc(doc?: string): string {
  assert(!doc || typeof doc === 'string');

  return doc ? `\n/**\n * ${doc.trim()}\n */\n` : '';
}

export function renderParams(
  params: Array<{ name: string; value: IValue }>,
  dependencies: Dependencies
): string {
  return params
    .map(
      (param): string => {
        dependencies.add(param.value);

        return `${param.name}: ${renderType(param.value, dependencies)}`;
      }
    )
    .join(', ');
}
