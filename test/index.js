var assert = require('assert');
var fz = require('../functionize.js');

var sum3 = function(x, y, z) {
  return x + y + z;
};

describe('curry', function() {
  var cSum3 = fz.curryN(3, sum3);
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

describe('filter', function() {
  var obj = {one: 1, two: 2, three: 3};
  var obj2 = fz.filter(function(n) { return n > 1; }, obj);
  assert.deepEqual({two: 2, three: 3}, obj2);
});

describe('arity functions', function() {
  describe('arity', function() {
    it('gives arity of function with no arguments', function() {
      assert.equal(fz.arity(function() {}), 0);
    });
    it('gives arity', function() {
      assert.equal(fz.arity(function(a, b) { }), 2);
      assert.equal(fz.arity(function(a, b, c, d, e) { }), 5);
    });
  });
});

describe('prop', function() {
  it('returns property from obj', function() {
    var o = {foo: 1, bar: 2};
    assert.equal(fz.prop('foo', o), 1);
    assert.equal(fz.prop('bar', o), 2);
  });
});

describe('invoker', function() {
  it('returns proper curried function', function() {
    var sliceFrom = fz.invoker(1, 'slice');
    assert.equal(sliceFrom(6, 'abcdefghijklm'), 'ghijklm');
    var sliceFrom6 = fz.invoker(2, 'slice')(6);
    assert.equal(sliceFrom6(8, 'abcdefghijklm'), 'gh');
  });
  it('returns proper curried function', function() {
    var sliceFromTo = fz.fnInvoker(String.prototype.slice, 'slice');
    assert.equal(sliceFromTo(6, undefined, 'abcdefghijklm'), 'ghijklm');
    assert.equal(sliceFromTo(6, 8, 'abcdefghijklm'), 'gh');
  });
});

describe('methods', function() {
  it('can extract methods from String', function() {
    var m = fz.methods(String.prototype);
    assert.equal(typeof m.slice, 'function');
    assert.equal(typeof m.substr, 'function');
    assert.equal(typeof m.split, 'function');
    assert.equal(typeof m.charAt, 'function');
  });
  it('extracts only methods', function() {
    var m = fz.methods(dummy);
    assert.equal(typeof m.bar, 'function');
    assert.equal(m.foo, undefined);
  });
});

describe('rearg', function() {
  it('rearranges arguments', function() {
    function fn(a, b, c) {
      return a + b + c;
    }
    var g = fz.rearg([2, 0, 1], fn);
    assert.equal(g('a', 'b', 'c'), 'bca');
  });
  it('flips arguments', function() {
    function sub(x, y) { return x - y; };
    assert.equal(sub(8, 2), 6);
    assert.equal(fz.flip(sub)(2, 8), 6);
  });
});

describe('pipe', function() {
  it('concats function from left to right', function() {
    var g = function(x) { return x * 2; };
    var h = function(x) { return x + 2; };
    var i = function(x) { return x * x; };
    var p = fz.pipe([g, h, i]);
    assert.equal(p(3), 64);
  });
});

describe('apply', function() {
  it('applies array to function', function() {
    assert.equal(fz.apply(sum3, [1, 2, 3]), 6);
  });
});

describe('omit', function() {
  it('returns object without specified keys', function() {
    var o = {foo: 'bar', animal: 'rabbit', name: 'thumper'};
    var no = fz.omit(['animal', 'rabbit'], o);
    assert(!('animal' in no));
    assert(!('rabbit' in no));
    assert('foo' in no);
  });
  it('modifies in place', function() {
    var o = {foo: 'bar', animal: 'rabbit', name: 'thumper'};
    fz.omit(['animal', 'rabbit'], o);
    assert(!('animal' in o));
    assert(!('rabbit' in o));
    assert('foo' in o);
  });
});

describe('to', function() {
  it('works', function() {
    var o = {
      str: 'hello',
      nr: 3,
    };
    var no = fz.to({
      upStr: [fz.prop('str'), fz.invoker(0, 'toUpperCase')],
      lrgNr: [fz.prop('nr'), function(x) { return x*300; }],
      sameNr: [fz.prop('nr')],
    }, o);
    assert.equal(no.upStr, 'HELLO');
    assert.equal(no.lrgNr, 900);
    assert.equal(no.sameNr, 3);
  });
});

describe('converting String', function() {
  var converter = fz.pipe([
    fz.omit(['anchor', 'big', 'blink', 'bold', 'fixed', 'fontcolor',
             'fontsize', 'italics', 'link', 'small', 'strike', 'sub', 'sup']),
    fz.methods, fz.map(fz.fnInvoker),
    fz.to({
      sliceFrom: [fz.prop('slice'), fz.apply(fz._, [fz._, undefined])],
      sliceTo: [fz.prop('slice'), fz.apply(fz._, [undefined])],
      concat: [fz.prop('concat'), fz.rearg([1, 0])],
      uppercase: [fz.prop('toUpperCase')],
    }),
  ]);
  var S = converter(String.prototype);
  it('extracts methods from String', function() {
    assert.equal(typeof S.slice, 'function');
    assert.equal(typeof S.substr, 'function');
    assert.equal(typeof S.split, 'function');
    assert.equal(typeof S.charAt, 'function');
  });
  it('leaves out omitted methods', function() {
    assert(!('anchor' in S));
    assert(!('fixed' in S));
    assert(!('italics' in S));
  });
  it('extracts useable methods', function() {
    assert.equal(S.slice(6, undefined, 'abcdefghijklm'), 'ghijklm');
    var sliceFrom6 = S.slice(6);
    assert.equal(sliceFrom6(8, 'abcdefghijklm'), 'gh');
    assert.equal(S.trim(' horse  '), 'horse');
    assert.equal(S.concat('foo', 'bar'), 'foobar');
  });
  it('extracts methods with mapped renaming', function() {
    assert.equal(S.sliceFrom(6, 'abcdefghijklm'), 'ghijklm');
    assert.equal(S.sliceTo(4, 'abcdefghijklm'), 'abcd');
  });
  it('contains renamed uppercase', function() {
    assert.equal(S.uppercase('horse'), 'HORSE');
  });
});

describe('converting Array', function() {
  var converter = fz.pipe([
    fz.methods, fz.map(fz.fnInvoker),
    fz.to({
      sortBy: [fz.prop('sort')],
      sort: [fz.prop('sort'), fz.apply(fz._, [undefined])],
    }),
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
