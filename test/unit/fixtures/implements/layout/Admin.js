import AdminLayoutInterface from '../../interface/Layout/Admin.js'
import {Layout} from 'sav/decorator'

@Layout(AdminLayoutInterface)
export default class Admin {
  invoke () {}

  copyRight () {}
  userInfo () {}
  adminNavMenu () {}
}
