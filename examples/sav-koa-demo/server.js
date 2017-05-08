let ab = process.env.ab
if (ab) {
  let http = require('http')
  let app = http.createServer(function (req, res) {
    res.end('hello world!')
  })
  app.listen(3000)
} else {
  require('./src')
}
