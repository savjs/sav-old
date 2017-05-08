
module.exports = class Account {
  login () {
    
  }
  postLogin () {
    
  }
  register ({setState, schema}) {
    let regInfo = schema.AccountRegister.create()
    setState(regInfo)
  }
  postRegister () {

  }
}
