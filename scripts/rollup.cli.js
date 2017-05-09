import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import includePaths from 'rollup-plugin-includepaths'
import json from 'rollup-plugin-json'

export default {
  entry: 'src/sav-cli/index.js',
  targets: [
    { dest: 'dist/sav-cli.js', format: 'cjs' }
  ],
  external: [
    'babel-standalone'
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
      if (err.code !== 'UNRESOLVED_IMPORT') {
        console.log(err.code, err.message)
        console.dir(err)
      }
    }
  }
}
