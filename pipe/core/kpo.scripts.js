const hook = require('../../setup/monorepo/hook');

hook(require.resolve('./project.config'));
const { scripts, options } = require('../../setup/monorepo/kpo.scripts');

require('@babel/register')({ extensions: ['.js', '.ts'] });
// prettier-ignore
const { kpo, log, remove, copy, json, ensure, write, line, glob, series } = require('kpo');
const { parse, render } = require('./src');
const project = require('./project.config');

const extensions = project.get('ext.ts') + ',' + project.get('ext.js');
module.exports.options = options;
module.exports.scripts = {
  ...scripts,
  build: {
    default: kpo`--log warn build.prepare build.assemble build.transpile build.settle`,
    $pack: log`Pack skipped`,
    $types: kpo`types`,
    $prepare: [
      log`\n[1/6] Preparing build...`,
      remove(['out', 'pkg']),
      ['out', 'pkg/dist-node', 'pkg/dist-types'].map(ensure),
      copy(['README.md', 'package.json'], 'pkg'),
      json('pkg/package.json', (file, pkg) =>
        Object.assign(pkg, {
          main: 'dist-node/index.js',
          types: 'dist-types/index.d.ts'
        })
      )
    ],
    $assemble: [
      log`[2/6] Parsing sh types...`,
      json('pkg/dist-node/core.types.json', (file, json) => parse(json)),
      log`[3/6] Rendering core types...`,
      json(
        'pkg/dist-node/core.types.json',
        (file, types) =>
          Promise.all(render(types).map(([k, v]) => write.fn(`out/${k}`, v))),
        { overwrite: false }
      ),
      copy('./static/', './out/'),
      write(
        'out/README.md',
        '# These are programmatically generated sources\n\n' +
          '**Do not modify them directly, they will be overwritten**\n'
      )
    ],
    $transpile: [
      log`[4/6] Transpiling...\n`,
      'prettier --loglevel warn --write ./out/**/* --ignore-path',
      `eslint ./out --ext ${extensions} --ignore-pattern *.d.ts`,
      line`babel ./out --out-dir ./pkg/dist-node
        --extensions .${extensions.replace(/,/g, ',.')} --source-maps inline`,
      scripts.build.$types || Error('Build types script missing'),
      copy(glob`out/**/*.d.ts`, { from: 'out', to: './pkg/dist-types/' })
    ],
    $settle: [
      log`\n[5/6] Linking packages...\n`,
      kpo`@ link`,
      log`\n[6/6] Running tests...`,
      [kpo`lint types`, series.env('jest --no-coverage', { NODE_ENV: 'test' })]
    ]
  }
};
