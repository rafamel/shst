import assert from 'assert';

export function structField(name: string, obj: any): any {
  assert(typeof name === 'string');
  assert(typeof obj === 'object');

  return {};
}

export function structMethod(name: string, obj: any): any {
  assert(typeof name === 'string');
  assert(typeof obj === 'object');

  return {};
}
