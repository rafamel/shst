// eslint-disable-next-line import/no-unresolved
import sh from '../../out/sh.1.markers';
import register from '../../utils/register-markers';
import run from './run-all';

afterAll(() => register.end());

run(sh);
