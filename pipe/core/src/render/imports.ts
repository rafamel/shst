import Dependencies from './Dependencies';
import assert from 'assert';
import _map from './map.json';

const map: any = _map;
export default function renderImports(
  dependencies: Dependencies,
  exclude: string | string[]
): string {
  const all = dependencies.getAll();
  if (!Array.isArray(exclude)) exclude = [exclude];

  return Object.keys(all).reduce((acc: string, kind: string) => {
    assert(map.hasOwnProperty(kind));

    if (exclude.includes(kind) || !map[kind]) return acc;
    const arr = all[kind];
    return acc + `import { ${arr.join(', ')} } from '${map[kind]}';\n`;
  }, '');
}
