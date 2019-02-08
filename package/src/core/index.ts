/* eslint-disable babel/no-invalid-this */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { List, from, toArray } from 'list';
import { SYMBOL } from '~/constants';

export function wrapType(Class: any, val: any) {
  const prev = val.__internal_object__[SYMBOL];
  if (prev) return prev;

  const ans = Object.create(Class.prototype, {
    [SYMBOL]: { enumerable: false, value: val }
  });

  val.__internal_object__[SYMBOL] = ans;

  return ans;
}

export function unwrapType(val: any) {
  return val[SYMBOL];
}

export function wrapTypeList<T>(Class: any, arr: T[]): List<T> {
  return from(arr.map((x) => wrapType(Class, x)));
}

export function unwrapTypeList<T>(list: List<T>): T[] {
  return toArray(list).map(unwrapType);
}

export function wrapList<T>(arr: T[]): List<T> {
  return from(arr);
}

export function unwrapList<T>(list: List<T>): T[] {
  return toArray(list);
}
