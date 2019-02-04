const uuid = require('uuid/v4');
const path = require('path');
const j = require('jscodeshift');
const { OUT_DIR, read, write } = require('../utils/fsutil');
const markers = require(path.join(OUT_DIR, 'markers.json'));

main();

function main() {
  // eslint-disable-next-line no-console
  console.log('Removing dead code...');
  const sh = read(OUT_DIR, 'sh.0.gopher.js');
  return write(OUT_DIR, 'sh.2.no-dead.js', transform(sh));
}

function transform(srt) {
  const getId = (value) =>
    `${value.loc.start.line}:${value.loc.start.column}` +
    `-${value.loc.end.line}:${value.loc.end.column}`;

  const root = j(srt);
  const { statement } = j.template;
  const notImplemented = `${'e' + uuid().replace(/-/g, '')}`;

  root
    .find(j.Function)
    .filter((p) => {
      const { value } = p;
      const id = getId(value);
      const hasMarker = markers.hasOwnProperty(id);
      return !hasMarker;
    })
    .replaceWith((p) => {
      const { value } = p;

      // We should not remove them as that can and will cause
      // unintended side-effects (even if not called,
      // functions are objects that might be relied on)
      value.params = [];
      value.body = j.blockStatement([statement`${notImplemented}();`]);
      return p.value;
    });

  const programBody = root.get().node.program.body;
  programBody.unshift(
    statement`/* eslint-disable */
      function ${notImplemented}() {
        throw Error(${j.literal('[DEAD] Not implemented')});
      }
    `
  );

  return root.toSource();
}
