# functionize
A collection of functions which aids in making non-functional libraries
functional.

_Note_: functionize is currently in an early stage. If you have ideas or a
different vision about how such a library should be, please share them.

# Background

functionize is based on the idea that an ideal function should
usually satisfy the following requirements.

* Be curried, i.e. return a partial applied version of itself when called with
  too few arguments.
* Have a fixed arity (i.e take a constant amount of arguments).
* Take any data it operates on as its last argument. This discourages the use
  of functions that operate on a bound context (`this`).

Unfortunately the above ideas are not shared by the majority of the JavaScript
community thus the need for functionize.

# Goals

* Make it easy and concise to convert any library into one that adheres to the above
  criteria as much as possible.
* Facilitate sharing and reuse of such library conversions.
* Take the conversion burden of other functional libraries making them more
  focused in scope.

# Example

This is a simple conversion of the standard String methods in JavaScript

```javascript
var converter = fz.pipe([
  fz.methods, fz.map(fz.fnInvoker),
  fz.mapFieldTo('slice', 'sliceFrom', fz.apply(fz._, [fz._, undefined])),
  fz.mapFieldTo('slice', 'sliceTo', fz.apply(fz._, [undefined])),
  fz.dupTo('toUpperCase', 'uppercase'),
]);
var S = converter(String.prototype);
```

It can be used like this

```javascript
// Slicing
var sliceFrom6 = S.slice(6); // functions are curried
sliceFrom6(8, 'abcdefghijklm'); // 'gh'
S.sliceTo(4, 'abcdefghijklm'); // 'abcd'

S.trim(' horse  '); // 'horse'

S.uppercase('foobar'); // 'FOOBAR'
```

# API

For better documentation see the source and/or the tests.

## curryN(arity, fn)

## map(fn, obj)

Maps a function over an object. The mapper function recieves both the
object value and key.

## arity(fn)

Returns the arity of the passed function.

## invoker(arity, method)

Returns a functions that applies the named method to an object.

## methods(obj)

Returns an object with all the objects on `obj`.

## mapFields(keys, fn, obj)

## mapFieldTo(keys, fn, obj)

## rearg(newOrder, fn)

Rearranges the arguments of a function.

```javascript
function f(a, b, c) {
  return a + b + c;
}
var g = fz.rearg([2, 0, 1], fn);
g('a', 'b', 'c'); // 'bca'
```

## flip(fn)

## pipe(fns)

Compose, left to right. I.e: `pipe(f, g, h)(x)` is the same as
`h(g(f(x)))`.

## apply(fn, arr)

