import types from '../raw';
import define from './define';
import { queue } from './types-map';
import { ITypeMap } from '../types';
// TODO: replace replaceMap in docs
// import { replaceMap } from './get-name';

export default function resolve(): ITypeMap {
  // Entry point is Node
  // We'll only process types dependent on it
  queue.push('Node');

  const acc: ITypeMap = {};

  while (queue.length) {
    const next = queue.shift();
    if (!next) throw Error('No next item in queue');

    // Check whether it's already been processed
    if (acc.hasOwnProperty(next)) continue;

    acc[next] = define(next, types[next]);
  }

  // Root names to def.is instead of def.was
  return Object.keys(acc).reduce((res: ITypeMap, was: string) => {
    const def = acc[was];
    res[def.is] = def;
    return res;
  }, {});
}
