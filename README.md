[![npm version][npm-image]][npm-url]
[![downloads][downloads-image]][npm-url]
[![build status][build-image]][build-url]
[![coverage status][coverage-image]][coverage-url]
[![Language grade: JavaScript][lgtm-image]][lgtm-url]
[![Node.JS version][node-version]][node-url]


# graph-cycles

Analyze a graph to find cyclic loops, entrypoints to them and dependencies of them.

*This package should not be used for very large graphs; graph analysis doesn't scale well.*

## Example

`graph-cycles` exports a function `analyzeGraph` that takes a list of `[ from, [ ...to ] ]` pairs and returns the graph analysis.

```ts
import { analyzeGraph } from 'graph-cycles'

const analysis = analyzeGraph( [
	[ 'a', [ 'b', 'c' ] ],
	[ 'b', [ 'c', 'j' ] ],
	[ 'c', [ 'd' ] ],
	[ 'd', [ 'e', 'h' ] ],
	[ 'e', [ 'f', 'g' ] ],
	[ 'f', [ 'd', 'j' ] ],
	[ 'g', [ 'g', 'h' ] ],
	[ 'h', [ 'i' ] ],
	[ 'i', [ 'c' ] ],
	[ 'j', [ ']' ] ],
 	[ 'k', [ 'l' ] ],
	[ 'l', [ ']' ] ],
	[ 'x', [ 'y' ] ],
	[ 'z', [ 'x', 'y' ] ],
] );

const { cycles, entrypoints, dependencies, all } = analysis;
```

The result object is on the form:

```ts
interface AnalysisResult {
	cycles: Array< Array< string > >;
	entrypoints: Array< Array< string > >;
	dependencies: Array< string >;
	all: Array< string >;
}
```

where `cycles` is an array of the cyclic loops, `entrypoints` the entrypoints (or entrypoint *paths*) which lead to a cyclic loop, `dependencies` is the nodes cyclic nodes *depend on*, and `all` is all individual nodes which either lead to a cyclic loop (entrypoints) or are in one (excluding dependencies).

Example graph (as in the example above):

<!-- ←→↑↓ ⬊⬈⬉⬋ -->

```
// These will be found to be cyclic:
a → { b c }
b → { c j }
c → { d }
d → { e h }
e → { f g }
f → { d k }
g → { g h }
h → { i }
i → { c }
j → { }
k → { l }
l → { }
// These will be found to not be cyclic:
x → { y }
z → { x y }

Cyclic cluster:
                  ⬈ ⬊
    j   i ← h ← g ← ⬋
    ↑   ↓   ↑   ↑
a → b → c → d → e → f → k → l
 ⬊ ___ ⬈     ⬉ ___ ⬋

Non-cyclic cluster:
z → x → y
 ⬊ ___ ⬈
```

This example shows a few cycles. The last entry of a cycle always point to the first entry, and is excluded in the cycle array. Cycles are only returned once with an arbitrary node as a starting point. The returned object contains all unique cycles, all entrypoints (node paths *into* a cycle), and then all individual nodes being cyclic. `j`, `k` and `l` are not cyclic, but are a dependencies of cyclic nodes.

```ts
{
	cycles: [
		[ 'g' ], // g cycles itself
		[ 'c', 'd', 'h', 'i' ], // and then back to c...
		[ 'c', 'd', 'e', 'g', 'h', 'i' ],
		[ 'd', 'e', 'f' ],
	],
	entrypoints: [
		[ 'a' ],
		[ 'b' ],
	],
	dependencies: [ 'j', 'k', 'l' ],
	all: [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i' ] // excl dependencies
}
```


## Utilities

The package exports a helper function `sortAnalysisResult` which takes a result object (of type `AnalysisResult`) and returns a new one with all values sorted. This helps when writing tests where both the *received* and *expected* values can be sorted deterministically.



[npm-image]: https://img.shields.io/npm/v/graph-cycles.svg
[npm-url]: https://npmjs.org/package/graph-cycles
[downloads-image]: https://img.shields.io/npm/dm/graph-cycles.svg
[build-image]: https://img.shields.io/github/workflow/status/grantila/graph-cycles/Master.svg
[build-url]: https://github.com/grantila/graph-cycles/actions?query=workflow%3AMaster
[coverage-image]: https://coveralls.io/repos/github/grantila/graph-cycles/badge.svg?branch=master
[coverage-url]: https://coveralls.io/github/grantila/graph-cycles?branch=master
[lgtm-image]: https://img.shields.io/lgtm/grade/javascript/g/grantila/graph-cycles.svg?logo=lgtm&logoWidth=18
[lgtm-url]: https://lgtm.com/projects/g/grantila/graph-cycles/context:javascript
[node-version]: https://img.shields.io/node/v/graph-cycles
[node-url]: https://nodejs.org/en/
