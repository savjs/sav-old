import babel from 'rollup-plugin-babel'
import vue from 'rollup-plugin-vue2'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import re from 'rollup-plugin-re'
import json from 'rollup-plugin-json'

import {rollup} from 'rollup'

import Module from 'module'
import path from 'path'

import {createRenderer} from 'vue-server-renderer'

export const renderer = createRenderer()

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

export function mergeConfig (opts) {
  let config = {
    entry: 'src/server-entry.js',
    format: 'cjs',
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
  return Object.assign(config, opts)
}

export function compile (src, opts) {
  let configs = mergeConfig(Object.assign({
    entry: src
  }, opts))
  return rollup(configs).then((bundle) => {
    let result = bundle.generate({
      format: 'cjs'
    })
    let code = result.code.toString()
    return code
  })
}

export function compileImport (src, opts) {
  return compile(src, opts).then((str) => {
    return requireFromString(str, src)
  })
}
