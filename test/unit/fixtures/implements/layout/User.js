import UserLayoutInterface from '../../interface/Layout/User.js'
import {Layout} from 'sav/decorator'

@Layout(UserLayoutInterface)
export default class User {
  invoke ({all, sav}) {
    return all([
      sav.GuestLayout.copyRight(),
      this.userInfo(),
      this.userNavMenu()
    ])
  }
  userInfo ({setState}) {
    setState({
      userInfo: {
        name: 'jetiny',
        id: 100,
        role: 'user',
      }
    })
  }
  userNavMenu ({setState}) {
    setState({
      menus: [
        {
          title: 'articles',
          url: '/article/list'
        }
      ]
    })
  }
}
