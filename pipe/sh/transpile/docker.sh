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

# Use the GopherJS and x/tools versions from _js/go.mod, via 'go run' further
# down.
cd /go/sh/_js

# Transpile, using sh v3's go.mod to resolve deps.
# if desired, add -m flag for gopherjs output minification
go run github.com/gopherjs/gopherjs build -o /go/app/build/src/gopher.js /go/app/transpile/main.go

# Get the API dump in JSON.
go run api_dump.go > /go/app/build/lib/sh.types.json

cd /go/app/build
rm src/gopher.js.map

# Declaration
printf "declare const sh: any;\nexport default sh;" > lib/index.d.ts

# LICENSE
cp /go/sh/LICENSE lib/LICENSE
