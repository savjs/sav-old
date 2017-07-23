'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var VueRouter = _interopDefault(require('vue-router'));
var Vue = _interopDefault(require('vue'));
var vueServerRenderer = require('vue-server-renderer');

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var savUtil_cjs = createCommonjsModule(function (module, exports) {
/*!
 * sav-util v0.0.7
 * (c) 2016 jetiny 86287344@qq.com
 * Release under the MIT License.
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function toStringType(val) {
  return Object.prototype.toString.call(val).slice(8, -1);
}

var isArray = Array.isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}

function isString(arg) {
  return typeof arg === 'string';
}

function isFunction(arg) {
  return typeof arg === 'function';
}

function isObject(arg) {
  return toStringType(arg) === 'Object' && arg !== null;
}

function isNumber(arg) {
  return typeof arg === 'number' && !isNaN(arg);
}

function isInteger(arg) {
  return isNumber(arg) && parseInt(arg) === arg;
}

function isUndefined(arg) {
  return arg === undefined;
}

function isNull(arg) {
  return arg === null;
}

function isNan(arg) {
  return typeof arg === 'number' && isNaN(arg);
}

function isRegExp(arg) {
  return toStringType(arg) === 'RegExp';
}

function isDate(arg) {
  return toStringType(arg) === 'Date';
}

function typeValue(arg) {
  if (isNan(arg)) {
    return 'Nan';
  }
  switch (arg) {
    case undefined:
      return 'Undefined';
    case null:
      return 'Null';
    default:
      return toStringType(arg);
  }
}

var isInt = isInteger;
function isUint(arg) {
  return isInteger(arg) && arg >= 0;
}

var types = {
  isBoolean: isBoolean,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isArray: isArray,
  isFunction: isFunction,
  isRegExp: isRegExp,
  isDate: isDate,
  isNull: isNull,
  isUndefined: isUndefined,
  isInt: isInt,
  isUint: isUint
};

function defined(val) {
  return val !== 'undefined';
}

var probe = {
  Map: defined(typeof Map),
  Proxy: defined(typeof Proxy),
  MessageChannel: defined(typeof MessageChannel),
  localStorage: defined(typeof localStorage),
  XMLHttpRequest: defined(typeof XMLHttpRequest),
  MutationObserver: defined(typeof MutationObserver),
  FormData: defined(typeof FormData),
  window: defined(typeof window),
  document: defined(typeof document)
};

/*
 * @Description      URL解析
 * @File             url.js
 * @Auth             jetiny@hfjy.com
 */

// jsuri https://code.google.com/r/jonhwendell-jsuri/
// https://username:password@www.test.com:8080/path/index.html?this=that&some=thing#content
var REKeys = ['source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'];
var URL_RE = /^(?:(?![^:@]+:[^:@/]*@)([^:/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#/]*\.[^?#/.]+(?:[?#]|$)))*\/?)?([^?#/]*))(?:\?([^#]*))?(?:#(.*))?)/;

function parseUrl(str) {
  var _uri = {};
  var _m = URL_RE.exec(str || '');
  var _i = REKeys.length;
  while (_i--) {
    _uri[REKeys[_i]] = _m[_i] || '';
  }
  return _uri;
}

function stringifyUrl(uri) {
  var str = '';
  if (uri) {
    if (uri.host) {
      if (uri.protocol) {
        str += uri.protocol + ':';
      }
      str += '//';
      if (uri.user) {
        str += uri.user + ':';
      }
      if (uri.password) {
        str += uri.password + '@';
      }
      str += uri.host;
      if (uri.port) {
        str += ':' + uri.port;
      }
    }
    str += uri.path || '';
    if (uri.query) {
      str += '?' + uri.query;
    }
    if (uri.anchor) {
      str += '#' + uri.anchor;
    }
  }
  return str;
}

var Url = {
  parse: parseUrl,
  stringify: stringifyUrl
};

var _encode = encodeURIComponent;
var r20 = /%20/g;
var rbracket = /\[]$/;

function buildParams(prefix, obj, add) {
  if (Array.isArray(obj)) {
    // Serialize array item.
    obj.forEach(function (v, i) {
      if (rbracket.test(prefix)) {
        // Treat each array item as a scalar.
        add(prefix, v);
      } else {
        // Item is non-scalar (array or object), encode its numeric index.
        buildParams(prefix + '[' + (typeof v === 'object' ? i : '') + ']', v, add);
      }
    });
  } else if (isObject(obj)) {
    // Serialize object item.
    for (var name in obj) {
      buildParams(prefix + '[' + name + ']', obj[name], add);
    }
  } else {
    // Serialize scalar item.
    add(prefix, obj);
  }
}

// # http://stackoverflow.com/questions/1131630/the-param-inverse-function-in-javascript-jquery
// a[b]=1&a[c]=2&d[]=3&d[]=4&d[2][e]=5 <=> { a: { b: 1, c: 2 }, d: [ 3, 4, { e: 5 } ] }
function parseQuery(str, opts) {
  if (opts === void 0) opts = {};

  var _querys = {};
  decodeURIComponent(str || '').replace(/\+/g, ' '
  // (optional no-capturing & )(key)=(value)
  ).replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function ($0, _name, _value) {
    if (_name) {
      var _path, _acc, _tmp, _ref;
      (_path = []).unshift(_name = _name.replace(/\[([^\]]*)]/g, function ($0, _k) {
        _path.push(_k);
        return '';
      }));
      _ref = _querys;
      for (var j = 0; j < _path.length - 1; j++) {
        _acc = _path[j];
        _tmp = _path[j + 1];
        if (!_ref[_acc]) {
          _ref[_acc] = _tmp === '' || /^[0-9]+$/.test(_tmp) ? [] : {};
        }
        _ref = _ref[_acc];
      }
      if (opts.boolval) {
        // first
        if (_value === 'true') {
          _value = true;
        } else if (_value === 'false') {
          _value = false;
        }
      } else if (opts.intval) {
        // skip "true" & "false"
        if (_tmp = parseInt(_value) === _value) {
          _value = _tmp;
        }
      }
      if ((_acc = _path[_path.length - 1]) === '') {
        _ref.push(_value);
      } else {
        _ref[_acc] = _value;
      }
    }
  });
  return _querys;
}

function stringifyQuery(query) {
  // # http://api.jquery.com/jQuery.param
  var _add = function (key, value) {
    /* jshint eqnull:true */
    _str.push(_encode(key) + '=' + (value === null || value === undefined ? '' : _encode(value)));
    // _str.push(( key ) + "=" +  (value == null ? "" : ( value )));
  };
  var _str = [];
  query || (query = {});
  for (var x in query) {
    buildParams(x, query[x], _add);
  }
  return _str.join('&').replace(r20, '+');
}

var Query = {
  parse: parseQuery,
  stringify: stringifyQuery
};

function extend() {
  var arguments$1 = arguments;

  // form jQuery & remove this
  var options, name, src, copy, copyIsArray, clone;
  var target = arguments[0] || {};
  var i = 1;
  var length = arguments.length;
  var deep = false;
  if (isBoolean(target)) {
    deep = target;
    target = arguments[i] || {};
    i++;
  }
  if (typeof target !== 'object' && !isFunction(target)) {
    target = {};
  }
  for (; i < length; i++) {
    options = arguments$1[i];
    /* jshint eqnull:true */
    if (options != null) {
      for (name in options) {
        src = target[name];
        copy = options[name];
        if (target !== copy) {
          if (deep && copy && (isObject(copy) || (copyIsArray = isArray(copy)))) {
            if (copyIsArray) {
              copyIsArray = false;
              clone = src && isArray(src) ? src : [];
            } else {
              clone = src && isObject(src) ? src : {};
            }
            target[name] = extend(deep, clone, copy);
          } else {
            target[name] = copy;
          }
        }
      }
    }
  }
  return target;
}

function clone(val) {
  if (isArray(val)) {
    return extend(true, [], val);
  } else if (isObject(val)) {
    return extend(true, {}, val);
  }
  return extend(true, [], [val])[0];
}

/**
 * 对象或数组遍历
 * @param  {Array|Object} obj      要遍历的对象
 * @param  {Function} iterator 遍历函数，统一遵循值在前的模式
 * @param  {Mixed} context  上下文对象
 * @return {Mixed}          返回要遍历的对象
 *
 * @example
 * each(['a','b'], function(val, key){
 *     if (val == 'a') {
 *         console.log(val);
 *         return false;
 *     }
 * });
 */
function each(obj, iterator, context) {
  if (obj) {
    var _length = obj.length;
    var _key;
    if (_length === +_length) {
      // array like
      for (_key = 0; _key < _length; _key++) {
        if (iterator.call(context, obj[_key], _key) === false) {
          return obj;
        }
      }
    } else {
      // object
      for (_key in obj) {
        if (obj.hasOwnProperty(_key)) {
          if (iterator.call(context, obj[_key], _key) === false) {
            return obj;
          }
        }
      }
    }
  }
  return obj;
}

function unique(arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError('array-unique expects an array.');
  }
  var len = arr.length;
  var i = -1;
  while (i++ < len) {
    var j = i + 1;
    for (; j < arr.length; ++j) {
      if (arr[i] === arr[j]) {
        arr.splice(j--, 1);
      }
    }
  }
  return arr;
}

function isPromiseLike(obj) {
  return obj && obj.then;
}

function uuid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function guid() {
  return new Date().getTime().toString(32) + Math.floor(Math.random() * 10000000000).toString(32) + s4();
}

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

function inherits(ctor, superCtor, useSuper) {
  Object.setPrototypeOf(ctor.prototype, superCtor.prototype);
  // same as
  // ctor.prototype = new superCtor;
  // ctor.prototype.constructor = superCtor;

  // ctor.prototype.name = 'ctor';
  if (useSuper) {
    ctor.super_ = superCtor;
  }
  return ctor;
}

function prop(target, key, value) {
  Object.defineProperty(target, key, { value: value });
}

function strRepeat(s, n) {
  return new Array(Math.max(n || 0, 0) + 1).join(s);
}

function noop() {}

function splitEach(str, callback, chr, context) {
  return str.split(chr || ' ').forEach(callback, context);
}

function proxy(fn, context) {
  return function () {
    fn.apply(context, arguments);
  };
}

function formatDate(fmt, date) {
  if (!fmt) {
    fmt = 'yyyy-MM-dd';
  }
  if (!date) {
    date = new Date();
  } else {
    date = new Date(date);
  }
  var o = {
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'h+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    'S': date.getMilliseconds // 毫秒
    () };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
    }
  }
  return fmt;
}

