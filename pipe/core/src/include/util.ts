/* eslint-disable babel/no-invalid-this */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { SYMBOL } from './constants';
import { List, from, toArray } from 'list';

// TODO handle arrays as input

export function getter(Class: any, list: boolean, prop: string) {
  if (!Class) {
    return list
      ? function() {
          return wrapList(this[SYMBOL][prop]);
        }
      : function() {
          return this[SYMBOL][prop];
        };
  }
  return list
    ? function() {
        return wrapTypeList(Class, this[SYMBOL][prop]);
      }
    : function() {
        return wrapType(Class, this[SYMBOL][prop]);
      };
}

export function setter(isType: boolean, list: boolean, prop: string) {
  if (!isType) {
    return list
      ? function(val: any) {
          this[SYMBOL][prop] = unwrapList(val);
        }
      : function(val: any) {
          this[SYMBOL][prop] = val;
        };
  }
  return list
    ? function(val: any) {
        this[SYMBOL][prop] = unwrapTypeList(val);
      }
    : function(val: any) {
        this[SYMBOL][prop] = unwrapType(val);
      };
}

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
