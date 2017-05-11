import AdminLayoutInterface from '../../interface/layout/Admin.js'
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
