const hook = require('../../setup/monorepo/hook');
hook(require.resolve('./project.config'));

const { scripts, options } = require('../../setup/monorepo/kpo.scripts');
require('@babel/register')({ extensions: ['.js', '.ts'] });
// prettier-ignore
const { kpo, log, copy, json, write, line, glob, remove, move, series } = require('kpo');
const { parse, render } = require('./src');

module.exports.options = options;
module.exports.scripts = {
  ...scripts,
  lint: {
    ...scripts.lint,
    default: scripts.lint.default.replace('./src', './src ./static')
  },
  build: {
    default: [
      line`exits --log warn
        "kpo --log warn build.render build.pack"
        "kpo --log warn build.clean"`,
      kpo`test`
    ],
    $render: [
      log`\n[1/6] Preparing build...`,
      scripts.build.$prepare,
      log`[2/6] Parsing sh types...`,
      json('pkg/types.json', parse),
      log`[3/6] Rendering core types...`,
      copy('static', 'pkg/src'),
      json('pkg/types.json', async ({ json }) => {
        await Promise.all(
          render(json).map(([k, v]) => write.fn(`pkg/src/core/${k}`, v))
        );
      })
    ],
    $pack: [
      log`[4/6] Packaging...\n`,
      move('pkg/package.json', 'pkg/package.json.bak'),
      series.env('standard-pkg --src pkg/src/ --dist pkg/dist-src', {
        ESNEXT: '#'
      }),
      `babel ./pkg/dist-src --out-dir ./pkg/dist-node`,
      copy(glob`./pkg/src/**/*.d.ts`, {
        from: './pkg/src',
        to: './pkg/dist-types'
      }),
      'ttsc --project ttsconfig.json --outDir ./pkg/dist-types/',
      move('pkg/package.json.bak', 'pkg/package.json'),
      log`\n[5/6] Linking packages...\n`,
      kpo`@ link`
    ],
    $clean: [
      log`\n[6/6] Running cleanup...\n`,
      remove('pkg/src', { logger: false })
    ]
  }
};
