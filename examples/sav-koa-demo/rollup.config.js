import babel from 'rollup-plugin-babel'
import vue from 'rollup-plugin-vue2'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import re from 'rollup-plugin-re'
import json from 'rollup-plugin-json'

export default {
  entry: 'src/views/client-entry.js',
  dest: 'static/js/client-entry.js', 
  format: 'iife',
  sourceMap: true,
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
