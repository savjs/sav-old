import path from 'path'
import fs from 'fs'

export function readFileAsync (file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      return err ? reject(err) : resolve(data)
    })
  })
}

export function fileExistsAsync (file) {
  return new Promise((resolve) => fs.exists(file, resolve))
}

export function writeFileAsync (file, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, (err, data) => {
      return err ? reject(err) : resolve(file)
    })
  })
}

function mkdirs (dirpath, mode, callback) {
  fs.exists(dirpath, (exists) => {
    if (exists) {
      if (callback) {
        callback(null, dirpath)
      }
    } else {
      mkdirs(path.dirname(dirpath), mode, () => {
        fs.mkdir(dirpath, mode, callback)
      })
    }
  })
}

export function mkdirp (dirpath, mode, callback) {
  dirpath = path.resolve(dirpath)
  if (!callback) {
    callback = mode
    mode = parseInt('0777', 8) & (~process.umask())
  }
  return mkdirs(dirpath, mode, (err, data) => {
    if (typeof callback !== 'function') {
      return
    }
    if ((!err) || (err && err.code === 'EEXIST')) {
      return callback(null, data)
    }
    return callback(err)
  })
}

export function mkdirAsync (dir) {
  return new Promise((resolve, reject) => {
    mkdirp(dir, (err) => {
      return err ? reject(err) : resolve(dir)
    })
  })
}
