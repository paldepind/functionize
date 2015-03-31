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
var ofArity = exports.ofArity = function ofArity(n, fn) {
  if (arguments.length === 1) {
    return ofArity.bind(undefined, n);
  }
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

var filter = exports.filter = curryN(2, function(fn, obj) {
  var ret = {};
  var keys = Object.getOwnPropertyNames(obj);
  for (var i = 0; i < keys.length; ++i) {
    var key = keys[i];
    if (fn(obj[key])) {
      ret[key] = obj[key];
    }
  }
  return ret;
});

var arity = exports.arity = function(fn) { return fn.length; };

var prop = exports.prop = curryN(2, function(key, obj) {
  return obj[key];
});

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

var methods = exports.methods = filter(function(f) {
  return typeof f === 'function';
});

var mapFields = exports.mapFields = curryN(3, function(keys, fn, obj) {
  for (var i = 0; i < keys.length; ++i) {
    obj[keys[i]] = fn(obj[keys[i]]);
  }
  return obj;
});

var rearg = exports.rearg = curryN(2, function(newOrder, fn) {
  var l = newOrder.length;
  return ofArity(l, function() {
    var args = [];
    for (var i = 0; i < l; ++i) {
      args[newOrder[i]] = arguments[i];
    }
    return fn.apply(undefined, args);
  });
});

var flip = exports.flip = rearg([1, 0]);

var pipe = exports.pipe = function(fns) {
  return function(v) {
    return fns.reduce(function(v, fn) {
      return fn(v);
    }, v);
  };
};

var apply = exports.apply = curryN(2, function(fn, arr) {
  return fn.apply(this, arr);
});

var omit = exports.omit = curryN(2, function(keys, obj) {
  for (var i = 0; i < keys.length; ++i) {
    delete obj[keys[i]];
  }
  return obj;
});

var to = exports.to = curryN(2, function(toMap, obj) {
  for (var key in toMap) {
    obj[key] = pipe(toMap[key])(obj);
  }
  return obj;
});
