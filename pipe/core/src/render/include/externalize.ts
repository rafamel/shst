/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as classes from './struct';
import { collect } from './util';
import { SYMBOL } from './constants';

export function type(source: any) {
  const Class = (classes as any)[source.$is];
  const instance = Object.create(Class.prototype);
  return seed(instance, Class, source);
}

export function list(arr: any) {
  return arr.$array.slice(arr.$offset, arr.$offset + arr.$length);
}

export function typeList(arr: any) {
  return list(arr).map(type);
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
