
function toStringType (val) {
  return Object.prototype.toString.call(val).slice(8, -1)
}

export const isArray = Array.isArray

export function isBoolean (arg) {
  return typeof arg === 'boolean'
}

export function isString (arg) {
  return typeof arg === 'string'
}

export function isFunction (arg) {
  return typeof arg === 'function'
}

export function isObject (arg) {
  return (toStringType(arg) === 'Object') && (arg !== null)
}

export function isNumber (arg) {
  return typeof arg === 'number' && !isNaN(arg)
}

export function isInteger (arg) {
  return isNumber(arg) && parseInt(arg) === arg
}

export function isUndefined (arg) {
  return arg === undefined
}

export function isNull (arg) {
  return arg === null
}

export function isNan (arg) {
  return typeof arg === 'number' && isNaN(arg)
}

export function isRegExp (arg) {
  return toStringType(arg) === 'RegExp'
}

export function isDate (arg) {
  return toStringType(arg) === 'Date'
}

export function typeValue (arg) {
  if (isNan(arg)) {
    return 'Nan'
  }
  switch (arg) {
    case undefined:
      return 'Undefined'
    case null:
      return 'Null'
    default:
      return toStringType(arg)
  }
}

export const isInt = isInteger
export function isUint (arg) {
  return isInteger(arg) && arg >= 0
}

export function isAsync (func) {
  return isFunction(func) && func.constructor.name === 'AsyncFunction'
}

export function isPromise (obj) {
  return obj && isFunction(obj.then)
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
}

export {types}
