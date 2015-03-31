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
* Take the conversion burden of other functional libraries, making them more
  focused in scope.

# How it works

functionize tries to be as unfancy as possible. And instead of writing actual
configuration you pass the library to be transformed through a series of
composed functions. This achieves simplicity and flexibility.

# Examples

## Converting String

This is a simple conversion of the standard String methods in JavaScript

```javascript
var converter = fz.pipe([
  fz.omit(['anchor', 'big', 'blink', 'bold', 'fixed', 'fontcolor',
           'fontsize', 'italics', 'link', 'small', 'strike', 'sub', 'sup']),
  fz.methods, fz.map(fz.fnInvoker),
  fz.mapTo({
    slice: {sliceFrom: [fz.apply(fz._, [fz._, undefined])],
            sliceTo: [fz.apply(fz._, [undefined])]},
    concat: {concat: [fz.rearg([1, 0])]},
    toUpperCase: {uppercase: []},
  }),
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
S.concat('foo', 'bar'); // 'foobar'

```

## Converting Array

```javascript
var converter = fz.pipe([
  fz.methods, fz.map(fz.fnInvoker),
  fz.to({
    sortBy: [fz.prop('sort')],
    sort: [fz.prop('sort'), fz.apply(fz._, [undefined])],
  }),
]);
var A = converter(Array.prototype);
```

It can be used like this

```javascript
var a = [3, 8, 4];
A.sort(a); // [3, 4, 8]
var ns = [3, 8, 4];
var square = A.map(function(x) { return x*x; }); // [9, 64, 16]
```

# API

For better documentation see the source and/or the tests.

## curryN(arity, fn)

Return a curried function with arity `arity` that calls `fn` when it has
recieved all its arguments.

## map(fn, obj)

Maps a function over an _object_(not an array). The mapper function recieves
both the object value and key.

## filter(fn, obj)

Maps a function over an object and returns an object with only the keys whose
properties satisfies the predicate function.

## arity(fn)

Returns the arity of the passed function.

## invoker(arity, methodName)

Returns a functions that applies the named method to an object.

## fnInvoker(fn, methodName)

Like `invoker`, but extracts its arity from `fn`.

## methods(obj)

Returns an object with all the objects on `obj`.

## mapFields(properties, fn, obj)

For each property in `propeties` it takes that property from `obj` passes it
through `fn` and returns an object with the keys overwritten by the result of
`fn`.

```javascript
var obj = {a: 1, bunch: 2, of: 3, properties: 4};
var newObj = fz.mapFields(['bunch', 'of'], function(x) { return x + 3; }, obj);
newObj; // {a: 1, bunch: 5, of: 3, properties: 7}
```

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

Returns a function equivalent to `fn` but with the order of its two first
arguments reversed.

_Note_: `flip` is excactly the same as `rearg([1, 0])`. Its removal is considered.

## pipe(fns)

Compose, left to right. I.e: `pipe(f, g, h)(x)` is the same as
`h(g(f(x)))`.

## apply(fn, arr)

Calls `fn` with the arguments specified in `arr`.

## omit(keys, obj)

Returns `obj` without the keys mentioned in `keys`.
