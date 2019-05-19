import define from './define';
import { queue } from './types-map';
import { ITypeMap, ITypeDefMap, IInterfaceDef } from '../types';
import assert from 'assert';
import defineAccessors from './accesors';
import defineSh from './sh';
import map from './map.json';
import docMap from './doc-map';
import types from './raw';
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
    if (acc.hasOwnProperty(next) || (map.skip as string[]).includes(next)) {
      continue;
    }

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

  // Adds IType
  assert(!ans.IType);
  ans.TType = {
    is: 'TType',
    was: 'Type',
    doc: 'All instances returned by `Parser` are *Type*.',
    kind: 'interface',
    methods: [],
    implementedBy: Object.values(ans)
      .filter((x) => x.kind === 'struct')
      .map((x) => x.is)
  };

  // Add accessors (embedded fields) to structs
  defineAccessors(ans);

  // Add implements to structs
  Object.values(ans).forEach((item) => {
    if (item.kind !== 'interface') return;

    // Filter skipped
    item.implementedBy = item.implementedBy.filter(
      (name) => !(map.skip as string[]).includes(name)
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

  // Add docs for interfaced methods
  Object.values(ans).forEach((item) => {
    if (item.kind !== 'struct' || !item.implements.length) return;

    item.methods.forEach((method) => {
      if (method.doc && method.doc.trim()) return;
      for (let name of item.implements) {
        const itfce: IInterfaceDef = ans[name] as any;
        assert(itfce);
        assert(itfce.kind === 'interface');

        const matches = itfce.methods.filter((x) => x.was === method.was);
        assert(matches.length <= 1);

        const match = matches[0];
        if (match && match.doc && match.doc.trim()) {
          method.doc = match.doc;
          break;
        }
      }
    });
  });

  // Map docs
  Object.values(ans).forEach((item) => {
    if (item.doc) item.doc = docMap(item.doc, item, ans);

    if (item.kind === 'struct') {
      item.fields.forEach((field) => {
        if (field.doc) field.doc = docMap(field.doc, item, ans);
      });
    }
    if (item.kind === 'struct' || item.kind === 'interface') {
      item.methods.forEach((method) => {
        if (method.doc) method.doc = docMap(method.doc, item, ans);
      });
    }
  });

  // Verify sh, add private fields and field indexes
  defineSh(ans);

  return ans;
}
