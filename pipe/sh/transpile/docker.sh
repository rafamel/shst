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
# TODO: pin a version tag or commit hash instead
git clone --depth=1 -b master.v3 https://github.com/mvdan/sh
cd /go/sh

# Install the myitcv/gopherjs version pinned by sh v3.
go install github.com/gopherjs/gopherjs

# Transpile, using sh v3's go.mod to resolve deps.
# if desired, add -m flag for gopherjs output minification
gopherjs build -o /go/app/build/src/gopher.js /go/app/transpile/main.go

# Get the API dump in JSON. We need a newer x/tools, since gopherjs pulls in an
# old version, and the sh module doesn't require any x/tools version.
cd /go/sh/syntax
go get -u -d golang.org/x/tools@v0.0.0-20190221204921-83362c3779f5
go run api_dump.go > /go/app/build/lib/sh.types.json

cd /go/app/build
rm src/gopher.js.map

# Declaration
printf "declare const sh: any;\nexport default sh;" > lib/index.d.ts

# LICENSE
cp /go/sh/LICENSE lib/LICENSE
