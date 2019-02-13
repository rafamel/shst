import { IValue } from '~/types';
import Dependencies from '../Dependencies';

export function typeWrap(value: IValue): boolean {
  return value.kind === 'struct' || value.kind === 'interface';
}

export function wrapValue(
  str: string,
  value: IValue,
  dependencies: Dependencies
): string {
  if (typeWrap(value)) {
    if (value.kind === 'struct') {
      if (value.list) {
        dependencies.addCustom('createTypeList', 'util');
        return `createTypeList(${value.type}, ${str})`;
      } else {
        dependencies.addCustom('createType', 'util');
        return `createType(${value.type}, ${str})`;
      }
    } else {
      if (value.list) {
        dependencies.addCustom('resolveInterfaceList', 'util');
        return `resolveInterfaceList(${str})`;
      } else {
        dependencies.addCustom('resolveInterface', 'util');
        return `resolveInterface(${str})`;
      }
    }
  }
  return str;
}

export function unwrapValue(
  str: string,
  value: IValue,
  dependencies: Dependencies
): string {
  if (typeWrap(value)) {
    if (value.list) {
      dependencies.addCustom('collectTypeList', 'util');
      return `collectTypeList(${str})`;
    } else {
      dependencies.addCustom('collectType', 'util');
      return `collectType(${str})`;
    }
  }
  return str;
}
