var assert = require('assert');
var f = require('../functionize.js');

describe('curry', function() {
  var sum3 = function(x, y, z) {
    return x + y + z;
  };
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

it('gives arity', function() {
  assert.equal(f.arity(function(a, b, c) { }), 3);
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

describe('rearg', function() {
  it('rearranges arguments', function() {
    function fn(a, b, c) {
      return a + b + c;
    }
    var g = f.rearg([2, 0, 1], fn);
    assert.equal(g('a', 'b', 'c'), 'bca');
  });
});

describe('extracting methods', function() {
  describe('extracting methods from String', function() {
    it('can extract methods from String', function() {
      var S = f.map(f.fnInvoker, f.methods(String.prototype));
      assert.equal(typeof S.slice, 'function');
      assert.equal(typeof S.substr, 'function');
      assert.equal(typeof S.split, 'function');
      assert.equal(typeof S.charAt, 'function');
    });
    it('extracts useable methods', function() {
      var S = f.map(f.fnInvoker, f.methods(String.prototype));
      assert.equal(S.slice(6, undefined, 'abcdefghijklm'), 'ghijklm');
      var sliceFrom6 = S.slice(6);
      assert.equal(sliceFrom6(8, 'abcdefghijklm'), 'gh');
      assert.equal(S.trim(' horse  '), 'horse');
    });
    it('extracts methods with mapped renaming', function() {
      var S = f.mapFieldTo('slice', 'sliceTo', function(slice) {
        return slice(undefined);
      }, f.mapFieldTo('slice', 'sliceFrom', function(slice) {
        return slice(f._, undefined);
      }, f.map(f.fnInvoker, f.methods(String.prototype))));
      assert.equal(S.sliceFrom(6, 'abcdefghijklm'), 'ghijklm');
      assert.equal(S.sliceTo(4, 'abcdefghijklm'), 'abcd');
    });
  });
});
