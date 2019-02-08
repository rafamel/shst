const sh = require('../../build/src/markers');
const register = require('../../utils/register-markers');
const run = require('./run-all');

afterAll(() => register.end());

run(sh);
