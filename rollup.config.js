import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import includePaths from 'rollup-plugin-includepaths'

export default {
  entry: 'src/index.js',
  targets: [
    { dest: 'dist/sav.cjs.js', format: 'cjs' },
    { dest: 'dist/sav.es.js', format: 'es' }
  ],
  external: [
    'bluebird',
    'consolidate',
    'koa-compose'
  ],
  plugins: [
    includePaths({
      paths: ['src']
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
