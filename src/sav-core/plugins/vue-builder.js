import babel from 'rollup-plugin-babel'
import vue from 'rollup-plugin-vue2'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import re from 'rollup-plugin-re'
import json from 'rollup-plugin-json'

export {rollup} from 'rollup'

import Module from 'module'
import path from 'path'

export function requireFromString (code, filename, opts) {
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
  let paths = Module._nodeModulePaths(path.dirname(filename))
  let m = new Module(filename, module.parent)
  m.filename = filename
  m.paths = [].concat(opts.prependPaths).concat(paths).concat(opts.appendPaths)
  m._compile(code, filename)
  return m.exports
}

export const config = {
  entry: 'src/server-entry.js',
  format: 'cjs',
  dest: 'dist/server-entry.js',
  external: [
    'vue',
    'vue-router',
    'vue-server-renderer/build'
  ],
  plugins: [
    re({
      patterns: [
        {
          test: 'process.env.NODE_ENV',
          replace: '"production"'
        }
      ]
    }),
    json({
      preferConst: false // Default: false
    }),
    vue(),
    babel({
      babelrc: false,
      exclude: 'node_modules/**',
      'plugins': []
    }),
    resolve({
      jsnext: true,
      main: true,
      browser: true
    }),
    commonjs()
  ]
}
