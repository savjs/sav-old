import * as decorators from './sav/core/decorator'
import babel from 'babel-standalone'
import Module from 'module'
import {readFileAsync} from '../sav/util/file.js'
import {dirname} from 'path'

export function exportSavDecorators () {
  exportModule('sav', decorators)
}

function interopDefault (ex) {
  return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex
}

export function decoratorFileAsync (file) {
  return readFileAsync(file).then(data => {
    let code = babel.transform(data, {
      plugins: [
        'transform-decorators-legacy',
        ['transform-object-rest-spread', { 'useBuiltIns': true }],
        'transform-es2015-modules-commonjs'
      ]}).code
    return interopDefault(requireFromString(code, file))
  })
}

function requireFromString (code, filename, opts) {
  if (typeof filename === 'object') {
    opts = filename
    filename = undefined
  }
  opts = opts || {}
  filename = filename || ''
  opts.appendPaths = opts.appendPaths || []
  opts.prependPaths = opts.prependPaths || []
  if (typeof code !== 'string') {
    throw new Error('code must be a string, not ' + typeof code)
  }
  let paths = Module._nodeModulePaths(dirname(filename))
  let m = new Module(filename, module)
  m.filename = filename
  m.paths = [].concat(opts.prependPaths).concat(paths).concat(opts.appendPaths)
  m._compile(code, filename)
  return m.exports
}

let {_load, _findPath} = Module
let memoryModules = {}

Module._load = function(request, parent, isMain) {
  if (memoryModules[request]) {
    return memoryModules[request].exports
  }
  return _load(request, parent, isMain)
}

function exportModule (name, data) {
  memoryModules[name] = {
    exports: data
  }
}
