
exports.ReqAccountLogin = {
  props: {
    userId: String,
    password: String
  }
};

exports.Sex = {
  enums: [
    {key: 'male', value: 1},
    {key: 'female', value: 2}
  ]
}
