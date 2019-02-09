import { IValue, IFieldDef, IMethodDef } from '~/types';
import Dependencies from '../Dependencies';

export function typeWrap(value: IValue): boolean {
  return value.kind === 'struct' || value.kind === 'interface';
}

export function ownProp(
  item: IFieldDef | IMethodDef,
  dependencies: Dependencies
): string {
  dependencies.addCustom('unwrapType', 'util');
  return `unwrapType(this)['${item.was}']`;
}

export function wrapValue(
  str: string,
  value: IValue,
  dependencies: Dependencies
): string {
  if (typeWrap(value)) {
    if (value.kind === 'struct') {
      if (value.list) {
        dependencies.addCustom('wrapTypeList', 'util');
        return `wrapTypeList(${value.type}, ${str})`;
      } else {
        dependencies.addCustom('wrapType', 'util');
        return `wrapType(${value.type}, ${str})`;
      }
    } else {
      if (value.list) {
        dependencies.addCustom('resolveInterfaceList', 'helpers');
        return `resolveInterfaceList(${str})`;
      } else {
        dependencies.addCustom('resolveInterface', 'helpers');
        return `resolveInterface(${str})`;
      }
    }
  }
  if (value.list) {
    dependencies.addCustom('wrapList', 'util');
    return `wrapList(${str})`;
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
      dependencies.addCustom('unwrapTypeList', 'util');
      return `unwrapTypeList(${str})`;
    } else {
      dependencies.addCustom('unwrapType', 'util');
      return `unwrapType(${str})`;
    }
  }
  if (value.list) {
    dependencies.addCustom('unwrapList', 'util');
    return `unwrapList(${str})`;
  }
  return str;
}
