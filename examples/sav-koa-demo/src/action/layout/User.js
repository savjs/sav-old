
module.exports = class User {
  invoke ({all}) {
    return all([
      this.copyRight(),
      this.userInfo(), 
      this.userNavMenu()
    ])
  }
  copyRight ({setState}) {
    setState({
      copyright: 'sav inc.'
    })
  }
  userInfo ({setState}) {
    setState({
      userInfo: {
        name: 'jetiny',
        id: '1001',
        role: 'admin',
      }
    })
  }
  userNavMenu ({setState}) {
    setState({
      menus: [
        {
          title: '主页',
          url: '/'
        },
        {
          title: '关于',
          url: '/about'
        }
      ]
    })
  }
}
