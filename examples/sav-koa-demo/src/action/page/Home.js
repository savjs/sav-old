module.exports = class Home {
  index ({setState}) {
    setState({
      welcome: '欢迎光临'
    })
  }
  about ({setState, ctx}) {
    setState({
      about: '欢迎再次光临'
    })
  }
}
