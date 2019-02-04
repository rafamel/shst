const uuid = require('uuid/v4');
const path = require('path');
const j = require('jscodeshift');
const { SH_DIR, OUT_DIR, read, write } = require('../utils/fsutil');

main();

function main() {
  // eslint-disable-next-line no-console
  console.log('Setting markers...');
  const sh = read(OUT_DIR, 'sh.0.gopher.js');
  return write(OUT_DIR, 'sh.1.markers.js', transform(sh));
}

function transform(srt) {
  const getId = (value) =>
    `${value.loc.start.line}:${value.loc.start.column}` +
    `-${value.loc.end.line}:${value.loc.end.column}`;

  const root = j(srt);

  const { statement } = j.template;

  const register = '_' + uuid().replace(/-/g, '');
  const registerPath = path.join(SH_DIR, 'utils/register-markers.js');

  const programBody = root.get().node.program.body;
  programBody.unshift(
    statement`/* eslint-disable */
      var ${register} = require(${j.literal(registerPath)});
    `
  );

  root.find(j.Function).forEach((p) => {
    const { value } = p;
    const id = getId(value);

    const body = value.body;
    if (value.body.type === 'BlockStatement') {
      value.body.body.unshift(statement`${register}.add(${j.literal(id)});\n`);
    } else {
      value.body = j.blockStatement([
        statement`${register}.add(${j.literal(id)});\n`,
        statement`return ${body}`
      ]);
    }
  });

  return root.toSource();
}
