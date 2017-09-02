import {putDirFileContent, ensureDir} from '../util.js'

export function writePackage (dir, options) {
  let opts = Object.assign({
    force: false
  }, options)
  return ensureDir(dir).then(Promise.all([
    putDirFileContent(dir, opts, 'package.json', packageContent),
    putDirFileContent(dir, opts, 'index.html', indexContent),
    putDirFileContent(dir, opts, 'error.html', errorContent),
    putDirFileContent(dir, opts, 'server.js', serverContent),
    putDirFileContent(dir, opts, 'README.md', readmeContent)
  ]))
}

let packageContent = `{
  "name": "sav-project",
  "version": "1.0.0",
  "scripts": {
    "build": "cross-env NODE_ENV=production npm-run-all -p build-client && npm run build-server && npm run build-sass",
    "build-client": "node ./scripts/build-client.js",
    "build-sass": "node ./scripts/build-sass.js",
    "build-server": "node ./scripts/build-server.js",
    "build-static": "cross-env NODE_ENV=development IS_MOCK=1 IS_LOCAL=1 IS_DEV=1 node ./scripts/build-client.js",
    "build-local": "cross-env NODE_ENV=development IS_LOCAL=1 IS_DEV=1 node ./scripts/build-client.js"
  },
  "devDependencies": {
    "cross-env": "^5.0.5",
    "koa": "^2.3.0",
    "koa-static": "^4.0.1",
    "node-sass": "^4.5.3",
    "npm-run-all": "^4.1.1",
    "rollup-standalone": "^0.42.12",
    "sav-flux": "0.0.19",
    "vue": "^2.4.2",
    "vue-router": "^2.7.0",
    "vue-server-renderer": "^2.4.2",
    "vue-template-compiler": "^2.4.2"
  }
}`

let indexContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Document</title>
</head>
<body>
  <pre>{%=JSON.stringify(state, null, 2)%}</pre>
</body>
</html>`

let errorContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>{%=state.error.status%}</title>
</head>
<body>
  <pre>{%=JSON.stringify(state, null, 2)%}</pre>
</body>
</html>`

let serverContent = `const {Sav} = require('sav')
const Koa = require('koa')
const static = require('koa-static')
const path = require('path')
let app = new Koa()

app.use(static(path.resolve(__dirname, './static/'), {
  index: false
}))

let sav = new Sav({
  ssr: true
})
const contract = require('./contract')
const actions = require('./actions')
sav.declare(Object.assign({actions}, contract))
app.use(sav.compose())
app.listen(3000)
`

let readmeContent = `
### install
npm install

### build
npm run build
`
