import {Modal, get} from 'sav'

@Modal()
export default class User {
  @get()
  userInfo () {}

  @get()
  navMenu () {}
}
