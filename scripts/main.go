/* 
Copyright (c) 2016, Daniel Martí. All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are
met:

   * Redistributions of source code must retain the above copyright
notice, this list of conditions and the following disclaimer.
   * Redistributions in binary form must reproduce the above
copyright notice, this list of conditions and the following disclaimer
in the documentation and/or other materials provided with the
distribution.
   * Neither the name of the copyright holder nor the names of its
contributors may be used to endorse or promote products derived from
this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
"AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

package main

import (
	"bytes"
	"fmt"
	"io"
	"math"
	"os"
	"strings"
	"github.com/gopherjs/gopherjs/js"
	"mvdan.cc/sh/syntax"
)

func main() {
	exps := js.Module.Get("exports")
	exps.Set("syntax", map[string]interface{}{})
	stx := exps.Get("syntax")

	// Type helpers just for JS
	stx.Set("NodeType", func(v interface{}) string {
		if v == nil {
			return "nil"
		}
		node, ok := v.(syntax.Node)
		if !ok {
			throw("NodeType requires a Node argument")
		}
		typ := fmt.Sprintf("%T", node)
		if i := strings.LastIndexAny(typ, "*.]"); i >= 0 {
			typ = typ[i+1:]
		}
		return typ
	})

	// Parser
	stx.Set("NewParser", func(options ...func(interface{})) *js.Object {
		p := syntax.NewParser()
		jp := js.MakeFullWrapper(jsParser{p})
		// Apply the options after we've wrapped the parser, as
		// otherwise we cannot internalise the value.
		for _, opt := range options {
			opt(jp)
		}
		return jp
	})

	stx.Set("KeepComments", func(v interface{}) {
		syntax.KeepComments(v.(jsParser).Parser)
	})
	stx.Set("Variant", func(l syntax.LangVariant) func(interface{}) {
		if math.IsNaN(float64(l)) {
			throw("Variant requires a LangVariant argument")
		}
		return func(v interface{}) {
			syntax.Variant(l)(v.(jsParser).Parser)
		}
	})
	stx.Set("LangBash", syntax.LangBash)
	stx.Set("LangPOSIX", syntax.LangPOSIX)
	stx.Set("LangMirBSDKorn", syntax.LangMirBSDKorn)
	stx.Set("StopAt", func(word string) func(interface{}) {
		return func(v interface{}) {
			syntax.StopAt(word)(v.(jsParser).Parser)
		}
	})

	// Printer
	stx.Set("NewPrinter", func() *js.Object {
		p := syntax.NewPrinter()
		return js.MakeFullWrapper(jsPrinter{p})
	})

	// Syntax utilities
	stx.Set("Walk", func(node syntax.Node, jsFn func(*js.Object) bool) {
		f := func(node syntax.Node) bool {
			if node == nil {
				return jsFn(nil)
			}
			return jsFn(js.MakeFullWrapper(node))
		}
		syntax.Walk(node, f)
	})
	stx.Set("DebugPrint", func(node syntax.Node) {
		syntax.DebugPrint(os.Stdout, node)
	})
}

func throw(v interface{}) {
	js.Global.Call("$throwRuntimeError", fmt.Sprint(v))
}

// streamReader is an io.Readder wrapper for Node's stream.Readable. See
// https://nodejs.org/api/stream.html#stream_class_stream_readable
// TODO: support https://streams.spec.whatwg.org/#rs-class too?
type streamReader struct {
	stream *js.Object
}

func (r streamReader) Read(p []byte) (n int, err error) {
	obj := r.stream.Call("read", len(p))
	if obj == nil {
		return 0, io.EOF
	}
	bs := []byte(obj.String())
	return copy(p, bs), nil
}

type jsParser struct {
	*syntax.Parser
}

func adaptReader(src *js.Object) io.Reader {
	if src.Get("read") != js.Undefined {
		return streamReader{stream: src}
	}
	return strings.NewReader(src.String())
}

func (p jsParser) Parse(src *js.Object, name string) *js.Object {
	f, err := p.Parser.Parse(adaptReader(src), name)
	if err != nil {
		throw(err)
	}
	return js.MakeFullWrapper(f)
}

func (p jsParser) Incomplete() bool {
	return p.Parser.Incomplete()
}

func (p jsParser) Interactive(src *js.Object, fn func([]*syntax.Stmt) bool) {
	err := p.Parser.Interactive(adaptReader(src), fn)
	if err != nil {
		throw(err)
	}
}

type jsPrinter struct {
	*syntax.Printer
}

func (p jsPrinter) Print(file *syntax.File) string {
	var buf bytes.Buffer
	if err := p.Printer.Print(&buf, file); err != nil {
		throw(err)
	}
	return buf.String()
}