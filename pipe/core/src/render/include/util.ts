/* eslint-disable babel/no-invalid-this */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as classes from './struct';
import { interfaces, structs } from './types';
import { SYMBOL } from './constants';
import sh from '#/sh';

const syntaxPkg = sh.packages['mvdan.cc/sh/syntax'];
export function innerProto(was: string): any {
  return Object.getPrototypeOf(syntaxPkg[was].ptr.nil);
}

export function propProto(
  structWas: string,
  iField: number,
  fieldIs: string,
  isType: boolean
): any {
  const typ = syntaxPkg[structWas].fields[iField].typ;
  return Object.create(
    Object.getPrototypeOf(typ.nil),
    internalArrayDescriptor(fieldIs, isType)
  );
}

/**
 * Gets type name from a gopherjs obj $type prop
 */
const regex = /^mvdan\.cc\/sh\/syntax\.\*?/;
export function getType(item: any): string {
  return item.$type ? item.$type.replace(regex, '') : '';
}

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

/**
 * Creates and seeds an instance of a class
 */
export function createType(Class: any, inner: any) {
  const instance = Object.create(Class.prototype);
  return seedType(instance, Class, inner);
}

export function createTypeList<T>(Class: any, arr: T[]): T[] {
  return arr.map((x) => createType(Class, x));
}

/**
 * Seeds an instance of a class
 */
export function seedType(instance: any, Class: any, inner: any) {
  const { $root, $internal } = collect(Class);

  const descriptor: any = {
    value: {
      instance,
      inner,
      constructor: Class,
      arrays: {}
    }
  };
  descriptor.value.outer = Object.create($root, {
    [SYMBOL]: descriptor,
    // eslint-disable-next-line @typescript-eslint/camelcase
    __internal_object__: {
      value: Object.create($internal, {
        [SYMBOL]: descriptor
      })
    }
  });

  return Object.defineProperty(instance, SYMBOL, descriptor);
}

/**
 * Collects a gopherjs-like object from a class instance
 */
export function collectType(val: any): any {
  return collect(val).outer;
}

export function collectTypeList<T>(arr: T[]): T[] {
  return arr.map(collectType);
}

/**
 * Whether an instance belongs to a class that implements
 * an interface with "name"
 */
export function isInterface(name: string, instance: any): boolean {
  const type = instance.constructor && instance.constructor.type;
  if (!type) return false;
  const arr: string[] | void = interfaces[name];
  return !!arr && arr.includes(type);
}

/**
 * Returns the class constructor that a gopherjs object belongs to
 */
export function resolveInterface(item: any): any {
  const type = getType(item);
  // eslint-disable-next-line import/namespace
  return type ? createType((classes as any)[structs[type]], item) : item;
}

export function resolveInterfaceList(arr: any[]): any {
  return arr.map(resolveInterface);
}

/**
 * Returns the __internal_object__ property of an object
 */
export function internal(obj: any): any {
  return obj.__internal_object__;
}

export function set(obj: any, prop: string, value: any) {
  Object.defineProperty(obj, prop, { value, writable: true });
  return value;
}

export function internalArrayDescriptor(is: string, isType: boolean) {
  return {
    $array: {
      get: isType
        ? function $array() {
            return collect(this).instance[is].map((x: any) =>
              internal(collect(x).outer)
            );
          }
        : function $array() {
            return collect(this).instance[is];
          }
    },
    $offset: {
      value: 0
    },
    $length: {
      get: function $length() {
        return collect(this).instance[is].length;
      }
    },
    $capacity: {
      get: function $capacity() {
        return collect(this).instance[is].length;
      }
    },
    $val: {
      get: function $val() {
        return this;
      }
    }
  };
}

export function internalArray(is: string) {
  const src = collect(this);

  let ans = src.arrays[is];
  if (!ans) {
    const { $arrays } = collect(src.constructor);
    src.arrays[is] = ans = Object.create($arrays[is]);
    seed(ans, src);
  }
  return ans;
}
