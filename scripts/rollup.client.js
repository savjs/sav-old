import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import includePaths from 'rollup-plugin-includepaths'
import json from 'rollup-plugin-json'

export default {
  entry: 'src/sav-client/index.js',
  dest: 'dist/sav-client.js',
  moduleName: 'SavClient',
  format: 'cjs',
  // format: 'umd',
  external: [
    // 'koa-compose',
    // 'sav-schema',
    // 'path-to-regexp',
    'vue',
    'vue-router',
  ],
  plugins: [
    includePaths({
      paths: ['src']
    }),
    json({
      preferConst: false // Default: false
    }),
    babel({
      babelrc: false,
      externalHelpers: false,
      exclude: ['node_modules/**'],
      plugins: [
        'transform-decorators-legacy',
        ['transform-object-rest-spread', { 'useBuiltIns': true }]
      ]
    }),
    resolve(),
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