function bindEvent(target) {
  var _events = {};
  prop(target, 'on', function (event, fn) {
    (_events[event] || (_events[event] = [])).push(fn);
  });

  prop(target, 'off', function (event, fn) {
    if (_events[event]) {
      var list = _events[event];
      if (fn) {
        var pos = list.indexOf(fn);
        if (pos !== -1) {
          list.splice(pos, 1);
        }
      } else {
        delete _events[event];
      }
    }
  });

  prop(target, 'once', function (event, fn) {
    var once = function () {
      var args = [],
          len = arguments.length;
      while (len--) args[len] = arguments[len];

      target.off(event, fn);
      fn.apply(void 0, args);
    };
    target.on(event, once);
  });

  prop(target, 'subscribe', function (event, fn) {
    target.on(event, fn);
    return function () {
      target.off(event, fn);
    };
  });

  prop(target, 'emit', function (event) {
    var args = [],
        len = arguments.length - 1;
    while (len-- > 0) args[len] = arguments[len + 1];

    if (_events[event]) {
      var list = _events[event].slice();
      var fn;
      while (fn = list.shift()) {
        fn.apply(void 0, args);
      }
    }
  });
}

var PROMISE = Promise;
var promise = {
  resolve: PROMISE.resolve.bind(PROMISE),
  reject: PROMISE.reject.bind(PROMISE),
  all: PROMISE.all.bind(PROMISE),
  then: function (fn) {
    return new PROMISE(fn);
  }
};

