import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import includePaths from 'rollup-plugin-includepaths'
import json from 'rollup-plugin-json'

export default {
  entry: 'src/index.js',
  targets: [
    { dest: 'dist/sav.cjs.js', format: 'cjs' },
    { dest: 'dist/sav.es.js', format: 'es' }
  ],
  external: [
    'bluebird',
    'consolidate',
    'koa-compose',
    'vue',
    'vue-router',
    'vue-server-renderer',
    'rollup',
    'rollup-plugin-babel',
    'rollup-plugin-node-resolve',
    'rollup-plugin-commonjs',
    'rollup-plugin-vue2',
    'rollup-plugin-re'
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
