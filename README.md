# shst

[![Version](https://img.shields.io/npm/v/shst.svg)](https://www.npmjs.com/package/shst)
[![Build Status](https://img.shields.io/travis/rafamel/shst/master.svg)](https://travis-ci.org/rafamel/shst)
[![Coverage](https://img.shields.io/coveralls/rafamel/shst/master.svg)](https://coveralls.io/github/rafamel/shst)
[![Dependencies](https://img.shields.io/david/rafamel/shst.svg)](https://david-dm.org/rafamel/shst)
[![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/shst.svg)](https://snyk.io/test/npm/shst)
[![License](https://img.shields.io/github/license/rafamel/shst.svg)](https://github.com/rafamel/shst/blob/master/LICENSE)
[![Types](https://img.shields.io/npm/types/shst.svg)](https://www.npmjs.com/package/shst)

<div align="center">
  <br />
  <br />
  <a href="https://www.npmjs.com/package/shst" target="_blank">
    <img alt="shst" width="350" src="https://raw.githubusercontent.com/rafamel/shst/master/assets/logo.png" />
  </a>
  <br />
  <br />
  <strong>A shell parser for Javascript</strong>
  <br />
  <br />
</div>

<!-- ## Install

[`npm install shst`](https://www.npmjs.com/package/shst) -->

## Usage

[Once built,](#build) transpiled JS files can be found at `/package/pkg`. They expose the `Parser`, `InteractiveParser`, and `Printer` classes, and the `traverse()` function.

[Full documentation is available here.](https://rafamel.github.io/shst/)

## Examples

### Parsing

#### Script parsing

```javascript
const { Parser, Printer } = require('./package/pkg');

const parser = new Parser();
const tree = parser.parse("echo 'foo'");

const printer = new Printer();
console.log(printer.print(tree)); // echo 'foo'
```

#### Interactive parsing

```javascript
const { InteractiveParser } = require('./package/pkg');

const interactive = new InteractiveParser();

let acc = [];
interactive.subscribe((stmts) => (acc = acc.concat(stmts)));

// We're sending a complete statement, however it lacks an ending
// newline character. Hence, `incomplete` will be `true`.
interactive.next("echo 'foo'"); // []
console.log(interactive.incomplete); // true

// We finalize the previous statement by sending a newline character
// and receive the parsed `Stmt`. It is also sent to all subscribers.
interactive.next("\n"); // [Stmt {}]
console.log(interactive.incomplete); // false

interactive.next("echo 'ba"); // []
console.log(interactive.incomplete); // true

interactive.next("r'\n"); // [Stmt {}]
console.log(interactive.incomplete); // false

// There's two statements here, one of which (the second) is incomplete.
// Since we don't have a finishing newline character, we don't get
// the parsed statements until the second statement is finalized
// and a newline character is sent.
interactive.next("echo 'baz'; echo 'foob"); // []
console.log(interactive.incomplete); // true

interactive.next("ar'\n"); // [Stmt {}, Stmt {}]
console.log(interactive.incomplete); // false

// In contrast, if we had a separating newline character, we'd receive
// the first completed statement
interactive.next("echo 'baz';\necho 'foo'"); // [Stmt {}]
console.log(interactive.incomplete); // true

interactive.next("\n");
console.log(interactive.incomplete); // false

console.log(acc); // [ Stmt {}, Stmt {}, Stmt {}, Stmt {}, Stmt {}, Stmt {} ]
interactive.end(); // [ Stmt {}, Stmt {}, Stmt {}, Stmt {}, Stmt {}, Stmt {} ]
```

### Traversal

```javascript
const { Parser, traverse, Printer } = require('./package/pkg');

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

### JSON

#### Serialization

```javascript
const { Parser } = require('./package/pkg');

const parser = new Parser({ language: 'POSIX' });
const tree = parser.parse('echo "foo bar"');

console.log(JSON.stringify(tree, null, 2));
```

#### Deserialization

```javascript
const { Parser, fromJSON, Printer, File } = require('./package/pkg');

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

// If we knew the type of the root node, we could use the constructor
// fromJSON() method. As the tree root is an instance of `File`, we'd do:
const c = File.fromJSON(tree.toJSON());
console.log(printer.print(c)); // echo "foo bar"
```

## Build

<!-- markdownlint-disable MD014 MD031 -->
```shell
$ git clone https://github.com/rafamel/shst.git
$ cd shst
$ npm install
$ npx kpo :series "kpo @ bootstrap" "kpo @package build"
```
<!-- markdownlint-enable MD014 MD031 -->

You can also build the docs via `npm run @root -- docs`.

## Pending

* Tests.
* `exec()` should return an object of actions to perform.

## Credits

This library provides a JS native api and TypeScript typings for the originally `Go` module [`sh/syntax`,](https://github.com/mvdan/sh) by [@mvdan](https://github.com/mvdan)