/**
 * ajax 方法
 * @param  {Object}   opts 请求对象
 * {
 *     method:"GET",
 *     dataType:"JSON",
 *     headers:{},
 *     url:"",
 *     data:{},
 * }
 * @param  {Function} next 回调
 * @return {XMLHttpRequest}        xhr对象
 */
function ajax(opts, next) {
  var method = (opts.method || 'GET').toUpperCase();
  var dataType = (opts.dataType || 'JSON').toUpperCase();
  var timeout = opts.timeout;
  /* global XMLHttpRequest */
  var req = new XMLHttpRequest();
  var data = null;
  var isPost = method === 'POST';
  var isGet = method === 'GET';
  var isFormData = false;
  var emit = function (err, data, headers) {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    req.onload = req.onreadystatechange = req.onerror = null;
    if (next) {
      var tmp = next;
      next = null;
      tmp(err, data, headers);
    }
  };
  if (isGet) {
    if (opts.data) {
      var u = parseUrl(opts.url);
      var q = parseQuery(u.query);
      for (var x in opts.data) {
        q[x] = opts.data[x];
      }
      u.query = stringifyQuery(q);
      opts.url = stringifyUrl(u);
      opts.data = null;
    }
  } else if (isPost) {
    data = opts.data;
    /* global FormData */
    if (probe.FormData) {
      isFormData = data instanceof FormData;
      if (!isFormData) {
        data = stringifyQuery(data);
      }
    }
  }
  if (timeout) {
    timeout = setTimeout(function () {
      req.abort();
      emit(new Error('error_timeout'));
    }, timeout);
  }
  try {
    opts.xhr && opts.xhr(req);
    if (dataType === 'BINARY') {
      req.responseType = 'arraybuffer';
    }
    req.open(method, opts.url, true);
    if (opts.headers) {
      for (var x$1 in opts.headers) {
        req.setRequestHeader(x$1, opts.headers[x$1]);
      }
    }
    if (isPost && !isFormData) {
      req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    }
    if (opts.headerOnly) {
      req.onreadystatechange = function () {
        // console.log('state', req.readyState, req);
        if (req.readyState === 2) {
          // HEADERS_RECEIVED
          var headers = parseHeaders(req.getAllResponseHeaders(), opts.camelHeaders);
          req.abort();
          emit(null, undefined, headers);
        }
      };
    }
    req.onload = function () {
      // if(req.readyState != 4) return;
      if ([200, 304, 206, 0].indexOf(req.status) === -1) {
        // error
        emit(new Error('error_status_' + req.status));
      } else {
        var data = req.response;
        try {
          if (dataType === 'JSON') {
            data = JSON.parse(req.responseText);
          } else if (dataType === 'XML') {
            data = req.responseXML;
          } else if (dataType === 'TEXT') {
            data = req.responseText;
          } else if (dataType === 'BINARY') {
            var arrayBuffer = new Uint8Array(data);
            var str = '';
            for (var i = 0; i < arrayBuffer.length; i++) {
              str += String.fromCharCode(arrayBuffer[i]);
            }
            data = str;
          }
        } catch (err) {
          return emit(err);
        }
        emit(null, data, parseHeaders(req.getAllResponseHeaders(), opts.camelHeaders));
      }
    };
    req.onerror = function (e) {
      emit(new Error('error_network'));
    };
    // 进度
    if (opts.onprogress && !opts.headerOnly) {
      req.onloadend = req.onprogress = function (e) {
        var info = {
          total: e.total,
          loaded: e.loaded,
          percent: e.total ? Math.trunc(100 * e.loaded / e.total) : 0
        };
        if (e.type === 'loadend') {
          info.percent = 100;
        } else if (e.total === e.loaded) {
          return;
        }
        if (e.total < e.loaded) {
          info.total = info.loaded;
        }
        if (info.percent === 0) {
          return;
        }
        opts.onprogress(info);
      };
    }
    req.send(data);
  } catch (e) {
    emit(e);
  }
  return req;
}

