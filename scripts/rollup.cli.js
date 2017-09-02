import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import includePaths from 'rollup-plugin-includepaths'
import json from 'rollup-plugin-json'
import fs from 'fs-extra'
const pkg = require('../package.json')

export default {
  entry: 'lib/sav-cli/cli.js',
  targets: [
    { dest: 'dist/sav-cli.js', format: 'cjs' }
  ],
  external: [
    'babel-standalone',
    'acorn'
  ],
  plugins: [
    includePaths({
      paths: ['lib']
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
    commonjs({}),
    {
      name: 'copy-files',
      ongenerate(bundle, res){
        res.code = res.code.replace('babel-standalone', './babel-standalone')
          .replace('\'acorn\'', '\'./acorn\'')
          .replace('$$VERSION$$', pkg.version)
        fs.copy(require.resolve('babel-standalone'), 'dist/babel-standalone.js', err => {
          if (err) return console.error(err)
          console.log('copy babel-standalone')
        })
        fs.copy(require.resolve('acorn'), 'dist/acorn.js', err => {
          if (err) return console.error(err)
          console.log('copy acorn')
        })
      }
    }
  ],
  onwarn (err) {
    if (err) {
      if (err.code !== 'UNRESOLVED_IMPORT') {
        console.log(err.code, err.message)
        console.dir(err)
      }
    }
  }
}
