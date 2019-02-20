import { IValue } from '~/types';
import assert from 'assert';
import Dependencies from './Dependencies';

export function renderType(obj: IValue, dependencies: Dependencies): string {
  assert(typeof obj.type === 'string');
  assert(typeof obj.list === 'boolean');

  dependencies.add(obj);
  return obj.list ? `${obj.type}[]` : obj.type;
}

export function renderDoc(doc?: string): string {
  assert(!doc || typeof doc === 'string');

  return doc ? `/**\n * ${doc.trim()}\n */\n` : '';
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

export function typeWrap(value: IValue): boolean {
  return value.kind === 'struct' || value.kind === 'interface';
}

export function externalize(
  value: IValue,
  str: string,
  dependencies: Dependencies
): string {
  if (value.list) {
    if (typeWrap(value)) {
      dependencies.addCustom('typeList', 'externalize');
      return `typeList(${str})`;
    }
    dependencies.addCustom('list', 'externalize');
    return `list(${str})`;
  }
  if (typeWrap(value)) {
    dependencies.addCustom('type', 'externalize');
    return `type(${str})`;
  }

  return str;
}