function parseHeaders(str, camelHeaders) {
  var ret = {};
  str.trim().split('\n').forEach(function (key) {
    key = key.replace(/\r/g, '');
    var arr = key.split(': ');
    var name = arr.shift().toLowerCase();
    ret[camelHeaders ? camelCase(name) : name] = arr.shift();
  });
  return ret;
}

function camelCase(s) {
  return s.replace(/-(.)/g, function (a, $1) {
    return $1.toUpperCase();
  });
}

exports.isArray = isArray;
exports.isBoolean = isBoolean;
exports.isString = isString;
exports.isFunction = isFunction;
exports.isObject = isObject;
exports.isNumber = isNumber;
exports.isInteger = isInteger;
exports.isUndefined = isUndefined;
exports.isNull = isNull;
exports.isNan = isNan;
exports.isRegExp = isRegExp;
exports.isDate = isDate;
exports.typeValue = typeValue;
exports.isInt = isInt;
exports.isUint = isUint;
exports.types = types;
exports.probe = probe;
exports.parseUrl = parseUrl;
exports.stringifyUrl = stringifyUrl;
exports.Url = Url;
exports.parseQuery = parseQuery;
exports.stringifyQuery = stringifyQuery;
exports.Query = Query;
exports.clone = clone;
exports.each = each;
exports.extend = extend;
exports.bindEvent = bindEvent;
exports.unique = unique;
exports.isPromiseLike = isPromiseLike;
exports.uuid = uuid;
exports.guid = guid;
exports.inherits = inherits;
exports.prop = prop;
exports.strRepeat = strRepeat;
exports.noop = noop;
exports.splitEach = splitEach;
exports.proxy = proxy;
exports.formatDate = formatDate;
exports.promise = promise;
exports.ajax = ajax;
});

