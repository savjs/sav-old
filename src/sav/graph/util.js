import {isObject, isFunction} from 'sav-util'

export function objectAssign (target, obj, excludes) {
  if (isObject(obj)) {
    let isExclude = Array.isArray(excludes)
    for (let key in obj) {
      if ((!isExclude) || (excludes.indexOf(key) === -1)) {
        target[key] = obj[key]
      }
    }
  }
}

let longMaps = {}
let shortMaps = {}

export function registerNames (names) {
  if (Array.isArray(names)) {
    names.forEach((name) => registerNames(name))
  } else {
    if (longMaps[names]) {
      return
    }
    let str = ''
    for (let i = 0, len = names.length; i < len; ++i) {
      str += names[i]
      if (!shortMaps[str]) {
        shortMaps[str] = names
        longMaps[names] = str
        return
      }
    }
    let n = 0
    while (shortMaps[str + n]) {
      n++
    }
    shortMaps[str + n] = names
    longMaps[names] = str + n
  }
}

export function longToShort (obj) {
  let ret = Object.create(null)
  for (let name in obj) {
    ret[longMaps[name] || name] = obj[name]
  }
  return ret
}

export function shortToLong (obj) {
  let ret = Object.create(null)
  for (let name in obj) {
    ret[shortMaps[name] || name] = obj[name]
  }
  return ret
}

export function objectToArray (obj) {
  if (Array.isArray(obj)) {
    return obj
  }
  let ret = []
  for (let name in obj) {
    ret.push(name)
    ret.push(obj[name])
  }
  return ret
}

export function arrayToObject (obj) {
  if (isObject(obj)) {
    return obj
  }
  let ret = {}
  for (let i = 0, len = obj.length; i < len; i += 2) {
    ret[obj[i]] = obj[i + 1]
  }
  return ret
}

let defaultFunction = [String, Number, Boolean, Array]

export function convertFunctionToName (obj) {
  if (isObject(obj)) {
    for (let name in obj) {
      let value = obj[name]
      if (isFunction(value) && (defaultFunction.indexOf(value) !== -1)) {
        obj[name] = value.name
      } else if (isObject(value)) {
        convertFunctionToName(value)
      }
    }
  }
  return obj
}
