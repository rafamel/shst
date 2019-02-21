# shell-parser

Provides a JS api for [@mvdan's `sh`](https://github.com/mvdan/sh).

## Usage

[Once built,](#build) transpiled JS files can be found at `/lib`. They expose the `Parser` and `Printer` classes, and the `traverse()` function.

[Full documentation is available here.](https://rafamel.github.io/shell-parser/)

## Examples

### Traversal

```javascript
const { Parser, traverse, Printer } = require('./lib');

const parser = new Parser();
const tree = parser.parse("echo 'foo'");

traverse(tree, (node) => {
  if (node.type === 'SglQuoted') {
    node.value = 'bar';
  }
  return true;
});

const printer = new Printer();
console.log(printer.print(tree)); // echo 'bar'
```

### Serialization

```javascript
const { Parser } = require('./lib');

const parser = new Parser({ language: 'POSIX' });
const tree = parser.parse('echo "foo bar"');

console.log(JSON.stringify(tree, null, 2));
```

### Deserialization
```javascript
const { Parser, fromJSON, Printer, File } = require('./lib');

const parser = new Parser({ language: 'POSIX' });
const tree = parser.parse('echo "foo bar"');

const printer = new Printer();

// We can parse a stringified JSON and reconstruct it
// regardless of its root type via fromJSON().
// `a` will be equal to `tree`.
const a = fromJSON(JSON.parse(JSON.stringify(tree)));
console.log(printer.print(a)); // echo "foo bar"

// We can also just convert instances to and from plain objects
const b = fromJSON(tree.toJSON());
console.log(printer.print(b)); // echo "foo bar"

// If we know the type of the root node, we can use the constructor
// fromJSON() method. As the tree root is an instance of `File`, we'd do:
const c = File.fromJSON(tree.toJSON());
console.log(printer.print(c)); // echo "foo bar"
```

## Build

<!-- markdownlint-disable MD014 MD031 -->
```shell
$ git clone https://github.com/rafamel/shell-parser.git
$ cd shell-parser
$ npm install
$ npm run @root -- setup
$ npm run @package -- build
```
<!-- markdownlint-enable MD014 MD031 -->

You can also build the docs via `npm run @root -- docs`.

## Pending

* Tests.
* Types dump build from source.
* `Interactive` won't work properly with streams. The source test case seems to be limited to directly invoking `stream.read()`, and analyzing the source, it seems there is no way for the stream to emit data that `Interactive` would react to.
* `exec()` should return an object of actions to perform.