var savFlux_cjs$1 = createCommonjsModule(function (module, exports) {
/*!
 * sav-flux v0.0.16
 * (c) 2017 jetiny 86287344@qq.com
 * Release under the MIT License.
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });



function Flux(opts) {
  if (opts === void 0) opts = { strict: true };

  var flux = this;
  var prop = initProp(flux);
  prop('flux', flux);
  prop('prop', prop);
  prop('mutations', {});
  prop('actions', {});
  prop('proxys', {});
  prop('opts', opts);
  initUse(flux)([initUtil, savUtil_cjs.bindEvent, initPromise, initCloneThen, initState, initCommit, initDispatch, initProxy, initDeclare]);
}

function initProp(flux) {
  var prop = function (key, value, opts) {
    if (opts === void 0) opts = {};

    opts.value = value;
    Object.defineProperty(flux, key, opts);
  };
  prop.get = function (key, value, opts) {
    if (opts === void 0) opts = {};

    opts.get = value;
    Object.defineProperty(flux, key, opts);
  };
  return prop;
}

function initUse(ref) {
  var flux = ref.flux;
  var prop = ref.prop;

  var use = function (plugin, opts) {
    if (Array.isArray(plugin)) {
      return plugin.forEach(function (plugin) {
        flux.use(plugin, opts);
      });
    }
    plugin(flux, opts);
  };
  prop('use', use);
  return use;
}

function initUtil(ref) {
  var prop = ref.prop;
  var opts = ref.opts;

  prop('clone', savUtil_cjs.clone);
  prop('extend', savUtil_cjs.extend);
  prop('opt', function (name, defaultVal) {
    if (defaultVal === void 0) defaultVal = null;

    return name in opts ? opts[name] : defaultVal;
  });
}

function initState(ref) {
  var prop = ref.prop;
  var emit = ref.emit;
  var cloneThen = ref.cloneThen;
  var clone$$1 = ref.clone;
  var resolve = ref.resolve;

  var state = {};
  prop.get('state', function () {
    return state;
  }, {
    set: function set() {
      throw new Error('[flux] Use flux.replaceState() to explicit replace store state.');
    }
  });
  prop('getState', function () {
    return clone$$1(state);
  });

  prop('replaceState', function (newState) {
    var stateStr = JSON.stringify(newState);
    newState = JSON.parse(stateStr);
    for (var x in state) {
      delete state[x];
    }
    for (var x$1 in newState) {
      state[x$1] = newState[x$1];
    }
    return Promise.resolve(JSON.parse(stateStr)).then(function (cloneState) {
      emit('replace', cloneState);
      return cloneState;
    });
  });

  prop('updateState', function (changedState, slice) {
    if (typeof changedState !== 'object') {
      throw new Error('[flux] updateState require new state as object');
    }
    if (changedState !== state) {
      Object.keys(changedState).map(function (key) {
        state[key] = changedState[key];
      });
    }
    if (!slice) {
      return cloneThen(changedState).then(function (cloneState) {
        emit('update', cloneState);
        return cloneState;
      });
    }
    return resolve();
  });
}

function initCommit(ref) {
  var prop = ref.prop;
  var flux = ref.flux;
  var updateState = ref.updateState;
  var resolve = ref.resolve;

  var commit = function (type, payload) {
    var mutations = flux.mutations;
    if (typeof type === 'object') {
      payload = type;
      type = type.type;
    }
    var entry = mutations[type];
    if (!entry) {
      throw new Error('[flux] unknown mutation : ' + type);
    }
    var state = flux.state;
    var ret = entry(flux, payload);
    var update = function (ret) {
      if (ret) {
        if (ret === state) {
          throw new Error('[flux] commit require new object rather than old state');
        }
        if (typeof ret !== 'object') {
          throw new Error('[flux] commit require new object');
        }
        return updateState(ret);
      }
      return resolve();
    };
    if (savUtil_cjs.isPromiseLike(ret)) {
      return ret.then(update);
    } else {
      return update(ret);
    }
  };
  prop('commit', flux.opts.noProxy ? commit : proxyApi(commit));
}

function initDispatch(ref) {
  var prop = ref.prop;
  var flux = ref.flux;
  var commit = ref.commit;
  var resolve = ref.resolve;
  var reject = ref.reject;
  var opts = ref.opts;
  var cloneThen = ref.cloneThen;

  var dispatch = function (action, payload) {
    var actions = flux.actions;
    var mutations = flux.mutations;
    var proxys = flux.proxys;
    var entry = action in actions && actions[action] || action in mutations && function (_, payload) {
      return commit(action, payload);
    };
    if (!entry && proxys[action]) {
      entry = proxys[action];
    }
    if (!entry) {
      return reject('[flux] unknown action : ' + action);
    }
    var err, ret;
    try {
      ret = entry(flux, payload);
    } catch (e) {
      err = e;
    }
    if (err) {
      return reject(err);
    }
    if (!savUtil_cjs.isPromiseLike(ret)) {
      ret = resolve(ret);
    }
    // make copy
    return opts.strict ? ret.then(function (data) {
      if (Array.isArray(data) || typeof data === 'object') {
        if (data.__clone) {
          return resolve(data);
        }
        return cloneThen(data).then(function (newData) {
          Object.defineProperty(newData, '__clone', { value: true });
          return resolve(newData);
        });
      }
      return resolve(data);
    }) : ret;
  };
  prop('dispatch', flux.opts.noProxy ? dispatch : proxyApi(dispatch));
}

function initProxy(ref) {
  var prop = ref.prop;
  var proxys = ref.proxys;

  prop('proxy', function (name, value) {
    if (typeof name === 'object') {
      // batch mode
      for (var x in name) {
        if (value === null) {
          delete proxys[x];
        } else {
          proxys[x] = name[x];
        }
      }
    } else {
      // once mode
      if (value === null) {
        delete proxys[name];
      } else {
        proxys[name] = value;
      }
    }
  });
}

function initDeclare(ref) {
  var prop = ref.prop;
  var flux = ref.flux;
  var emit = ref.emit;
  var commit = ref.commit;
  var dispatch = ref.dispatch;
  var updateState = ref.updateState;

  var declare = function (mod) {
    if (!mod) {
      return;
    }
    if (Array.isArray(mod)) {
      return mod.forEach(declare);
    }
    if (mod.mutations) {
      for (var mutation in mod.mutations) {
        if (flux.mutations[mutation]) {
          throw new Error("[flux] mutation exists: " + mutation);
        }
        flux.mutations[mutation] = mod.mutations[mutation];
        if (flux.opts.noProxy || !savUtil_cjs.probe.Proxy) {
          proxyFunction(commit, mutation);
          proxyFunction(dispatch, mutation);
        }
      }
    }
    // if (mod.proxys) {
    //   for(let action in mod.proxys) {
    //     flux.proxys[action] = mod.proxys[action]
    //   }
    // }
    if (mod.actions) {
      for (var action in mod.actions) {
        if (flux.actions[action]) {
          throw new Error("[flux] action exists: " + action);
        }
        flux.actions[action] = mod.actions[action];
        if (flux.opts.noProxy || !savUtil_cjs.probe.Proxy) {
          proxyFunction(dispatch, action);
        }
      }
    }
    if (mod.state) {
      var states = flux.state;
      for (var state in mod.state) {
        if (state in states) {
          throw new Error("[flux] state exists: " + state);
        }
      }
      updateState(mod.state, true);
    }
    emit('declare', mod);
  };
  prop('declare', declare);
}

function proxyFunction(target, name) {
  target[name] = function (payload) {
    return target(name, payload);
  };
}

function proxyApi(entry) {
  if (savUtil_cjs.probe.Proxy) {
    return new Proxy(entry, {
      get: function get(target, name) {
        return function (payload) {
          return entry(name, payload);
        };
      }
    });
  }
  return entry;
}

function initPromise(ref) {
  var prop = ref.prop;

  var PROMISE = Promise;
  prop('resolve', PROMISE.resolve.bind(PROMISE));
  prop('reject', PROMISE.reject.bind(PROMISE));
  prop('all', PROMISE.all.bind(PROMISE));
  prop('then', function (fn) {
    return new PROMISE(fn);
  });
}

function initCloneThen(ref) {
  var prop = ref.prop;
  var clone$$1 = ref.clone;
  var resolve = ref.resolve;
  var then = ref.then;

  if (!savUtil_cjs.probe.MessageChannel) {
    prop('cloneThen', function (value) {
      return resolve().then(function () {
        return resolve(clone$$1(value));
      });
    });
    return;
  }
  /* global MessageChannel */
  var channel = new MessageChannel();
  var maps = {};
  var idx = 0;
  var port2 = channel.port2;
  port2.start();
  port2.onmessage = function (ref) {
    var ref_data = ref.data;
    var key = ref_data.key;
    var value = ref_data.value;

    var resolve = maps[key];
    resolve(value);
    delete maps[key];
  };
  prop('cloneThen', function (value) {
    return new Promise(function (resolve) {
      var key = idx++;
      maps[key] = resolve;
      try {
        channel.port1.postMessage({ key: key, value: value });
      } catch (err) {
        console.error('cloneThen.postMessage', err);
        delete maps[key];
        try {
          value = JSON.parse(JSON.stringify(value));
        } catch (err) {
          console.error('cloneThen.JSON', err);
          value = clone$$1(value);
        }
        return then(function () {
          return resolve(value);
        });
      }
    });
  });
}

function resetStoreVM(Vue$$1, flux, vaf, state) {
  var oldVm = vaf.vm;
  if (oldVm) {
    flux.off('update', vaf.watch);
  }
  var silent = Vue$$1.config.silent;
  Vue$$1.config.silent = true;
  var vm = vaf.vm = new Vue$$1({ data: { state: state } });
  flux.on('update', vaf.watch = function (newState) {
    if (isVmGetterMode) {
      var updates = [];
      var loop = function (key) {
        if (key in vm.state) {
          vm.state[key] = newState[key];
        } else {
          // dynamic computed methods
          Vue$$1.util.defineReactive(vm.state, key, newState[key]);
          if (vmGetterMaps[key]) {
            vmGetterMaps[key].forEach(function (vmIt) {
              if (vmIt._computedWatchers && vmIt._computedWatchers[key]) {
                updates.indexOf(vmIt) === -1 && updates.push(vmIt);
                vmIt._computedWatchers[key].update();
              }
            });
          }
        }
      };

      for (var key in newState) loop(key);
      updates.forEach(function (vm) {
        return vm.$forceUpdate();
      });
    } else {
      // old version use mapGetters
      for (var key$1 in newState) {
        vm.state[key$1] = newState[key$1];
      }
    }
  });
  Vue$$1.config.silent = silent;
  if (oldVm) {
    oldVm.state = null;
    Vue$$1.nextTick(function () {
      return oldVm.$destroy();
    });
  }
}

var Vue$$1;

function FluxVue(ref) {
  var flux = ref.flux;
  var mixinActions = ref.mixinActions;if (mixinActions === void 0) mixinActions = false;
  var injects = ref.injects;if (injects === void 0) injects = [];

  var vaf = {
    dispatch: flux.dispatch,
    proxy: flux.proxy
  };
  injects.forEach(function (key) {
    vaf[key] = flux[key];
  });
  resetStoreVM(Vue$$1, flux, vaf, flux.getState());
  flux.on('replace', function (state) {
    resetStoreVM(Vue$$1, flux, vaf, state);
  });
  if (mixinActions) {
    Vue$$1.mixin({
      methods: mapActions(savUtil_cjs.unique(Object.keys(flux.mutations).concat(Object.keys(flux.actions))))
    });
  }
  Vue$$1.mixin({
    methods: {
      dispatch: function dispatch(method, payload) {
        return vaf.dispatch(method, payload);
      }
    }
  });
  return vaf;
}

var vmGetterMaps = {};
var isVmGetterMode = false;

function registerVmGetters(vm, getters) {
  isVmGetterMode || (isVmGetterMode = true);
  getters = vm._getters = Object.keys(getters);
  getters.forEach(function (key) {
    var arr = vmGetterMaps[key] || (vmGetterMaps[key] = []);
    arr.push(vm);
  });
}

function destroyVmGetters(vm) {
  if (vm._getters) {
    vm._getters.forEach(function (key) {
      if (vmGetterMaps[key]) {
        var arr = vmGetterMaps[key];
        var pos = arr.indexOf(vm);
        if (pos >= -1) {
          arr.splice(pos, 1);
        }
      }
    });
  }
}

FluxVue.install = function install(vue) {
  Vue$$1 = vue;
  Vue$$1.mixin({
    beforeCreate: function beforeCreate() {
      var this$1 = this;

      var options = this.$options;
      if (options.vaf) {
        this.$flux = options.vaf;
      } else if (options.parent && options.parent.$flux) {
        this.$flux = options.parent.$flux;
      }
      var proxys = options.proxys;
      var methods = options.methods;
      var actions = options.actions;
      var getters = options.getters;
      var computed = options.computed;
      if (this.$flux) {
        if (actions) {
          methods || (methods = options.methods = {});
          Object.assign(methods, mapActions(actions));
        }
        if (getters) {
          computed || (computed = options.computed = {});
          var getterMaps = mapGetters(getters);
          registerVmGetters(this, getterMaps);
          Object.assign(computed, getterMaps);
        }
        if (proxys) {
          var maps = this.__vafMaps = {};
          Object.keys(proxys).map(function (key) {
            maps[key] = (typeof proxys[key] === 'function' ? proxys[key] : methods[proxys[key]]).bind(this$1);
          });
          this.$flux.proxy(maps);
        }
      }
    },
    beforeDestroy: function beforeDestroy() {
      var options = this.$options;
      var proxys = options.proxys;
      if (proxys && this.$flux && this.__vafMaps) {
        this.$flux.proxy(this.__vafMaps, null);
      }
      if (isVmGetterMode) {
        destroyVmGetters(this);
      }
      if (this.$flux) {
        delete this.$flux;
      }
    }
  });
};

// 后续不建议使用
function mapGetters(getters) {
  var res = {};
  normalizeMap(getters).forEach(function (ref) {
    var key = ref.key;
    var val = ref.val;
    res[key] = savUtil_cjs.isFunction(val) ? function mappedGetter() {
      // function(state){}
      return val.call(this, this.$flux.vm.state);
    } : function mappedGetter() {
      return this.$flux.vm.state[val];
    };
  });
  return res;
}

function mapActions(actions) {
  var res = {};
  normalizeMap(actions).forEach(function (ref) {
    var key = ref.key;
    var val = ref.val;
    res[key] = function mappedAction(payload) {
      if (!this.$flux) {
        var message = "can not call action " + key + " without flux";
        return Promise.reject(new Error(message));
      }
      return this.$flux.dispatch(val, payload);
    };
  });
  return res;
}

function normalizeMap(map) {
  return Array.isArray(map) ? map.map(function (key) {
    return {
      key: key,
      val: key
    };
  }) : Object.keys(map).map(function (key) {
    return {
      key: key,
      val: map[key]
    };
  });
}

var FluxRedux = function FluxRedux(ref) {
  var this$1 = this;
  var flux = ref.flux;

  this.flux = flux;
  this.dispatch = flux.dispatch;
  this.state = flux.getState();
  flux.on('update', this.watchUpdate = function (newState) {
    this$1.state = Object.assign({}, this$1.state, newState);
    flux.emit('redux_change');
  });
  flux.on('replace', this.watchReplace = function (newState) {
    this$1.state = newState;
    flux.emit('redux_change');
  });
};
FluxRedux.prototype.getState = function getState() {
  return this.state;
};
FluxRedux.prototype.subscribe = function subscribe(fn) {
  return this.flux.subscribe('redux_change', fn);
};

exports.Flux = Flux;
exports.FluxVue = FluxVue;
exports.mapGetters = mapGetters;
exports.mapActions = mapActions;
exports.FluxRedux = FluxRedux;
});

