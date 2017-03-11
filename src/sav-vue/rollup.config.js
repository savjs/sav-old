import babel from 'rollup-plugin-babel'
import vue from 'rollup-plugin-vue2'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import re from 'rollup-plugin-re'
import json from 'rollup-plugin-json'

export {rollup} from 'rollup'

export const config = {
  entry: 'src/server-entry.js',
  format: 'cjs',
  dest: 'dist/server-entry.js',
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
