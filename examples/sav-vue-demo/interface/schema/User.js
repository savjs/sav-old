
exports.ReqAccountLogin = {
  props: {
    userId: String,
    password: String
  }
}

exports.Sex = {
  default: 1,
  enums: [
    {key: 'male', value: 1},
    {key: 'female', value: 2}
  ]
}

exports.ResHomeIndex = {
  res: {
    welcome: 'Hello World'
  },
  props: {
    welcome: String
  }
}

exports.ResHomeAbout = {
  props: {
    aboutInfo: String
  }
}