var savFlux_cjs_1 = savFlux_cjs$1.Flux;
var savFlux_cjs_2 = savFlux_cjs$1.FluxVue;

// @NOTICE This file is generated by sav-cli.

// 全局的VUE组件需要在这里注册
// 其他需要用Vue的需要从这里引入
Vue.use(VueRouter);
Vue.use(savFlux_cjs_2);

var Article = {
  render: function () {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "article" }, [_c('router-view')], 1);
  },
  staticRenderFns: [],
  name: 'Article',
  getters: [],
  actions: []
};

var ArticlePosts = {
  render: function () {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "article-posts" }, [_vm._v("\n  ArticlePosts\n")]);
  },
  staticRenderFns: [],
  name: 'ArticlePosts',
  getters: [],
  actions: []
};

var ArticleView = {
  render: function () {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "article-view" }, [_vm._v("\n  ArticleView\n")]);
  },
  staticRenderFns: [],
  name: 'ArticleView',
  getters: [],
  actions: []
};

var ArticleModify = {
  render: function () {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "article-modify" }, [_vm._v("\n  ArticleModify\n")]);
  },
  staticRenderFns: [],
  name: 'ArticleModify',
  getters: [],
  actions: []
};

var NavMenus = {
  render: function () {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "nav-menus" }, [_c('ul', _vm._l(_vm.menus, function (menu) {
      return _c('li', [_c('router-link', { attrs: { "to": menu.url } }, [_vm._v(_vm._s(menu.title))])], 1);
    }))]);
  },
  staticRenderFns: [],
  getters: ['menus'],
  actions: ['getLayoutUserNavMenu'],
  mounted() {
    this.getLayoutUserNavMenu();
  },
  created() {
    console.log('NavMenu-created');
  }
};

