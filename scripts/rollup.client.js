import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import includePaths from 'rollup-plugin-includepaths'
import json from 'rollup-plugin-json'

export default {
  entry: 'lib/sav-client/index.js',
  targets: [
    // { dest: 'dist/sav-client.umd.js', format: 'umd', moduleName: 'Sav' },
    { dest: 'dist/sav-client.js', format: 'cjs'},
  ],
  external: [
    'sav-util',
    'sav-schema',
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
      if (err.code !== 'UNRESOLVED_IMPORT') {
        console.log(err.code, err.message)
        console.dir(err)
      }
    }
  }
}
