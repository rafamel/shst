# Build pipe

1. `sh`: transpiles [@mvdan's `sh`](https://github.com/mvdan/sh) from `Go` into `JS`.
2. `core`: builds the `TS` typings and `JS` classes from a `JSON` dump stemming from the original library.
3. The output of this build process will be merged for the final package build, they're not actually released as several packages -`lerna` is just used for convenience.

## Launch

The build process can be launched by running `npm run @root -- setup` after the project has been kickstarted via `npm install`.
