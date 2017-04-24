import {post, auth, get, controller} from '../sav.js'

@controller()
export default class AccountController {
  @get()
  get () {}

  @post('update/:aid')
  @auth()
  update () {}
}
