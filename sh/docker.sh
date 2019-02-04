#!/bin/sh

set -e

# Install required dev tools for build
apk update
apk add git gcc musl-dev

# Install sh package
go get -u mvdan.cc/sh/syntax

# Install @myitcv's gopherjs fork
git clone https://github.com/myitcv/gopherjs /go/src/github.com/gopherjs/gopherjs
cd /go/src/github.com/gopherjs/gopherjs
GO111MODULE=on go install

# Transpile
cd /go/src/app/sh
# if desired, add -m flag for gopherjs output minification
gopherjs build -o out/sh.0.gopher.js
rm out/sh.0.gopher.js.map

# Declaration
mkdir out/sh/ || true
printf "declare const sh: any;\nexport default sh;" > out/sh/index.d.ts

# LICENSE
cp /go/src/mvdan.cc/sh/LICENSE out/sh/LICENSE
