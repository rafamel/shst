#!/bin/sh

set -e
cd /go

# Only git is needed, and whichever version 3.9 has is fine.
apk add --no-cache git

# Enable Go modules, and disable CGO since we don't need it and we don't want to
# install gcc.
export GO111MODULE=on
export CGO_ENABLED=0

# Shallow clone v3 of the sh package.
git clone -b master https://github.com/mvdan/sh
# Pin to a commit
cd /go/sh/
git checkout 3684192f9c80c8905c0a1ec1ace0656b933f913e

# Use GopherJS and x/tools versions from _js/go.mod, via 'go run' further down.
cd /go/sh/_js

# Transpile, using sh v3's go.mod to resolve deps.
# if desired, add -m flag for gopherjs output minification
go run github.com/gopherjs/gopherjs build -o /go/app/pkg/dist-src/sh/index.js /go/app/transpile/main.go

# Get the API dump in JSON.
go run api_dump.go > /go/app/pkg/declaration.json

# LICENSE
cp /go/sh/LICENSE /go/app/pkg/SH.LICENSE
