import {LayoutInterface, invoke} from 'sav/decorator'

@LayoutInterface()
export default class Admin {

  @invoke()
  copyRight () {}

  @invoke()
  userInfo () {}

  @invoke()
  adminNavMenu () {}
}
