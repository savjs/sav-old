import {LayoutInterface, invoke, res} from 'sav/decorator'

@LayoutInterface()
export default class Admin {

  @res('ResCopyRight')
  @invoke()
  copyRight () {}

  @res('ResUserInfo')
  @invoke()
  userInfo () {}

  @res('ResNavMenu')
  @invoke()
  adminNavMenu () {}
}
