# shell-parser

Provides a JS-native api for [@mvdan's `sh`](https://github.com/mvdan/sh).

## Build

<!-- markdownlint-disable MD014 MD031 -->
```shell
$ git clone https://github.com/rafamel/shell-parser.git
$ cd shell-parser
$ npm install
$ npm run build
```
<!-- markdownlint-enable MD014 MD031 -->

## Usage

Transpiled JS files can be found at `/build`. It exposes the `Parser` and `Printer` classes, and the `traverse()` function. Further documentation for those can be found [here.](https://rafamel.github.io/shell-parser/)

## Examples

### JSON serialization

```javascript
const { Parser } = require('./build');

const parser = new Parser({ language: 'POSIX' });
const tree = parser.parse('echo "foo bar"');

console.log(JSON.stringify(tree, null, 2));
```

### Traversal

```javascript
const { Parser, traverse, Printer } = require('./build');

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

## Pending

* Specific typings for node types.
* Performance: There is a significant performance reduction that is planned to be solved by applying a number of transforms during transpile time.
* Tests

<!-- ## Notes

* `Interactive` doesn't seem to properly work with streams. The test case seems to be limited to directly invoking `stream.read()`, and analyzing the source, it seems there is no way for the stream for emit data that `Interactive` would react to.

* License: The package uploaded to npm doesn't respect the project license.

* `Errors`: it would be great if they shipped with an identifier, so the message could be native to JS given an error message. 

* Node parents: There should be a way to obtain the node parent on traversal (Walk)
-->