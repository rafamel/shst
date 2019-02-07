import { IValue, IFieldDef, IMethodDef } from '~/types';
import Dependencies from '../Dependencies';

export function isStruct(value: IValue): boolean {
  return value.kind === 'struct';
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
  if (isStruct(value)) {
    if (value.list) {
      dependencies.addCustom('wrapTypeList', 'util');
      return `wrapTypeList(${value.type}, ${str})`;
    } else {
      dependencies.addCustom('wrapType', 'util');
      return `wrapType(${value.type}, ${str})`;
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
  if (isStruct(value)) {
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
