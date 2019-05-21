/* eslint-disable @typescript-eslint/explicit-function-return-type */
import _sh from './sh';
import declaration from './sh/declaration';
import ShError, { InternalShError } from './ShError';

const PKG_PATH = 'mvdan.cc/sh/v3/syntax';

export { sh as default, declaration, ShError };

function sh() {
  const globals =
    typeof window !== 'undefined'
      ? window
      : typeof global !== 'undefined' && global;
  if (!globals) throw Error(`No window or global scope available`);

  const entries = Object.entries(globals);
  const descriptors: { [key: string]: any } = {};
  for (let [key, value] of entries) {
    descriptors[key] = { enumerable: true, value };
  }
  const self = Object.create(
    globals,
    Object.assign(descriptors, {
      Error: { enumerable: true, value: InternalShError },
      console: { enumerable: true, value: console }
    })
  );

  const response = _sh(
    typeof window !== 'undefined' ? self : undefined,
    typeof window === 'undefined' ? self : undefined,
    InternalShError,
    console
  );

  return {
    path: PKG_PATH,
    package: response.packages[PKG_PATH],
    ...response
  };
}
