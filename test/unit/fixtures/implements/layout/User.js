import UserLayoutInterface from '../../interface/Layout/User.js'
import {Layout} from 'sav/decorator'

@Layout(UserLayoutInterface)
export default class User {
  invoke () {}

  copyRight () {}
  userInfo () {}
  userNavMenu () {}
}
