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
  profile ({setState, inputData}) {
    setState({
      userProfile: {
        id: +inputData.uid,
        name: `user-${inputData.uid}`
      }
    })
  }
}
