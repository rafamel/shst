const hook = require('../../setup/monorepo/hook');
hook(require.resolve('./project.config'));
const { scripts, options } = require('../../setup/monorepo/kpo.scripts');

const { rm, read, rw, log, kpo, move, series } = require('kpo');
const { validate, expose } = require('./transpile/transform');

module.exports.options = options;
module.exports.scripts = {
  ...scripts,
  build: {
    default: kpo`--log warn build.transpile build.transform build.pack test`,
    $transpile: [
      log`\n[1/6] Preparing build...`,
      scripts.build.$prepare,
      scripts.build.$types,
      series(`babel ./src --out-dir ./pkg/dist-src`, {
        args: ['--extensions', '.ts,.js'],
        env: { ESNEXT: '#' }
      }),
      log`[2/6] Transpiling sh...`,
      'poseup -d transpile run transpile',
      rm`pkg/dist-src/sh/index.js.map`
    ],
    $transform: [
      log`\n[3/6] Exposing packages...`,
      rw('pkg/dist-src/sh/index.js', ({ raw }) => expose(raw)),
      log`[4/6] Verifying types lock...`,
      read('transpile/types.lock', ({ raw: lock }) =>
        rw.fn(
          'pkg/declaration.json',
          'pkg/dist-src/sh/declaration.js',
          ({ raw }) => {
            log.fn`    Current lock: ${lock}`;
            validate(JSON.parse(raw), lock);
            return `export default ${raw};`;
          }
        )
      )
    ],
    $pack: [
      log`[5/6] Packaging...\n`,
      move('pkg/package.json', 'pkg/package.json.bak'),
      `babel ./pkg/dist-src --out-dir ./pkg/dist-node`,
      move('pkg/package.json.bak', 'pkg/package.json'),
      log`\n[6/6] Linking packages...\n`,
      kpo`@ link`
    ]
  }
};
