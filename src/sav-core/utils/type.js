
export function isAsync (func) {
  return isFunction(func) && isEqual(func.constructor.name, 'AsyncFunction')
}

export function isPromise (obj) {
  return isObject(obj) && isFunction(obj.then)
}

export function isObject (obj) {
  return typeof obj === 'object' && obj !== null
}

export function isFunction (func) {
  return typeof func === 'function'
}

export function isString (val) {
  return isEqual(typeof val, 'string')
}

export function isEqual (a, b) {
  return a === b
}
