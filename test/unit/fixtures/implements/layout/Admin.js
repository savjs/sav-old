import AdminLayoutInterface from '../../interface/Layout/Admin.js'
import {Layout} from 'sav/decorator'

@Layout(AdminLayoutInterface)
export default class Admin {
  invoke ({all, sav}) {
    return all([
      sav.GuestLayout.copyRight(),
      sav.UserLayout.userInfo(),
      this.adminNavMenu()
    ])
  }
  adminNavMenu () {}
}
