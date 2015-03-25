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

describe('invoker', function() {
  var sliceFrom = f.invoker(1, 'slice');
  assert.equal(sliceFrom(6, 'abcdefghijklm'), 'ghijklm');
  var sliceFrom6 = f.invoker(2, 'slice')(6);
  assert.equal(sliceFrom6(8, 'abcdefghijklm'), 'gh');
});

describe('extracting methods', function() {
  describe('extracting methods from String', function() {
    it('can extract methods from String', function() {
      var S = f.extractMethods(String.prototype);
      assert.equal(typeof S.slice, 'function');
      assert.equal(typeof S.substr, 'function');
      assert.equal(typeof S.split, 'function');
      assert.equal(typeof S.charAt, 'function');
    });
    it('extracts useable methods', function() {
      var S = f.extractMethods(String.convert);
      assert.equal(S.slice(6, undefined, 'abcdefghijklm'), 'ghijklm');
      var sliceFrom6 = S.slice(6);
      assert.equal(sliceFrom6(8, 'abcdefghijklm'), 'gh');
      assert.equal(S.trim(' horse  '), 'horse');
    });
  });
});
