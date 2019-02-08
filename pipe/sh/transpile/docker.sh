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
cd /go/src/app/transpile
# if desired, add -m flag for gopherjs output minification
gopherjs build -o ../build/src/gopher.js
cd ../build
rm src/gopher.js.map

# Declaration
printf "declare const sh: any;\nexport default sh;" > lib/index.d.ts

# LICENSE
cp /go/src/mvdan.cc/sh/LICENSE lib/LICENSE
