const hook = require('../setup/monorepo/hook');

hook(require.resolve('./project.config'));
module.exports = require('../setup/.eslintrc');
