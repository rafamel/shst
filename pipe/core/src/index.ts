import path from 'path';
import fs from 'fs';
import parse from './parse';
import render from './render';

const OUT_PATH = path.join(__dirname, '../build');

const write = (file: string, content: string): void =>
  fs.writeFileSync(path.join(OUT_PATH, file), content);

// TODO make sh.types.json available via docker build
main();

// TODO: prop "String": "toString" only for methods
// TODO: add validation for sh.types.json

function main(): void {
  // eslint-disable-next-line no-console
  console.log('Parsing sh types...');
  const types = parse();

  write('core.types.json', JSON.stringify(types, null, 2));

  // eslint-disable-next-line no-console
  console.log('Rendering core types...');
  const assembled = render(types);
  Object.entries(assembled).forEach(([name, content]) => {
    write(name, content);
  });

  write(
    'README.md',
    '# These are programmatically generated sources\n\n' +
      '**Do not modify them directly, they will be overwritten**\n'
  );
}
