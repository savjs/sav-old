module.exports = class Account {
  register ({setState, schema}) {
    let regInfo = schema.AccountRegister.create()
    setState(regInfo)
  }
  login () {

  }
  postLogin () {

  }
  postRegister () {

  }
}
