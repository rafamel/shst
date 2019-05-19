/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as classes from './struct';
import { collect } from './util';
import { SYMBOL } from './constants';

export function type(source: any, pointer: boolean = false) {
  if (pointer) {
    const keys = Object.keys(source);
    if (keys.length < 1 || (keys.length === 1 && keys[0] === '$val')) {
      return null;
    }
  }
  const Class = (classes as any)[source.$is];
  const instance = Object.create(Class.prototype);
  return seed(instance, Class, source);
}

export function list(arr: any, pointer: boolean = false) {
  return !pointer || (arr.$array && arr.offset != null && arr.length != null)
    ? arr.$array.slice(arr.$offset, arr.$offset + arr.$length)
    : [];
}

export function typeList(arr: any, pointer: boolean = false) {
  return pointer
    ? list(arr)
        .map((x: any) => type(x, true))
        .filter((x: any) => x !== null)
    : list(arr).map((x: any) => type(x, false));
}

/**
 * Seeds an instance of a class
 */
export function seed(instance: any, Class: any, source?: any) {
  const { $external, $internal, $private, $zero } = collect(Class);

  const descriptor: any = {
    value: {
      instance,
      source: source || $zero,
      constructor: Class,
      arrays: {}
    }
  };

  descriptor.value.private = Object.create($private, {
    [SYMBOL]: descriptor
  });

  descriptor.value.internal = Object.create($internal, {
    [SYMBOL]: descriptor
  });

  descriptor.value.external = Object.create($external, {
    [SYMBOL]: descriptor,
    // eslint-disable-next-line @typescript-eslint/camelcase
    __internal_object__: { value: descriptor.value.internal }
  });

  return Object.defineProperty(instance, SYMBOL, descriptor);
}
