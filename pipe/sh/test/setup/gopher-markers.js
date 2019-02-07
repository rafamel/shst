const sh = require('../../out/sh.1.markers');
const register = require('../../utils/register-markers');
const run = require('./run-all');

afterAll(() => register.end());

run(sh);
