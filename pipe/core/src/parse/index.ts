import types from './raw';
import define from './define';
import { queue } from './types-map';
import { ITypeMap, ITypeDefMap } from '../types';
import assert from 'assert';
import defineAccessors from './accesors';
import defineSh from './sh';
import map from './map.json';
// TODO: replace replaceMap in docs
// import { replaceMap } from './get-name';

export default function resolve(): ITypeDefMap {
  // Entry point is Node
  // We'll only process types dependent on it
  queue.push('Node');

  const acc: ITypeDefMap = {};

  while (queue.length) {
    const next = queue.shift();
    if (!next) throw Error('No next item in queue');

    // Check whether it's already been processed or should be skipped
    if (acc.hasOwnProperty(next) || map.skip.includes(next)) continue;

    acc[next] = define(next, types[next]);
  }

  // Root names to def.is instead of def.was
  const ans: ITypeDefMap = Object.keys(acc).reduce(
    (res: ITypeMap, was: string) => {
      const def = acc[was];
      res[def.is] = def;
      return res;
    },
    {}
  );

  // Add accessors (embedded fields) to structs
  defineAccessors(ans);

  // Add implements to structs
  Object.values(ans).forEach((item) => {
    if (item.kind !== 'interface') return;

    // Filter skipped
    item.implementedBy = item.implementedBy.filter(
      (name) => !map.skip.includes(name)
    );

    item.implementedBy.forEach((name) => {
      assert(typeof ans[name] === 'object');

      const struct = ans[name];
      if (struct.kind !== 'struct') {
        throw Error(`${name} implemented by ${item.is} is not a struct.`);
      }
      struct.implements.push(item.is);
    });
  });

  // Verify sh, add private fields and field indexes
  defineSh(ans);

  return ans;
}
