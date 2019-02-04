import path from 'path';
import fs from 'fs';

const regex = /\.test\.(js|ts)$/;

export default function runAll(...args) {
  function run(dir) {
    fs.readdirSync(dir).forEach((name) => {
      const item = path.join(dir, name);

      if (fs.statSync(item).isDirectory()) {
        run(item);
      } else if (regex.exec(item)) {
        const name = path.parse(item).base.replace(regex, '');
        describe(name, () => require(item).default(...args));
      }
    });
  }

  return run(path.join(__dirname, '../'));
}
