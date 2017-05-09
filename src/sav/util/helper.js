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
