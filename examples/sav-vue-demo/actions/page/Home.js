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
  userInfo ({setState}) {
    setState({
      userInfo: {
        name: 'xxx',
        id: 0,
        role: 'user'
      }
    })
  }
  navMenu ({setState}) {
    setState({
      menus: [
        {
          title: 'about',
          url: '/about'
        },
        {
          title: 'home',
          url: '/'
        },
        {
          title: 'profile1',
          url: '/profile/1'
        },
        {
          title: 'profile2',
          url: '/profile/2'
        },
      ]
    })
  }
}
