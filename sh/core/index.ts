import resolveTypes from './resolve';
import { OUT_DIR, write } from '../utils/fsutil';

// TODO make sh.types.json available via docker build
main();

function main(): void {
  // eslint-disable-next-line no-console
  console.log('Resolving sh types...');
  const types = resolveTypes();
  write(OUT_DIR, 'core.types.json', JSON.stringify(types, null, 2));
}
