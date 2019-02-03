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
cd /go/src/app/scripts
# remove -m flag to avoid gopherjs output minification
gopherjs build -m -o ../lib/sh/index.js
cd /go/src/app/lib/sh
rm index.js.map

# Copy LICENSE
cp /go/src/mvdan.cc/sh/LICENSE /go/src/app/lib/sh/LICENSE
