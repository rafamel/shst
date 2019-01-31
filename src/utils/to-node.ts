import camelcase from 'camelcase';
import { SYMBOL, NODE_EXCLUDE } from '~/constants';

export default function toType(obj: any): any {
  if (!obj) return obj;
  if (typeof obj !== 'object') {
    switch (obj) {
      case 'undefined':
        return undefined;
      case 'nil':
        return null;
      default:
        return obj;
    }
  }

  if (Array.isArray(obj)) return obj.map((x) => toType(x));

  let type = obj.$type.replace(/^.*\.\*/, '');
  const descriptors = Object.getOwnPropertyNames(obj)
    .filter((x) => !NODE_EXCLUDE.includes(x))
    .reduce(
      (acc: any, key) => {
        let val = obj[key];
        let res: any;
        acc[camelcase(key)] = {
          enumerable: true,
          get() {
            if (res) return res;
            if (typeof val !== 'function') return (res = toType(val));
            return function(...args: any[]) {
              return toType(val.call(obj, ...args));
            };
          },
          set(value: any) {
            obj[key] = val = value;
            res = null;
            return value;
          }
        };
        return acc;
      },
      {
        [SYMBOL]: {
          enumerable: false,
          value: obj
        }
      }
    );

  return Object.defineProperties({ type }, descriptors);
}
