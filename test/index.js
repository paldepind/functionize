var assert = require('assert');
var f = require('../functionize.js');

var sum3 = function(x, y, z) {
  return x + y + z;
};

describe('curry', function() {
  var cSum3 = f.curryN(3, sum3);
  var addDiv = function(x, y, z) {
    return (x + y) / z;
  };
  it('supports simple currying', function() {
    assert.equal(cSum3(1)(2)(3), 6);
    assert.equal(cSum3(1, 2)(3), 6);
    assert.equal(cSum3(1)(2, 3), 6);
  });
  it('handles gaps/holes', function() {
  });
});

var dummy = {
  foo: 'horse',
  bar: function() { return 'no-op'; },
};

describe('arity functions', function() {
  describe('arity', function() {
    it('gives arity of function with no arguments', function() {
      assert.equal(f.arity(function() {}), 0);
    });
    it('gives arity', function() {
      assert.equal(f.arity(function(a, b) { }), 2);
      assert.equal(f.arity(function(a, b, c, d, e) { }), 5);
    });
  });
});

describe('invoker', function() {
  it('returns proper curried function', function() {
    var sliceFrom = f.invoker(1, 'slice');
    assert.equal(sliceFrom(6, 'abcdefghijklm'), 'ghijklm');
    var sliceFrom6 = f.invoker(2, 'slice')(6);
    assert.equal(sliceFrom6(8, 'abcdefghijklm'), 'gh');
  });
  it('returns proper curried function', function() {
    var sliceFromTo = f.fnInvoker(String.prototype.slice, 'slice');
    assert.equal(sliceFromTo(6, undefined, 'abcdefghijklm'), 'ghijklm');
    assert.equal(sliceFromTo(6, 8, 'abcdefghijklm'), 'gh');
  });
});

describe('methods', function() {
  it('can extract methods from String', function() {
    var m = f.methods(String.prototype);
    assert.equal(typeof m.slice, 'function');
    assert.equal(typeof m.substr, 'function');
    assert.equal(typeof m.split, 'function');
    assert.equal(typeof m.charAt, 'function');
  });
  it('extracts only methods', function() {
    var m = f.methods(dummy);
    assert.equal(typeof m.bar, 'function');
    assert.equal(m.foo, undefined);
  });
});

describe('mapField', function() {
  var upper = f.invoker(0, 'toUpperCase');
  it('applies a function to a field', function() {
    var o = {foo: 'bar', animal: 'rabbit'};
    var mo = f.mapFields(['foo'], upper, o);
    assert.equal(mo.foo, 'BAR');
  });
  it('applies a function to all fields', function() {
    var o = {foo: 'bar', animal: 'rabbit', name: 'Simon'};
    var mo = f.mapFields(['animal', 'name'], upper, o);
    assert.equal(mo.animal, 'RABBIT');
    assert.equal(mo.name, 'SIMON');
    assert.equal(mo.foo, 'bar');
  });
  it('applies a function to a field an saves in new field', function() {
    var o = {foo: 'bar', animal: 'rabbit'};
    var mo = f.mapFieldTo('foo', 'bar', upper, o);
    assert.equal(mo.bar, 'BAR');
  });
});

describe('dupTo', function() {
  var o = {one: 1, two: 2};
  o = f.dupTo('one', 'uno', o);
  assert.deepEqual(o, {
    one: 1, two: 2, uno: 1
  });
});

describe('rearg', function() {
  it('rearranges arguments', function() {
    function fn(a, b, c) {
      return a + b + c;
    }
    var g = f.rearg([2, 0, 1], fn);
    assert.equal(g('a', 'b', 'c'), 'bca');
  });
  it('flips arguments', function() {
    function sub(x, y) { return x - y; };
    assert.equal(sub(8, 2), 6);
    assert.equal(f.flip(sub)(2, 8), 6);
  });
});

describe('pipe', function() {
  it('concats function from left to right', function() {
    var g = function(x) { return x * 2; };
    var h = function(x) { return x + 2; };
    var i = function(x) { return x * x; };
    var p = f.pipe([g, h, i]);
    assert.equal(p(3), 64);
  });
});

describe('apply', function() {
  it('applies array to function', function() {
    assert.equal(f.apply(sum3, [1, 2, 3]), 6);
  });
});

describe('converting String', function() {
  var converter = f.pipe([
    f.methods, f.map(f.fnInvoker),
    f.mapFieldTo('slice', 'sliceFrom', f.apply(f._, [f._, undefined])),
    f.mapFieldTo('slice', 'sliceTo', f.apply(f._, [undefined])),
  ]);
  var S = converter(String.prototype);
  it('can extract methods from String', function() {
    assert.equal(typeof S.slice, 'function');
    assert.equal(typeof S.substr, 'function');
    assert.equal(typeof S.split, 'function');
    assert.equal(typeof S.charAt, 'function');
  });
  it('extracts useable methods', function() {
    assert.equal(S.slice(6, undefined, 'abcdefghijklm'), 'ghijklm');
    var sliceFrom6 = S.slice(6);
    assert.equal(sliceFrom6(8, 'abcdefghijklm'), 'gh');
    assert.equal(S.trim(' horse  '), 'horse');
  });
  it('extracts methods with mapped renaming', function() {
    assert.equal(S.sliceFrom(6, 'abcdefghijklm'), 'ghijklm');
    assert.equal(S.sliceTo(4, 'abcdefghijklm'), 'abcd');
  });
});

describe('converting Array', function() {
  var converter = f.pipe([
    f.methods, f.map(f.fnInvoker),
    f.dupTo('sort', 'sortBy'),
    f.mapFields(['sort'], f.apply(f._, [undefined])),
  ]);
  var A = converter(Array.prototype);
  it('can sort', function() {
    var a = [3, 8, 4];
    A.sort(a);
    assert.deepEqual(a, [3, 4, 8]);
  });
  it('can map', function() {
    var a = [3, 8, 4];
    var square = A.map(function(x) { return x*x; });
    assert.deepEqual(square(a), [9, 64, 16]);
  });
});
