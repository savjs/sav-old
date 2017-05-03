require('babel-register')({
  "plugins": [
    ["resolver", {"resolveDirs": ["src"]}],
    "transform-decorators-legacy",
    'transform-object-rest-spread',
    "transform-es2015-modules-commonjs"
  ]
})

require('./index')
