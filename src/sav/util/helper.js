import {isObject, isArray} from 'sav-util'

export function unique (arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError('array-unique expects an array.')
  }
  let len = arr.length
  let i = -1
  while (i++ < len) {
    for (let j = i + 1; j < arr.length; ++j) {
      if (arr[i] === arr[j]) {
        arr.splice(j--, 1)
      }
    }
  }
  return arr
}

export function shortId () {
  let a = Math.random() + new Date().getTime()
  return a.toString(16).replace('.', '')
}

export function only (obj, keys) {
  obj = obj || {}
  if (typeof keys === 'string') {
    keys = keys.split(/ +/)
  }
  return keys.reduce((ret, key) => {
    if (obj[key] === null) {
      return ret
    }
    ret[key] = obj[key]
    return ret
  }, {})
}

export function objectAssign (target, obj, excludes) {
  if (isObject(obj)) {
    let isExclude = isArray(excludes)
    for (let key in obj) {
      if ((!isExclude) || (excludes.indexOf(key) === -1)) {
        target[key] = obj[key]
      }
    }
  }
}

export function promiseNext () {
  let promise = Promise.resolve()
  let ret = (resolve, reject) => {
    if (resolve || reject) {
      promise = promise.then(resolve, reject)
    }
    return promise
  }
  return ret
}
