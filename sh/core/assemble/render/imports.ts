import Dependencies from '../Dependencies';
import assert from 'assert';

const kindMap: any = {
  scalar: null,
  enum: './enum',
  interface: './interface',
  struct: './struct',
  util: '../../core/helpers',
  list: 'list'
};

export default function renderImports(
  dependencies: Dependencies,
  exclude: string
): string {
  const all = dependencies.getAll();

  return Object.keys(all).reduce((acc: string, kind: string) => {
    assert(kindMap.hasOwnProperty(kind));

    if (kind === exclude || !kindMap[kind]) return acc;
    const arr = all[kind];
    return acc + `import { ${arr.join(', ')} } from '${kindMap[kind]}';\n`;
  }, '');
}
