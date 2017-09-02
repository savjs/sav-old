/**
 * rollup 打包辅助工具
 */
import {noticeString, putDirFileContent, ensureDir} from '../util.js'

export function writeRollup (dir, options) {
  let opts = Object.assign({
    force: false
  }, options)
  return ensureDir(dir).then(Promise.all([
    putDirFileContent(dir, opts, 'build-sass.js', sassContent),
    putDirFileContent(dir, opts, 'build-client.js', clientContent),
    putDirFileContent(dir, opts, 'build-server.js', serverContent)
  ]))
}

let sassContent = `${noticeString}// npm i -D node-sass rollup-standalone
const sass = require('node-sass')
const path = require('path')
const {fse} = require('rollup-standalone')

let distCssDir = path.resolve(__dirname, '../static/css/')

let includePaths = [
  path.resolve(__dirname, '../sass')
]

let IS_PROD = process.env.NODE_ENV === 'production'

// nested, expanded, compact, compressed
let outputStyle = IS_PROD ? 'compressed' : 'expanded'

fse.ensureDir(distCssDir).then(() => {
  return Promise.all([
    sassRenderAsync({
      outputStyle,
      sourceMap: !IS_PROD,
      file: path.resolve(__dirname, '../sass/app.sass'),
      outFile: path.resolve(distCssDir, 'app.css'),
      includePaths
    }),
  ]).then(() => {
    console.log('** build sass done **')
  })
})

function sassRenderAsync (opts) {
  return new Promise((resolve, reject) => {
    sass.render(opts, (err, result) => {
      if (err) {
        return reject(err)
      }
      let {outFile, sourceMap} = opts
      let ret = [fse.outputFile(outFile, result.css)]
      if (sourceMap) {
        ret.push(fse.outputFile(outFile + '.map', result.map))
      }
      Promise.all(ret).then(resolve, reject)
    })
  })
}

process.on('unhandledRejection', (reason) => {
  console.error(reason)
  process.exit(1)
})

`

let clientContent = `${noticeString}// npm i -D rollup-standalone
// rollup-standard 编译配置文件
// 安装 npm i rollup-standalone sav vue vue-router cross-env standard-sass
// 本地环境构建 cross-env NODE_ENV=development IS_MOCK=1 IS_LOCAL=1 IS_DEV=1 rollup-cli -c views/build-client.js
// 生成环境构建 cross-env NODE_ENV=production rollup-cli -c views/build-client.js

const {executeRollup, fse} = require('rollup-standalone')
const path = require('path')

let IS_PROD = process.env.NODE_ENV === 'production'

Promise.all([
  executeRollup({
    entry: path.resolve(__dirname, '../views/client-entry.js'),
    dest: 'static/js/client-entry.js',
    format: 'iife',
    moduleName: 'app',
    globals: {
      'vue': 'Vue',
      'vue-router': 'VueRouter'
    },
    external: [
      'vue',
      'vue-router'
    ],
    babelOptions: true,
    vueOptions: true,
    sourceMap: !IS_PROD,
    // uglifyOptions: IS_PROD,
    includeOptions: {
      paths: [
        // path.resolve(__dirname, 'src/')
      ]
    },
    commonjsOptions: {
      include: [
        'node_modules/**',
        'contract/**'
      ]
    },
    resolveOptions: {
      browser: true
    },
    defines: {
      IS_MOCK: process.env.IS_MOCK,    // 是否使用MOCK数据
      IS_LOCAL: process.env.IS_LOCAL,  // 是否本地环境
      IS_DEV: !IS_PROD,                // 是否开发环境
      IS_PROD: IS_PROD                 // 是否生产环境
    },
    replaces: {
      'process.env.NODE_ENV': IS_PROD ? '"production"' : '"development"'
    }
  }),
  fse.ensureDir('static/js').then(() => {
    return Promise.all([
      fse.copy(require.resolve(IS_PROD
        ? 'vue/dist/vue.min.js' : 'vue/dist/vue.js'),
        'static/js/vue.js'),
      fse.copy(require.resolve(IS_PROD
        ? 'vue-router/dist/vue-router.min.js' : 'vue-router/dist/vue-router.js'),
        'static/js/vue-router.js')
    ])
  })
]).then(() => {
  console.log('** build client done **')
})

process.on('unhandledRejection', (reason) => {
  console.error(reason)
  process.exit(1)
})
`

let serverContent = `${noticeString}// npm i -D rollup-standalone

const {executeRollup, fse} = require('rollup-standalone')
const path = require('path')

let IS_PROD = process.env.NODE_ENV === 'production'

executeRollup({
  entry: path.resolve(__dirname, '../views/server-entry.js'),
  dest: path.resolve(__dirname, '../server-entry.js'),
  format: 'cjs',
  external: [
    'vue',
    'vue-router',
    'vue-server-renderer'
  ],
  babelOptions: true,
  vueOptions: true,
  commonjsOptions: {
    include: [
      'node_modules/**',
      'contract/**'
    ]
  },
  resolveOptions: {
    browser: false
  },
  defines: {
    IS_MOCK: process.env.IS_MOCK,    // 是否使用MOCK数据
    IS_LOCAL: process.env.IS_LOCAL,  // 是否本地环境
    IS_DEV: !IS_PROD,                // 是否开发环境
    IS_PROD: IS_PROD                 // 是否生产环境
  },
  replaces: {
    'process.env.NODE_ENV': IS_PROD ? '"production"' : '"development"'
  }
}).then(() => {
  console.log('** build server done **')
})

process.on('unhandledRejection', (reason) => {
  console.error(reason)
  process.exit(1)
})
`
