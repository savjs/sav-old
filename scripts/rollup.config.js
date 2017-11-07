import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import includePaths from 'rollup-plugin-includepaths'
import json from 'rollup-plugin-json'

export default {
  entry: 'lib/index.js',
  targets: [
    { dest: 'dist/sav.js', format: 'cjs' }
  ],
  external: [
    // 'sav-schema',
    // 'sav-util'
  ],
  plugins: [
    includePaths({
      paths: ['lib']
    }),
    json({
      preferConst: false // Default: false
    }),
    resolve({
      "jsnext:main": false,
      module: false,
      main: true
    }),
    babel({
      babelrc: false,
      externalHelpers: false,
      // exclude: ['node_modules/**'],
      exclude: [],
      include: ['node_modules/**'],
      plugins: [
        'transform-decorators-legacy',
        ['transform-object-rest-spread', { 'useBuiltIns': true }]
      ]
    }),
    commonjs({})
  ],
  onwarn (err) {
    if (err) {
      if (!~skips.indexOf(err.code)) {
        console.log(err.code, err.message)
        console.dir(err)
      }
    }
  }
}

let skips = ['UNRESOLVED_IMPORT', 'UNUSED_EXTERNAL_IMPORT']
