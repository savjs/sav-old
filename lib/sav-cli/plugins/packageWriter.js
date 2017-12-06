import {putDirFileContent, ensureDir, mergeJsonFileContent} from '../util.js'

export function writePackage (dir, options) {
  let opts = Object.assign({
    force: false,
    name: 'sav-app'
  }, options)
  return ensureDir(dir).then(Promise.all([
    mergeJsonFileContent(dir, opts, 'package.json', JSON.parse(packageContent.replace(/\$appName/g, opts.name))),
    putDirFileContent(dir, opts, 'index.html', indexContent.replace(/\$appName/g, opts.name)),
    putDirFileContent(dir, opts, 'error.html', errorContent.replace(/\$appName/g, opts.name)),
    putDirFileContent(dir, opts, 'server.js', serverContent),
    putDirFileContent(dir, opts, 'sav.yml', ymlContent.replace(/\$appName/g, opts.name)),
    putDirFileContent(dir, opts, 'README.md', readmeContent)
  ]))
}

let packageContent = `{
  "name": "$appName",
  "version": "1.0.0",
  "scripts": {
    "build": "npm run cc && cross-env NODE_ENV=production npm-run-all -p build-client && npm run build-server && npm run build-sass",
    "build-mock": "npm run cc && cross-env NODE_ENV=development IS_MOCK=1 IS_LOCAL=1 IS_DEV=1 npm-run-all -p build-client && npm run build-server && npm run build-sass",
    "build-dev": "npm run cc && cross-env NODE_ENV=development IS_LOCAL=1 IS_DEV=1 npm-run-all -p build-client && npm run build-server && npm run build-sass",
    "build-client": "node ./scripts/build-client.js",
    "build-sass": "node ./scripts/build-sass.js",
    "build-server": "node ./scripts/build-server.js",
    "watch-interface": "watch -p \\"+(interface)/**/*.js\\" -c \\" npm run cc\\"",
    "watch-sass": "watch -p \\"+(sass)/**/*.sass\\" -c \\" npm run build-sass\\"",
    "watch-view": "watch -p \\"+(contract)/**/*.+(js)\\" -p \\"+(views)/**/*.+(js|vue)\\" -c \\" npm-run-all -p build-server build-client\\"",
    "watch-dev": "watch -p \\"+(contract)/**/*.+(js)\\" -p \\"+(views)/**/*.+(js|vue)\\" -c \\" cross-env NODE_ENV=development IS_LOCAL=1 IS_DEV=1 npm-run-all -p build-client build-server\\"",
    "dev": "npm-run-all -p stop-app build-dev && npm-run-all -p start-app watch-interface watch-sass watch-dev",
    "watch-mock": "watch -p \\"+(contract)/**/*.+(js)\\" -p \\"+(views)/**/*.+(js|vue)\\" -c \\" cross-env NODE_ENV=development IS_MOCK=1 IS_LOCAL=1 IS_DEV=1 npm-run-all -p build-client build-server\\"",
    "mock": "npm-run-all -p stop-app build-mock && npm-run-all -p start-app watch-interface watch-sass watch-mock",
    "start-app": "pm2 restart sav.yml --only $appName",
    "stop-app": "pm2 stop sav.yml --only $appName",
    "cc": "sav-cli -a $appName -i interface",
    "start": "node server.js"
  },
  "devDependencies": {
    "cross-env": "^5.0.5",
    "koa": "^2.3.0",
    "koa-static": "^4.0.1",
    "node-sass": "^4.5.3",
    "npm-run-all": "^4.1.1",
    "rollup-standalone": "^0.42.12",
    "sav": "$$VERSION$$",
    "sav-flux": "^0.0.20",
    "sav-schema": "^1.0.24",
    "sav-util": "^1.0.25",
    "vue": "^2.5.8",
    "vue-router": "^3.0.1",
    "vue-server-renderer": "^2.5.8",
    "vue-template-compiler": "^2.5.8",
    "watch-cli": "^0.2.3"
  }
}`

let indexContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>$appName</title>
</head>
<body>
  <div id="app"></div>
</body>
</html>`

let errorContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>$appName</title>
</head>
<body>
  <div id="app"></div>
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
  // ssr: true
})
const contract = require('./contract')
const actions = require('./actions')
sav.declare(Object.assign({actions}, contract))
app.use(sav.compose())
app.listen(3000)
`

let readmeContent = `
### install

npm install -g pm2
npm install

### dev

npm run dev

### mock

npm run mock

### build

npm run build

`

let ymlContent = `apps:
  - name   : '$appName'
    script : ./server.js
    watch  :
      - actions
      - contract
      - server.js
      - server-entry.js
    watch_options:
      usePolling: true
    env    :
      NODE_ENV: development
    env_production:
      NODE_ENV: production
`
