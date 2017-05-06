const {LayoutInterface, invoke, res} = SavDecorators

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
