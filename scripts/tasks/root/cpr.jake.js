const fs = require('fs');
const path = require('path');

desc('Recursive cp for extensions');
task('cpr', (SRC_DIR, DEST_DIR, ...EXT) => {
  if (!SRC_DIR || !DEST_DIR) {
    throw Error('No root or output paths were passed');
  }
  if (SRC_DIR[0] !== '/') SRC_DIR = path.join(process.cwd(), SRC_DIR);
  if (DEST_DIR[0] !== '/') DEST_DIR = path.join(process.cwd(), DEST_DIR);

  console.log('From: ', SRC_DIR);
  console.log('To: ', DEST_DIR);

  const extensions = EXT.map(
    (x) => new RegExp('\\.' + x.replace(/\./g, '\\.') + '$')
  );

  function run(dir) {
    const current = path.join(SRC_DIR, dir);
    fs.readdirSync(current).forEach((name) => {
      const item = path.join(current, name);
      if (fs.statSync(item).isDirectory()) return run(path.join(dir, name));

      const isExt = !!extensions.map((x) => x.exec(name)).filter(Boolean)
        .length;
      if (isExt) {
        const file = fs.readFileSync(item);
        const dest = path.join(DEST_DIR, dir);
        let acc = '';
        dest.split('/').forEach((single) => {
          acc = acc + single + '/';
          if (!fs.existsSync(acc)) fs.mkdirSync(acc);
          else if (!fs.statSync(acc).isDirectory()) {
            throw Error('Path is not dir');
          }
        });
        fs.writeFileSync(path.join(dest, name), file);
      }
    });
  }

  run('');
});
