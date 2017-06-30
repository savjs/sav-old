module.exports = class User {
  invoke () {

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
      ]
    })
  }
}
