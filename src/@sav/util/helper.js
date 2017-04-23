export function unique (arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError('array-unique expects an array.')
  }
  let len = arr.length
  let i = -1
  while (i++ < len) {
    let j = i + 1
    for (; j < arr.length; ++j) {
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
