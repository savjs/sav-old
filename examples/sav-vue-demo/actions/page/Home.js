module.exports = class Home {
  index ({setState}) {
    setState({
      welcome: 'HelloWrold'
    })
    console.log('home')
  }
  about ({setState}) {
    setState({
      aboutInfo: "AboutAbout"
    })
  }
}
