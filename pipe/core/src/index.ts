import path from 'path';
import fs from 'fs';
import resolveTypes from './resolve';
import render from './render';

const OUT_PATH = path.join(__dirname, '../out');
const write = (file: string, content: string): void =>
  fs.writeFileSync(path.join(OUT_PATH, file), content);

// TODO make sh.types.json available via docker build
main();

// TODO: prop "String": "toString" only for methods
// TODO: add validation for sh.types.json

function main(): void {
  // eslint-disable-next-line no-console
  console.log('Resolving sh types...');
  const types = resolveTypes();

  write('core.types.json', JSON.stringify(types, null, 2));

  // eslint-disable-next-line no-console
  console.log('Assembling core types...');
  const assembled = render(types);
  Object.entries(assembled).forEach(([name, content]) => {
    write(name + '.ts', content);
  });

  // TODO add README for lib (programmatically generated)
}