var Home = {
  render: function () {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "home" }, [_c('nav-menus'), _vm._v(" "), _c('router-view')], 1);
  },
  staticRenderFns: [],
  name: 'Home',
  getters: [],
  actions: [],
  components: {
    NavMenus
  },
  beforeRouteEnter(to, from, next) {
    console.log('Home-beforeRouteEnter', 'to', to, 'from', from);
    next();
  },
  beforeRouteUpdate(to, from, next) {
    console.log('Home-beforeRouteUpdate', 'to', to, 'from', from);
    next();
  }
};

var UserInfo = {
  render: function () {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "user-info" }, [_vm._v("\n  " + _vm._s(_vm.userInfo) + "\n")]);
  },
  staticRenderFns: [],
  getters: ['userInfo'],
  actions: ['getLayoutUserUserInfo'],
  created() {
    console.log('UserInfo-created');
  },
  mounted() {
    this.getLayoutUserUserInfo();
  }
};

var HomeIndex = {
  render: function () {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "home-index" }, [_c('div', [_vm._v("HomeIndex-" + _vm._s(_vm.welcome))]), _vm._v(" "), _c("UserInfo", { tag: "component" })], 1);
  },
  staticRenderFns: [],
  name: 'HomeIndex',
  getters: ['welcome'],
  actions: [],
  components: {
    UserInfo
  },
  beforeRouteEnter(to, from, next) {
    console.log('HomeIndex-beforeRouteEnter', 'to', to, 'from', from);
    next();
  },
  created() {
    console.log('HomeIndex-created');
  }
};

