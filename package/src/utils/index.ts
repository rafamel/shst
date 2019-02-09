import { SYMBOL } from '~/constants';

export * from './core';

export function wrap<T>(obj: T, val: any): T {
  return Object.defineProperty(obj, SYMBOL, { enumerable: false, value: val });
}

export function unwrap(val: any): any {
  return val[SYMBOL];
}

export function call<T>(fn: () => T): T {
  try {
    return fn();
  } catch (e) {
    throw Error(e.message);
  }
}
