# Build pipe

1. `sh`: transpiles [@mvdan's `sh`](https://github.com/mvdan/sh) from `Go` into `JS`.
2. `core`: builds the `TS` typings and `JS` classes from a `JSON` dump stemming from the original library.
3. The output of this build process -found at `sh/lib` & `sh/core`- will be merged for the final `shast` build, they're not actually released as several packages -`lerna` is just used for convenience.

## Launch

The build process is automatically launched after `npm install` is run on the root package.

To manually start it, run `npm run bootstrap` on the root package.
