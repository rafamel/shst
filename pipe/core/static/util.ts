/* eslint-disable babel/no-invalid-this */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { interfaces } from './types';
import { SYMBOL } from './constants';

/**
 * Prevents a function call to a gopherjs transpiled
 * function/method to expose a stacktrace
 */
export function call<T>(fn: () => T): T {
  try {
    return fn();
  } catch (e) {
    throw Error(e.message);
  }
}

/**
 * Whether an instance belongs to a class that implements
 * an interface with "name"
 */
export function isInterface(name: string, instance: any): boolean {
  const type = instance.type;
  return Boolean(type && interfaces[name][type]);
}

export function set(obj: any, prop: string, value: any) {
  Object.defineProperty(obj, prop, { value, writable: true });
  return value;
}

/**
 * Seed an object with any non enumerable value
 * in a private (SYMBOL) property
 */
export function seed<T>(obj: T, val: any): T {
  return Object.defineProperty(obj, SYMBOL, { enumerable: false, value: val });
}

/**
 * Collect a seeded object private property
 */
export function collect(val: any): any {
  return val[SYMBOL];
}

export const internal = {
  /**
   * Returns the __internal_object__ property of an object
   */
  get(obj: any): any {
    return obj.__internal_object__;
  },
  array: {
    create(instance: any, is: string) {
      const src = collect(instance);

      let ans = src.arrays[is];
      if (!ans) {
        const { $arrays } = collect(src.constructor);
        src.arrays[is] = ans = Object.create($arrays[is]);
        seed(ans, src);
      }
      return ans;
    },
    descriptor(fieldIs: string, isPrivate: boolean, isType: boolean) {
      const key = isPrivate ? 'private' : 'instance';
      return {
        $array: {
          get: isType
            ? function $array() {
                return collect(this)[key][fieldIs].map(
                  (x: any) => collect(x).internal
                );
              }
            : function $array() {
                return collect(this)[key][fieldIs];
              }
        },
        $offset: {
          value: 0
        },
        $length: {
          get: function $length() {
            return collect(this)[key][fieldIs].length;
          }
        },
        $capacity: {
          get: function $capacity() {
            return collect(this)[key][fieldIs].length;
          }
        },
        $val: {
          get: function $val() {
            return this;
          }
        }
      };
    }
  }
};
