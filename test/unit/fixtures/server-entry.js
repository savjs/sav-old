'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var VueRouter = _interopDefault(require('vue-router'));
var Vue = _interopDefault(require('vue'));
var vueServerRenderer = require('vue-server-renderer');

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var savUtil_cjs = createCommonjsModule(function (module, exports) {
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function toStringType(val) {
  return Object.prototype.toString.call(val).slice(8, -1);
}

const isArray = Array.isArray;

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

const isInt = isInteger;
function isUint(arg) {
  return isInteger(arg) && arg >= 0;
}

function isAsync(func) {
  return isFunction(func) && func.constructor.name === 'AsyncFunction';
}

function isPromise(obj) {
  return obj && isFunction(obj.then);
}

let types = {
  isBoolean,
  isString,
  isNumber,
  isObject,
  isArray,
  isFunction,
  isRegExp,
  isDate,
  isNull,
  isUndefined,
  isInt,
  isUint
};

function defined(val) {
  return val !== 'undefined';
}

let probe = {
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
const REKeys = ['source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'];
const URL_RE = /^(?:(?![^:@]+:[^:@/]*@)([^:/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#/]*\.[^?#/.]+(?:[?#]|$)))*\/?)?([^?#/]*))(?:\?([^#]*))?(?:#(.*))?)/;

function parseUrl(str) {
  let _uri = {};
  let _m = URL_RE.exec(str || '');
  let _i = REKeys.length;
  while (_i--) {
    _uri[REKeys[_i]] = _m[_i] || '';
  }
  return _uri;
}

function stringifyUrl(uri) {
  let str = '';
  if (uri) {
    if (uri.host) {
      if (uri.protocol) str += uri.protocol + ':';
      str += '//';
      if (uri.user) str += uri.user + ':';
      if (uri.password) str += uri.password + '@';
      str += uri.host;
      if (uri.port) str += ':' + uri.port;
    }
    str += uri.path || '';
    if (uri.query) str += '?' + uri.query;
    if (uri.anchor) str += '#' + uri.anchor;
  }
  return str;
}

const Url = {
  parse: parseUrl,
  stringify: stringifyUrl
};

const _encode = encodeURIComponent;
const r20 = /%20/g;
const rbracket = /\[]$/;

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
    for (let name in obj) {
      buildParams(prefix + '[' + name + ']', obj[name], add);
    }
  } else {
    // Serialize scalar item.
    add(prefix, obj);
  }
}

// # http://stackoverflow.com/questions/1131630/the-param-inverse-function-in-javascript-jquery
// a[b]=1&a[c]=2&d[]=3&d[]=4&d[2][e]=5 <=> { a: { b: 1, c: 2 }, d: [ 3, 4, { e: 5 } ] }
function parseQuery(str, opts = {}) {
  let _querys = {};
  decodeURIComponent(str || '').replace(/\+/g, ' '
  // (optional no-capturing & )(key)=(value)
  ).replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function ($0, _name, _value) {
    if (_name) {
      let _path, _acc, _tmp, _ref;
      (_path = []).unshift(_name = _name.replace(/\[([^\]]*)]/g, function ($0, _k) {
        _path.push(_k);
        return '';
      }));
      _ref = _querys;
      for (let j = 0; j < _path.length - 1; j++) {
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
  let _add = (key, value) => {
    /* jshint eqnull:true */
    _str.push(_encode(key) + '=' + (value === null || value === undefined ? '' : _encode(value)));
    // _str.push(( key ) + "=" +  (value == null ? "" : ( value )));
  };
  let _str = [];
  query || (query = {});
  for (let x in query) {
    buildParams(x, query[x], _add);
  }
  return _str.join('&').replace(r20, '+');
}

const Query = {
  parse: parseQuery,
  stringify: stringifyQuery
};

function extend() {
  // form jQuery & remove this
  let options, name, src, copy, copyIsArray, clone;
  let target = arguments[0] || {};
  let i = 1;
  let length = arguments.length;
  let deep = false;
  if (isBoolean(target)) {
    deep = target;
    target = arguments[i] || {};
    i++;
  }
  if (typeof target !== 'object' && !isFunction(target)) {
    target = {};
  }
  for (; i < length; i++) {
    options = arguments[i];
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
    let _length = obj.length;
    let _key;
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

function prop(target, key, value) {
  Object.defineProperty(target, key, { value, writable: true, configurable: true });
}

function makePropFunc(target, propName) {
  if (!target._props_) {
    prop(target, '_props_', ['_props_']);
  }
  let props = target._props_;
  return (key, value) => {
    if (isObject(key)) {
      for (let name in key) {
        Object.defineProperty(target, name, { [`${propName}`]: key[name], writable: true, configurable: true });
        props.push(name);
      }
    } else {
      let descriptor = { [`${propName}`]: value, configurable: true };
      if (propName === 'value') {
        descriptor.writable = true;
      }
      Object.defineProperty(target, key, descriptor);
      props.push(key);
    }
  };
}

function delProps(target) {
  if (target._props_) {
    target._props_.forEach(it => {
      delete target[it];
    });
  }
}

function makeProp(ctx, name) {
  if (ctx.prop) {
    return ctx.prop;
  }
  let prop = makePropFunc(ctx, 'value');
  prop.getter = makePropFunc(ctx, 'get');
  prop.setter = makePropFunc(ctx, 'set');
  if (isString(name) || isUndefined(name)) {
    prop(name || 'ctx', ctx);
  }
  prop('prop', prop);
  return prop;
}

function bindEvent(target) {
  let _events = {};
  prop(target, 'on', (event, fn) => {
    (_events[event] || (_events[event] = [])).push(fn);
  });

  prop(target, 'before', (event, fn) => {
    (_events[event] || (_events[event] = [])).unshift(fn);
  });

  prop(target, 'off', (event, fn) => {
    if (_events[event]) {
      let list = _events[event];
      if (fn) {
        let pos = list.indexOf(fn);
        if (pos !== -1) {
          list.splice(pos, 1);
        }
      } else {
        delete _events[event];
      }
    }
  });

  prop(target, 'once', (event, fn) => {
    let once = (...args) => {
      target.off(event, fn);
      fn(...args);
    };
    target.on(event, once);
  });

  prop(target, 'subscribe', (event, fn) => {
    target.on(event, fn);
    return () => {
      target.off(event, fn);
    };
  });

  prop(target, 'emit', (event, ...args) => {
    if (_events[event]) {
      let list = _events[event].slice();
      let fn;
      while (fn = list.shift()) {
        fn(...args);
      }
    }
  });
}

function unique(arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError('array-unique expects an array.');
  }
  let len = arr.length;
  let i = -1;
  while (i++ < len) {
    let j = i + 1;
    for (; j < arr.length; ++j) {
      if (arr[i] === arr[j]) {
        arr.splice(j--, 1);
      }
    }
  }
  return arr;
}

function isPromiseLike(obj) {
  return !!(obj && obj.then);
}

function uuid() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function guid() {
  return new Date().getTime().toString(32) + Math.floor(Math.random() * 10000000000).toString(32) + s4();
}

function shortId() {
  let a = Math.random() + new Date().getTime();
  return a.toString(16).replace('.', '');
}

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

function inherits(ctor, SuperCtor, useSuper) {
  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(ctor.prototype, SuperCtor.prototype);
  } else {
    ctor.prototype = new SuperCtor();
    ctor.prototype.constructor = SuperCtor;
  }
  if (useSuper) {
    ctor.super_ = SuperCtor;
  }
  return ctor;
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
  if (!fmt) fmt = 'yyyy-MM-dd';
  if (!date) {
    date = new Date();
  } else {
    date = new Date(date);
  }
  let o = {
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
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
    }
  }
  return fmt;
}

let PROMISE = Promise;
let promise = {
  resolve: PROMISE.resolve.bind(PROMISE),
  reject: PROMISE.reject.bind(PROMISE),
  all: PROMISE.all.bind(PROMISE),
  then: (fn, reject) => {
    // @NOTICE deprecated to be removed next
    return new PROMISE(fn, reject);
  }
};

function toPromise(target, methods) {
  let dist = Object.create(null);
  methods.forEach(name => {
    dist[name] = (...args) => {
      return promise.then((resolve, reject) => {
        try {
          return resolve(target[name].apply(target, args));
        } catch (err) {
          return reject(err);
        }
      });
    };
  });
  return dist;
}

function next() {
  let promise = Promise.resolve();
  let ret = (resolve, reject) => {
    if (resolve || reject) {
      promise = promise.then(resolve, reject);
    }
    return promise;
  };
  return ret;
}

function convertCase(type, str) {
  switch (type) {
    case 'pascal':
      return pascalCase(str);
    case 'camel':
      return camelCase(str);
    case 'snake':
      return snakeCase(str);
    case 'hyphen':
      return hyphenCase(str);
    default:
      return str;
  }
}

/**
 * Camelize a hyphen-delmited string.
 */
const camelCaseRE = /[-_](\w)/g;
function camelCase(str) {
  return lcfirst(str.replace(camelCaseRE, (_, c) => c ? c.toUpperCase() : ''));
}

/**
 * Capitalize a string.
 */
function ucfirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * UnCapitalize a string.
 */
function lcfirst(str) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

const replaceAZRE = /([A-Z])/g;

/**
 * Hyphenate a camelCase string.
 */
function hyphenCase(str) {
  return camelCase(str).replace(replaceAZRE, '-$1').toLowerCase();
}

function snakeCase(str) {
  return camelCase(str).replace(replaceAZRE, '_$1').toLowerCase();
}

function pascalCase(str) {
  return ucfirst(camelCase(str));
}

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
  let method = (opts.method || 'GET').toUpperCase();
  let dataType = (opts.dataType || 'JSON').toUpperCase();
  let timeout = opts.timeout;
  /* global XMLHttpRequest */
  let req = new XMLHttpRequest();
  let data = null;
  let isPost = method === 'POST';
  let isGet = method === 'GET';
  let isFormData = false;
  let emit = function (err, data, headers) {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    req.onload = req.onreadystatechange = req.onerror = null;
    if (next) {
      let tmp = next;
      next = null;
      tmp(err, data, headers);
    }
  };
  if (isGet) {
    if (opts.data) {
      let u = parseUrl(opts.url);
      let q = parseQuery(u.query);
      for (let x in opts.data) {
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
      for (let x in opts.headers) {
        req.setRequestHeader(x, opts.headers[x]);
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
          let headers = parseHeaders(req.getAllResponseHeaders(), opts.camelHeaders);
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
        let data = req.response;
        try {
          if (dataType === 'JSON') {
            data = JSON.parse(req.responseText);
          } else if (dataType === 'XML') {
            data = req.responseXML;
          } else if (dataType === 'TEXT') {
            data = req.responseText;
          } else if (dataType === 'BINARY') {
            let arrayBuffer = new Uint8Array(data);
            let str = '';
            for (let i = 0; i < arrayBuffer.length; i++) {
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
        let info = {
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
  let ret = {};
  str.trim().split('\n').forEach(function (key) {
    key = key.replace(/\r/g, '');
    let arr = key.split(': ');
    let name = arr.shift().toLowerCase();
    ret[camelHeaders ? camelCase(name) : name] = arr.shift();
  });
  return ret;
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
exports.isAsync = isAsync;
exports.isPromise = isPromise;
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
exports.shortId = shortId;
exports.inherits = inherits;
exports.strRepeat = strRepeat;
exports.noop = noop;
exports.splitEach = splitEach;
exports.proxy = proxy;
exports.formatDate = formatDate;
exports.promise = promise;
exports.toPromise = toPromise;
exports.next = next;
exports.ajax = ajax;
exports.convertCase = convertCase;
exports.camelCase = camelCase;
exports.ucfirst = ucfirst;
exports.lcfirst = lcfirst;
exports.hyphenCase = hyphenCase;
exports.snakeCase = snakeCase;
exports.pascalCase = pascalCase;
exports.prop = prop;
exports.delProps = delProps;
exports.makeProp = makeProp;
});

var savFlux_cjs$1 = createCommonjsModule(function (module, exports) {
/*!
 * sav-flux v0.0.19
 * (c) 2017 jetiny 86287344@qq.com
 * Release under the MIT License.
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });



function Flux(opts = { strict: true }) {
  let flux = this;
  let prop = initProp(flux);
  prop('flux', flux);
  prop('prop', prop);
  prop('mutations', {});
  prop('actions', {});
  prop('proxys', {});
  prop('opts', opts);
  initUse(flux)([initUtil, savUtil_cjs.bindEvent, initPromise, initCloneThen, initState, initCommit, initDispatch, initProxy, initDeclare]);
}

function initProp(flux) {
  let prop = (key, value, opts = {}) => {
    opts.value = value;
    Object.defineProperty(flux, key, opts);
  };
  prop.get = (key, value, opts = {}) => {
    opts.get = value;
    Object.defineProperty(flux, key, opts);
  };
  return prop;
}

function initUse({ flux, prop }) {
  let use = (plugin, opts) => {
    if (Array.isArray(plugin)) {
      return plugin.forEach(plugin => {
        flux.use(plugin, opts);
      });
    }
    plugin(flux, opts);
  };
  prop('use', use);
  return use;
}

function initUtil({ prop, opts }) {
  prop('clone', savUtil_cjs.clone);
  prop('extend', savUtil_cjs.extend);
  prop('opt', (name, defaultVal = null) => {
    return name in opts ? opts[name] : defaultVal;
  });
}

function initState({ prop, emit, cloneThen, clone: clone$$1, resolve }) {
  let state = {};
  prop.get('state', () => state, {
    set() {
      throw new Error('[flux] Use flux.replaceState() to explicit replace store state.');
    }
  });
  prop('getState', () => clone$$1(state));

  prop('replaceState', newState => {
    let stateStr = JSON.stringify(newState);
    newState = JSON.parse(stateStr);
    for (let x in state) {
      delete state[x];
    }
    for (let x in newState) {
      state[x] = newState[x];
    }
    return Promise.resolve(JSON.parse(stateStr)).then(cloneState => {
      emit('replace', cloneState);
      return cloneState;
    });
  });

  prop('updateState', (changedState, slice) => {
    if (typeof changedState !== 'object') {
      throw new Error('[flux] updateState require new state as object');
    }
    if (changedState !== state) {
      Object.keys(changedState).map(key => {
        state[key] = changedState[key];
      });
    }
    if (!slice) {
      return cloneThen(changedState).then(cloneState => {
        emit('update', cloneState);
        return cloneState;
      });
    }
    return resolve();
  });
}

function initCommit({ prop, flux, updateState, resolve }) {
  let commit = (type, payload) => {
    let { mutations } = flux;
    if (typeof type === 'object') {
      payload = type;
      type = type.type;
    }
    let entry = mutations[type];
    if (!entry) {
      throw new Error('[flux] unknown mutation : ' + type);
    }
    let state = flux.state;
    let ret = entry(flux, payload);
    let update = ret => {
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

function initDispatch({ prop, flux, commit, resolve, reject, opts, cloneThen }) {
  let dispatch = (action, payload) => {
    let { actions, mutations, proxys } = flux;
    let entry = action in actions && actions[action] || action in mutations && function (_, payload) {
      return commit(action, payload);
    };
    if (!entry && proxys[action]) {
      entry = proxys[action];
    }
    if (!entry) {
      return reject('[flux] unknown action : ' + action);
    }
    let err, ret;
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
    return opts.strict ? ret.then(data => {
      if (Array.isArray(data) || typeof data === 'object') {
        if (data.__clone) {
          return resolve(data);
        }
        return cloneThen(data).then(newData => {
          Object.defineProperty(newData, '__clone', { value: true });
          return resolve(newData);
        });
      }
      return resolve(data);
    }) : ret;
  };
  prop('dispatch', flux.opts.noProxy ? dispatch : proxyApi(dispatch));
}

function initProxy({ prop, proxys }) {
  prop('proxy', (name, value) => {
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

function initDeclare({ prop, flux, emit, commit, dispatch, updateState }) {
  let declare = mod => {
    if (!mod) {
      return;
    }
    if (Array.isArray(mod)) {
      return mod.forEach(declare);
    }
    if (mod.mutations) {
      for (let mutation in mod.mutations) {
        if (flux.mutations[mutation]) {
          throw new Error(`[flux] mutation exists: ${mutation}`);
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
      for (let action in mod.actions) {
        if (flux.actions[action]) {
          throw new Error(`[flux] action exists: ${action}`);
        }
        flux.actions[action] = mod.actions[action];
        if (flux.opts.noProxy || !savUtil_cjs.probe.Proxy) {
          proxyFunction(dispatch, action);
        }
      }
    }
    if (mod.state) {
      let states = flux.state;
      for (let state in mod.state) {
        if (state in states) {
          throw new Error(`[flux] state exists: ${state}`);
        }
      }
      updateState(mod.state, true);
    }
    emit('declare', mod);
  };
  prop('declare', declare);
}

function proxyFunction(target, name) {
  target[name] = payload => {
    return target(name, payload);
  };
}

function proxyApi(entry) {
  if (savUtil_cjs.probe.Proxy) {
    return new Proxy(entry, {
      get(target, name) {
        return payload => {
          return entry(name, payload);
        };
      }
    });
  }
  return entry;
}

function initPromise({ prop }) {
  let PROMISE = Promise;
  prop('resolve', PROMISE.resolve.bind(PROMISE));
  prop('reject', PROMISE.reject.bind(PROMISE));
  prop('all', PROMISE.all.bind(PROMISE));
  prop('then', fn => {
    return new PROMISE(fn);
  });
}

function initCloneThen({ prop, clone: clone$$1, resolve, then }) {
  if (!savUtil_cjs.probe.MessageChannel) {
    prop('cloneThen', value => {
      return resolve().then(() => resolve(clone$$1(value)));
    });
    return;
  }
  /* global MessageChannel */
  const channel = new MessageChannel();
  let maps = {};
  let idx = 0;
  let port2 = channel.port2;
  port2.start();
  port2.onmessage = ({ data: { key, value } }) => {
    const resolve = maps[key];
    resolve(value);
    delete maps[key];
  };
  prop('cloneThen', value => {
    return new Promise(resolve => {
      const key = idx++;
      maps[key] = resolve;
      try {
        channel.port1.postMessage({ key, value });
      } catch (err) {
        console.error('cloneThen.postMessage', err);
        delete maps[key];
        try {
          value = JSON.parse(JSON.stringify(value));
        } catch (err) {
          console.error('cloneThen.JSON', err);
          value = clone$$1(value);
        }
        return then(() => resolve(value));
      }
    });
  });
}

function normalizeMap(map) {
  return Array.isArray(map) ? map.map(key => {
    return {
      key: key,
      val: key
    };
  }) : Object.keys(map).map(key => {
    return {
      key: key,
      val: map[key]
    };
  });
}

// 深度比较复制
function testAndUpdateDeepth(oldState, newState, defineReactive, isVueRoot) {
  Object.keys(newState).forEach(name => {
    if (!(name in oldState)) {
      // 新加入的属性
      return defineReactive(oldState, name, newState[name]);
    }
    // 旧的比较赋值
    let newValue = newState[name];
    let oldValue = oldState[name];
    if (savUtil_cjs.isObject(newValue)) {
      if (!savUtil_cjs.isObject(oldValue)) {
        // @TEST 类型不匹配, 直接赋值, 正常情况不应该这样
        delete oldState[name]; // 需要先删除
        defineReactive(oldState, name, newValue);
        if (isVueRoot) {
          // 必须再通知一下
          oldValue.__ob__.dep.notify();
        }
      } else {
        // 继续深度比较赋值
        testAndUpdateDeepth(oldState[name], newValue, defineReactive);
      }
    } else if (savUtil_cjs.isArray(newValue)) {
      if (!savUtil_cjs.isArray(oldValue)) {
        // @TEST 类型不匹配, 直接赋值, 正常情况不应该这样
        delete oldState[name]; // 需要先删除
        defineReactive(oldState, name, newValue);
        if (isVueRoot) {
          // 必须再通知一下
          oldValue.__ob__.dep.notify();
        }
      } else {
        testAndUpdateArray(oldValue, newValue, defineReactive);
      }
    } else {
      // 简单类型 直接赋值
      oldState[name] = newState[name];
    }
  });
}

function testAndUpdateArray(oldValue, newValue, defineReactive) {
  let oldLen = oldValue.length;
  let newLen = newValue.length;
  if (oldLen > newLen) {
    // 多了删掉
    oldValue.splice(newLen, oldLen);
  } else if (oldLen < newLen) {
    // 少了补上
    while (oldValue.length < newLen) {
      oldValue.push(null);
    }
  }
  newValue.forEach((it, id) => {
    if (savUtil_cjs.isObject(it)) {
      if (!savUtil_cjs.isObject(oldValue[id])) {
        // @TEST 类型不匹配, 直接赋值, 正常情况不应该这样
        oldValue.splice(id, 1, it);
      } else {
        // 复制对象
        testAndUpdateDeepth(oldValue[id], it, defineReactive);
      }
    } else if (savUtil_cjs.isArray(it)) {
      if (!savUtil_cjs.isArray(oldValue[id])) {
        // @TEST 类型不匹配, 直接赋值, 正常情况不应该这样
        oldValue.splice(id, 1, it);
      } else {
        testAndUpdateArray(oldValue[id], it, defineReactive);
      }
    } else {
      // 简单类型 直接赋值
      if (it !== oldValue[id]) {
        oldValue.splice(id, 1, it);
      }
    }
  });
}

function resetStoreVM(Vue$$1, flux, vaf, state) {
  let oldVm = vaf.vm;
  if (oldVm) {
    flux.off('update', vaf.watch);
  }
  const silent = Vue$$1.config.silent;
  Vue$$1.config.silent = true;
  let vm = vaf.vm = new Vue$$1({ data: { state } });
  flux.on('update', vaf.watch = newState => {
    return testAndUpdateDeepth(vm.state, newState, Vue$$1.util.defineReactive, true);
    // if (isVmGetterMode) {
    //   let updates = []
    //   for (let key in newState) {
    //     if (key in vm.state) {
    //       vm.state[key] = newState[key]
    //     } else { // dynamic computed methods
    //       Vue.util.defineReactive(vm.state, key, newState[key])
    //       if (vmGetterMaps[key]) {
    //         vmGetterMaps[key].forEach((vmIt) => {
    //           if (vmIt._computedWatchers && vmIt._computedWatchers[key]) {
    //             updates.indexOf(vmIt) === -1 && updates.push(vmIt)
    //             vmIt._computedWatchers[key].update()
    //           }
    //         })
    //       }
    //     }
    //   }
    //   updates.forEach(vm => vm.$forceUpdate())
    // } else { // old version use mapGetters
    //   for (let key in newState) {
    //     vm.state[key] = newState[key]
    //   }
    // }
  });
  Vue$$1.config.silent = silent;
  if (oldVm) {
    oldVm.state = null;
    Vue$$1.nextTick(() => oldVm.$destroy());
  }
}

let Vue$$1;

function FluxVue({ flux, mixinActions = false, injects = [], router, onRouteFail, payload, deepth = -1 }) {
  let vaf = {
    dispatch: flux.dispatch,
    proxy: flux.proxy
  };
  injects.forEach(key => {
    vaf[key] = flux[key];
  });
  resetStoreVM(Vue$$1, flux, vaf, flux.getState());
  flux.on('replace', state => {
    resetStoreVM(Vue$$1, flux, vaf, state);
  });
  if (mixinActions) {
    Vue$$1.mixin({
      methods: mapActions(savUtil_cjs.unique(Object.keys(flux.mutations).concat(Object.keys(flux.actions))))
    });
  }
  Vue$$1.mixin({
    methods: {
      dispatch(method, payload) {
        return vaf.dispatch(method, payload);
      }
    }
  });
  if (router) {
    router.beforeEach((to, from, next) => {
      let matchedComponents = router.getMatchedComponents(to);
      if (matchedComponents.length) {
        let args = {
          dispatch: vaf.dispatch,
          route: to,
          from: from,
          state: vaf.vm.state
        };
        Promise.all(getComponentsPayloads(matchedComponents, deepth).map(Component => {
          if (payload) {
            return payload(Component, args, to, from);
          }
          return Component.payload(args);
        })).then(next).catch(err => {
          if (!(err instanceof Error)) {
            return next(err);
          }
          if (onRouteFail) {
            return onRouteFail(to, from, next, err);
          } else {
            next(false);
          }
        });
      } else {
        next();
      }
    });
  }
  return vaf;
}

function getComponentsPayloads(components, depth) {
  let payloads = [];
  if (Array.isArray(components)) {
    for (let i = 0; i < components.length; ++i) {
      let com = components[i];
      if (com.payload) {
        payloads.push(com);
      }
      if (depth && com.components) {
        payloads = payloads.concat(getComponentsPayloads(com.components, depth--));
      }
    }
  } else {
    for (let comName in components) {
      let com = components[comName];
      if (com.payload) {
        payloads.push(com);
      }
      if (depth && com.components) {
        payloads = payloads.concat(getComponentsPayloads(com.components, depth--));
      }
    }
  }
  return payloads;
}

let vmGetterMaps = {};
let isVmGetterMode = false;

function registerVmGetters(vm, getters) {
  isVmGetterMode || (isVmGetterMode = true);
  getters = vm._getters = Object.keys(getters);
  getters.forEach(key => {
    let arr = vmGetterMaps[key] || (vmGetterMaps[key] = []);
    arr.push(vm);
  });
}

function destroyVmGetters(vm) {
  if (vm._getters) {
    vm._getters.forEach(key => {
      if (vmGetterMaps[key]) {
        let arr = vmGetterMaps[key];
        let pos = arr.indexOf(vm);
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
    beforeCreate() {
      const options = this.$options;
      if (options.vaf) {
        this.$flux = options.vaf;
      } else if (options.parent && options.parent.$flux) {
        this.$flux = options.parent.$flux;
      }
      let { proxys, methods, actions, getters, computed } = options;
      if (this.$flux) {
        if (actions) {
          methods || (methods = options.methods = {});
          Object.assign(methods, mapActions(actions));
        }
        if (getters) {
          computed || (computed = options.computed = {});
          let getterMaps = mapGetters(getters);
          registerVmGetters(this, getterMaps);
          Object.assign(computed, getterMaps);
        }
        if (proxys) {
          let maps = this.__vafMaps = {};
          Object.keys(proxys).map(key => {
            maps[key] = (typeof proxys[key] === 'function' ? proxys[key] : methods[proxys[key]]).bind(this);
          });
          this.$flux.proxy(maps);
        }
      }
    },
    beforeDestroy() {
      const options = this.$options;
      let { proxys } = options;
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
  let res = {};
  normalizeMap(getters).forEach(function (ref) {
    let key = ref.key;
    let val = ref.val;
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
  let res = {};
  normalizeMap(actions).forEach(ref => {
    let key = ref.key;
    let val = ref.val;
    res[key] = function mappedAction(payload) {
      if (!this.$flux) {
        let message = `can not call action ${key} without flux`;
        return Promise.reject(new Error(message));
      }
      return this.$flux.dispatch(val, payload);
    };
  });
  return res;
}

class FluxRedux {
  constructor({ flux }) {
    this.flux = flux;
    this.dispatch = flux.dispatch;
    this.state = flux.getState();
    flux.on('update', this.watchUpdate = newState => {
      this.state = Object.assign({}, this.state, newState);
      flux.emit('redux_change');
    });
    flux.on('replace', this.watchReplace = newState => {
      this.state = newState;
      flux.emit('redux_change');
    });
  }
  getState() {
    return this.state;
  }
  subscribe(fn) {
    return this.flux.subscribe('redux_change', fn);
  }
}

function FluxRiot({ flux, riot }) {
  let connect = {
    dispatch: flux.dispatch,
    state: flux.getState(),
    binds: {},
    binders: {}
  };
  flux.on('update', newState => {
    Object.assign(connect.state, newState);
    let ids = [];
    for (let name in newState) {
      ids = ids.concat(connect.binds[name]);
    }
    savUtil_cjs.unique(ids);
    let keys = Object.keys(newState);
    ids.forEach(tagName => {
      let binder = connect.binders[tagName];
      if (binder && binder.vms.length) {
        syncBinderKeys(binder, keys);
      }
    });
  });

  flux.on('replace', newState => {
    connect.state = newState;
    for (let tagName in connect.binders) {
      syncBinder(connect.binders[tagName]);
    }
  });

  riot.mixin({
    init: function () {
      this.on('before-mount', () => {
        if (this.getters) {
          let tagName = this.__.tagName;
          let binder;
          if (connect.binders[tagName]) {
            binder = connect.binders[tagName];
          } else {
            let getters = normalizeMap(this.getters);
            let sync = {};
            binder = {
              sync,
              keys: [],
              vms: []
            };
            connect.binders[tagName] = binder;
            getters.forEach(({ key, val }) => {
              let fn = savUtil_cjs.isFunction(val) ? () => {
                return val(connect.state);
              } : () => {
                return connect.state[key];
              };
              let binds = connect.binds[key] || (connect.binds[key] = []);
              binds.push(tagName);
              binder.keys.push(key);
              sync[key] = fn;
            });
          }
          this.on('unmount', () => {
            let idx = binder.vms.indexOf(this);
            if (idx >= 0) {
              binder.vms.splice(idx, 1);
            }
          });
          binder.vms.push(this);
          Object.assign(this, syncState(binder.keys, binder.sync));
        }
        if (this.actions) {
          normalizeMap(this.actions).forEach(({ key }) => {
            this[key] = payload => {
              return connect.dispatch(key, payload);
            };
          });
        }
      });
    }
  });
}

function syncState(keys, sync) {
  let ret = {};
  keys.forEach(key => {
    ret[key] = sync[key]();
  });
  return ret;
}

function syncBinder(binder) {
  if (binder.vms.length) {
    let state = syncState(binder.keys, binder.sync);
    binder.vms.forEach(vm => vm.update(state));
  }
}

function syncBinderKeys(binder, keys) {
  let state = syncState(keys.filter(key => binder.keys.indexOf(key) >= 0), binder.sync);
  binder.vms.forEach(vm => vm.update(state));
}

exports.Flux = Flux;
exports.FluxVue = FluxVue;
exports.mapGetters = mapGetters;
exports.mapActions = mapActions;
exports.FluxRedux = FluxRedux;
exports.FluxRiot = FluxRiot;
});

var savFlux_cjs_1 = savFlux_cjs$1.Flux;
var savFlux_cjs_2 = savFlux_cjs$1.FluxVue;

// @NOTICE This file is generated by sav.

// npm i -D vue vue-router sav-flux
// 全局的VUE组件需要在这里注册
// 其他需要用Vue的需要从这里引入
Vue.use(VueRouter);
Vue.use(savFlux_cjs_2);

var Article = {
  render: function () {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "page-article" }, [_c('h2', [_vm._v("Article")]), _vm._v(" "), _c('router-view', { staticClass: "view-container" })], 1);
  },
  staticRenderFns: [],
  name: 'Article',
  getters: [],
  actions: []
};

var ArticlePosts = {
  render: function () {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "article-posts" }, [_c('h2', [_vm._v("ArticlePosts")]), _vm._v(" "), _c('router-view', { staticClass: "view-container" })], 1);
  },
  staticRenderFns: [],
  name: 'ArticlePosts',
  getters: [],
  actions: []
};

var ArticleView = {
  render: function () {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "article-view" }, [_c('h2', [_vm._v("ArticleView")]), _vm._v(" "), _c('router-view', { staticClass: "view-container" })], 1);
  },
  staticRenderFns: [],
  name: 'ArticleView',
  getters: [],
  actions: []
};

var ArticleModify = {
  render: function () {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "article-modify" }, [_c('h2', [_vm._v("ArticleModify")]), _vm._v(" "), _c('router-view', { staticClass: "view-container" })], 1);
  },
  staticRenderFns: [],
  name: 'ArticleModify',
  getters: [],
  actions: []
};

var Home = {
  render: function () {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "page-home" }, [_c('h2', [_vm._v("Home")]), _vm._v(" "), _c('router-view', { staticClass: "view-container" })], 1);
  },
  staticRenderFns: [],
  name: 'Home',
  getters: [],
  actions: []
};

var HomeIndex = {
  render: function () {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "home-index" }, [_c('h2', [_vm._v("HomeIndex")]), _vm._v(" "), _c('router-view', { staticClass: "view-container" })], 1);
  },
  staticRenderFns: [],
  name: 'HomeIndex',
  getters: [],
  actions: []
};

var HomeAbout = {
  render: function () {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "home-about" }, [_c('h2', [_vm._v("HomeAbout")]), _vm._v(" "), _c('router-view', { staticClass: "view-container" })], 1);
  },
  staticRenderFns: [],
  name: 'HomeAbout',
  getters: [],
  actions: []
};

var HomeProfile = {
  render: function () {
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { staticClass: "home-profile" }, [_c('h2', [_vm._v("HomeProfile")]), _vm._v(" "), _c('router-view', { staticClass: "view-container" })], 1);
  },
  staticRenderFns: [],
  name: 'HomeProfile',
  getters: [],
  actions: []
};

// @NOTICE This file is generated by sav.

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
    path: "modify/:aid?"
  }, {
    component: ArticleModify,
    name: "ArticleUpdate",
    path: "update/:aid"
  }]
}, {
  component: Home,
  path: "",
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
    var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { attrs: { "id": "app" } }, [_c('router-view', { staticClass: "page-container" })], 1);
  },
  staticRenderFns: [],
  name: 'App',
  getters: [],
  actions: []
};

// @NOTICE This file is generated by sav.

// npm i -D vue-server-renderer
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