var HomeAbout = {
  render: function () {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "home-about" }, [_c('div', [_vm._v("HomeAbout")]), _vm._v(" "), _c("UserInfo", { tag: "component" })], 1);
  },
  staticRenderFns: [],
  name: 'HomeAbout',
  getters: [],
  actions: [],
  components: {
    UserInfo
  },
  created() {
    console.log('HomeAbout-created');
  }
};

var HomeProfile = {
  render: function () {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "home-profile" }, [_c('div', [_vm._v("HomeProfile")]), _vm._v(" "), _c('div', [_vm._v(_vm._s(_vm.userProfile))]), _vm._v(" "), _c("UserInfo", { tag: "component" })], 1);
  },
  staticRenderFns: [],
  name: 'HomeProfile',
  getters: ['userProfile'],
  actions: [],
  components: {
    UserInfo
  },
  beforeRouteEnter(to, from, next) {
    console.log('HomeProfile-beforeRouteEnter', 'to', to, 'from', from);
    next();
  },
  beforeRouteUpdate(to, from, next) {
    console.log('HomeProfile-beforeRouteUpdate', 'to', to, 'from', from);
    next();
  },
  created() {
    console.log('HomeProfile-created');
  }
};

// @NOTICE This file is generated by sav-cli.

/* eslint quotes: ["off"] */
var routes = [{
  component: Article,
  path: "/article",
  children: [{
    component: ArticlePosts,
    name: "ArticlePosts",
    path: "posts"
  }, {
    component: ArticleView,
    name: "ArticleView",
    path: "/articles/:aid"
  }, {
    component: ArticleModify,
    name: "ArticleModify",
    path: "modify/:id?"
  }, {
    component: ArticleModify,
    name: "ArticleUpdate",
    path: "update/:aid"
  }]
}, {
  component: Home,
  path: "/",
  children: [{
    component: HomeIndex,
    name: "HomeIndex",
    path: "/"
  }, {
    component: HomeAbout,
    name: "HomeAbout",
    path: "about"
  }, {
    component: HomeProfile,
    name: "HomeProfile",
    path: "profile/:uid"
  }]
}];

var App = {
  render: function () {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { attrs: { "id": "app" } }, [_c('router-link', { attrs: { "to": { name: 'HomeAbout' } } }, [_vm._v("HomeAbout")]), _vm._v(" "), _c('router-link', { attrs: { "to": { name: 'HomeIndex' } } }, [_vm._v("HomeIndex")]), _vm._v(" "), _c('router-view', { staticClass: "view" })], 1);
  },
  staticRenderFns: [],
  name: 'App',
  getters: [],
  actions: []
};

let router = new VueRouter(Object.assign({
  mode: 'history',
  routes,
  linkActiveClass: 'is-active'
}));

let flux = new savFlux_cjs_1({
  strict: true
});

let vm = new Vue(Object.assign({
  vaf: new savFlux_cjs_2({ flux }),
  router
}, App));

var serverEntry = {
  router,
  vm,
  flux,
  createRenderer: vueServerRenderer.createRenderer,
  renderOptions: {}
};

module.exports = serverEntry;
