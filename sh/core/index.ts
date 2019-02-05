import resolveTypes from './resolve';
import { OUT_DIR, write } from '../utils/fsutil';
import assemble from './assemble';

// TODO make sh.types.json available via docker build
main();

// TODO: prop "String": "toString"

function main(): void {
  // eslint-disable-next-line no-console
  console.log('Resolving sh types...');
  const types = resolveTypes();
  write(OUT_DIR, 'core.types.json', JSON.stringify(types, null, 2));

  // eslint-disable-next-line no-console
  console.log('Assembling core types...');
  write(OUT_DIR, 'core/index.ts', assemble(Object.values(types)));
}
