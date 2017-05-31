import babel from 'rollup-plugin-babel'
import vue from 'rollup-plugin-vue2'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import re from 'rollup-plugin-re'
import json from 'rollup-plugin-json'

let IS_MOCK = process.env.IS_MOCK
let IS_LOCAL = process.env.IS_LOCAL
let IS_DEV = process.env.IS_DEV

let patterns = [
  {
    test: 'process.env.NODE_ENV',
    replace: `${process.env.NODE_ENV}` || "development"
  }
]

if (!IS_MOCK) {
  patterns.push({
    test: /\/\/\s#if\sIS_MOCK([\s\S]*)#endif/g,
    replace: ''
  })
}

if (!IS_LOCAL) {
  patterns.push({
    test: /\/\/\s#if\sIS_LOCAL([\s\S]*)#endif/g,
    replace: ''
  })
}

if (!IS_DEV) {
  patterns.push({
    test: /\/\/\s#if\sIS_DEV([\s\S]*)#endif/g,
    replace: ''
  })
}

export default {
  entry: './views/client-entry.js',
  dest: 'static/js/client-entry.js', 
  format: 'iife',
  sourceMap: true,
  plugins: [
    re({
      patterns
    }),
    json({
      preferConst: false // Default: false
    }),
    vue(),
    babel({
      babelrc: false,
      externalHelpers: false,
      exclude: 'node_modules/**',
      'plugins': [
        ['transform-object-rest-spread', { 'useBuiltIns': true }]
      ]
    }),
    resolve({
      main: true
    }),
    commonjs()
  ],
  onwarn (err) {
    if (err) {
      if (err.code !== 'UNRESOLVED_IMPORT') {
        console.log(err.code, err.message)
      }
    }
  }
}
