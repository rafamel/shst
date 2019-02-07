const path = require('path');
const { CONFIG_DIR } = require('./project.config');
const rc = require(path.join(CONFIG_DIR, '.eslintrc'));

delete rc.overrides;
module.exports = rc;
