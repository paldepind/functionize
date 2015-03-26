var _ = exports._ = {placeholder: true};

// Detect both own and Ramda placeholder
function isPlaceholder(p) {
  return p === _ || (p && p.ramda === 'placeholder');
}

function toArray(arg) {
  var arr = [];
  for (var i = 0; i < arg.length; ++i) {
    arr[i] = arg[i];
  }
  return arr;
}

// Modified versions of arity and curryN from Ramda
var ofArity = function (n, fn) {
  switch (n) {
  case 0:
    return function () {
      return fn.apply(this, arguments);
    };
  case 1:
    return function (a0) {
      void a0;
      return fn.apply(this, arguments);
    };
  case 2:
    return function (a0, a1) {
      void a1;
      return fn.apply(this, arguments);
    };
  case 3:
    return function (a0, a1, a2) {
      void a2;
      return fn.apply(this, arguments);
    };
  case 4:
    return function (a0, a1, a2, a3) {
      void a3;
      return fn.apply(this, arguments);
    };
  case 5:
    return function (a0, a1, a2, a3, a4) {
      void a4;
      return fn.apply(this, arguments);
    };
  case 6:
    return function (a0, a1, a2, a3, a4, a5) {
      void a5;
      return fn.apply(this, arguments);
    };
  case 7:
    return function (a0, a1, a2, a3, a4, a5, a6) {
      void a6;
      return fn.apply(this, arguments);
    };
  case 8:
    return function (a0, a1, a2, a3, a4, a5, a6, a7) {
      void a7;
      return fn.apply(this, arguments);
    };
  case 9:
    return function (a0, a1, a2, a3, a4, a5, a6, a7, a8) {
      void a8;
      return fn.apply(this, arguments);
    };
  case 10:
    return function (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
      void a9;
      return fn.apply(this, arguments);
    };
  default:
    throw new Error('First argument to arity must be a non-negative integer no greater than ten');
  }
};

var curryN = exports.curryN = function curryN(length, fn) {
  return ofArity(length, function () {
    var n = arguments.length;
    var shortfall = length - n;
    var idx = n;
    while (--idx >= 0) {
      if (isPlaceholder(arguments[idx])) {
        shortfall += 1;
      }
    }
    if (shortfall <= 0) {
      return fn.apply(this, arguments);
    } else {
      var initialArgs = toArray(arguments);
      return curryN(shortfall, function () {
        var currentArgs = toArray(arguments);
        var combinedArgs = [];
        var idx = -1;
        while (++idx < n) {
          var val = initialArgs[idx];
          combinedArgs[idx] = isPlaceholder(val) ? currentArgs.shift() : val;
        }
        return fn.apply(this, combinedArgs.concat(currentArgs));
      });
    }
  });
};

var map = exports.map = curryN(2, function(fn, l) {
  for (var key in l) {
    l[key] = fn(l[key], key);
  }
  return l;
});

var arity = exports.arity = function(fn) { return fn.length; };

var invoker = exports.invoker = curryN(2, function invoker(arity, method) {
  return curryN(arity + 1, function () {
    var target = arguments[arguments.length - 1];
    var args = Array.prototype.slice.call(arguments, 0, -1);
    return target[method].apply(target, args);
  });
});

var fnInvoker = exports.fnInvoker = curryN(2, function(fn, method) {
  return invoker(arity(fn), method);
});

var methods = exports.methods = function(obj) {
  var ret = {};
  var keys = Object.getOwnPropertyNames(obj);
  for (var i = 0; i < keys.length; ++i) {
    var key = keys[i];
    if (typeof obj[key] === 'function') {
      ret[key] = obj[key];
    }
  }
  return ret;
};

var convert = exports.convert = function(obj) {
  var ret = {};
  var keys = Object.getOwnPropertyNames(obj);
  for (var i = 0; i < keys.length; ++i) {
    var key = keys[i];
    if (typeof obj[key] === 'function') {
      ret[key] = invoker(obj[key].length, key);
    }
  }
  return ret;
};

var mapField = exports.mapFields = function(keys, fn, obj) {
  for (var i = 0; i < keys.length; ++i) {
    obj[keys[i]] = fn(obj[keys[i]]);
  }
  return obj;
};

var mapField = exports.mapFieldTo = function(key, newKey, fn, obj) {
  obj[newKey] = fn(obj[key]);
  return obj;
};
