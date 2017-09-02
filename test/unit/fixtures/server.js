const {Sav} = require('sav')
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
