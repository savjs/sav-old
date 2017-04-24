import {LayoutInterface, invoke} from '@sav/decorator'

@LayoutInterface()
export default class User {

  @invoke()
  copyRight () {}

  @invoke()
  userInfo () {}

  @invoke()
  userNavMenu () {}
}
