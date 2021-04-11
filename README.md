[![npm version][npm-image]][npm-url]
[![downloads][downloads-image]][npm-url]
[![build status][build-image]][build-url]
[![coverage status][coverage-image]][coverage-url]
[![Language grade: JavaScript][lgtm-image]][lgtm-url]
[![Node.JS version][node-version]][node-url]


# graph-cycles

Analyze a graph to find cyclic loops, entrypoints to them and dependencies of them.

This package provides two analysis functions, `analyzeGraph` and `analyzeGraphFast`. Beware of the former for very large graphs, especially with massive cyclicity, it can run out of memory or crash your Node process (if you run in Node). If in doubt, or if an in-depth analysis isn't necessary, choose the fast method.


## Example

Consider the following graph:

```ts
const graph = [
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
];
```

In this example, node `a` points to `b` and `c`; `b` points to `c` and `j`, etc. This can be drawn as:

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
m → { l }
// These will be found not to be cyclic (and not returned by the analysis):
x → { y }
z → { x y }

Cyclic cluster:
                  ⬈ ⬊
    j   i ← h ← g ← ⬋       m
    ↑   ↓   ↑   ↑           ↓
a → b → c → d → e → f → k → l
 ⬊ ___ ⬈     ⬉ ___ ⬋

Non-cyclic cluster:
z → x → y
 ⬊ ___ ⬈
```

This example shows a few cycles.

In the full analysis (`analyzeGraph`), the last entry of a cycle always point to the first entry, and is excluded in the cycle array. Cycles are only returned once with an arbitrary node as a starting point. The returned object contains all unique cycles, all entrypoints (node paths *into* a cycle), and then all individual nodes being cyclic. `j`, `k` and `l` are not cyclic, but are a dependencies of cyclic nodes. `m` is not cyclic either, but depends on a node which cyclic nodes also depend on.


# API

`analyzeGraph` and `analyzeGraphFast` take a list of `[ from, [ ...to ] ]` pairs and return the graph analysis.


## Full analysis mode

```ts
import { analyzeGraph } from 'graph-cycles'

const analysis = analyzeGraph( graph ); // <graph> from above

const { cycles, entrypoints, dependencies, dependents, all } = analysis;
```

The result object is on the form:

```ts
interface FullAnalysisResult {
    cycles: Array< Array< string > >;
    entrypoints: Array< Array< string > >;
    dependencies: Array< string >;
    dependents: Array< string >;
    all: Array< string >;
}
```

where `cycles` is an array of the cyclic loops, `entrypoints` the entrypoints (or entrypoint *paths*) which lead to a cyclic loop, `dependencies` is the nodes cyclic nodes *depend on*, and `dependents` are non-cyclic nodes depending on dependencies also dependent on by cyclic nodes. And `all` is all individual nodes which either lead to a cyclic loop (entrypoints) or are in one (excluding dependencies and dependents). `all` is all nodes *being* cyclic or *leading up to* cycles.

For the example above, the result would be:

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
    dependents: [ 'm' ],
    all: [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i' ] // excl dependencies
}
```

## Fast analysis mode

```ts
import { analyzeGraphFast } from 'graph-cycles'

const analysis = analyzeGraphFast( graph ); // <graph> from above

const { cyclic, dependencies, dependents } = analysis;
```

The result object is on the form:

```ts
interface FastAnalysisResult
{
    cyclic: Array< string >;
    dependencies: Array< string >;
    dependents: Array< string >;
}
```

In the fast mode (`analyzeGraphFast`), entrypoints and cycles are merged into `cycles` and there's no concept of individual (unique) cycles; instead `cyclic` is an array of all cyclic (or *leading up to* cyclic) nodes. This is the same as `all` in the full analysis mode.

For the example above, the result would be:

```ts
{
    cyclic: [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i' ],
    dependencies: [ 'j', 'k', 'l' ],
    dependents: [ 'm' ]
}
```


## Utilities

The package exports two helper functions `sortFullAnalysisResult`, `sortFastAnalysisResult` which take a result object (of type `FullAnalysisResult` or `FastAnalysisResult`) and return a new one with all values sorted. This helps when writing tests where both the *received* and *expected* values can be sorted deterministically. The sort order is deterministic but not respecting locale, as it's using [`fast-string-compare`](https://github.com/grantila/fast-string-compare) to be fast.

Example:

```ts
import { analyzeGraphFast, sortFastAnalysisResult } from 'graph-cycles'

const analysis = sortFastAnalysisResult( analyzeGraphFast( graph ) );

// analysis can now be used for e.g. snapshots - its content is "stable"
```



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
