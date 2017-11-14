const poly = -306674912
const table = (() => {
  let c = 0
  let table = new Array(256)
  for (let n = 0; n !== 256; ++n) {
    c = n
    c = ((c & 1) ? (poly ^ (c >>> 1)) : (c >>> 1))
    c = ((c & 1) ? (poly ^ (c >>> 1)) : (c >>> 1))
    c = ((c & 1) ? (poly ^ (c >>> 1)) : (c >>> 1))
    c = ((c & 1) ? (poly ^ (c >>> 1)) : (c >>> 1))
    c = ((c & 1) ? (poly ^ (c >>> 1)) : (c >>> 1))
    c = ((c & 1) ? (poly ^ (c >>> 1)) : (c >>> 1))
    c = ((c & 1) ? (poly ^ (c >>> 1)) : (c >>> 1))
    c = ((c & 1) ? (poly ^ (c >>> 1)) : (c >>> 1))
    table[n] = c
  }
  return table
})()

export function crc32 (str, seed) {
  let C = seed ^ -1
  for (let i = 0, L = str.length, c, d; i < L;) {
    c = str.charCodeAt(i++)
    if (c < 0x80) {
      C = (C >>> 8) ^ table[(C ^ c) & 0xFF]
    } else if (c < 0x800) {
      C = (C >>> 8) ^ table[(C ^ (192 | ((c >> 6) & 31))) & 0xFF]
      C = (C >>> 8) ^ table[(C ^ (128 | (c & 63))) & 0xFF]
    } else if (c >= 0xD800 && c < 0xE000) {
      c = (c & 1023) + 64
      d = str.charCodeAt(i++) & 1023
      C = (C >>> 8) ^ table[(C ^ (240 | ((c >> 8) & 7))) & 0xFF]
      C = (C >>> 8) ^ table[(C ^ (128 | ((c >> 2) & 63))) & 0xFF]
      C = (C >>> 8) ^ table[(C ^ (128 | ((d >> 6) & 15) | ((c & 3) << 4))) & 0xFF]
      C = (C >>> 8) ^ table[(C ^ (128 | (d & 63))) & 0xFF]
    } else {
      C = (C >>> 8) ^ table[(C ^ (224 | ((c >> 12) & 15))) & 0xFF]
      C = (C >>> 8) ^ table[(C ^ (128 | ((c >> 6) & 63))) & 0xFF]
      C = (C >>> 8) ^ table[(C ^ (128 | (c & 63))) & 0xFF]
    }
  }
  return C ^ -1
}
