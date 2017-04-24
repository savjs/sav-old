import {gen, impl} from '../sav.js'
import Helper from './Helper.js'
import AccountController from './ArticleController.js'

@gen()
@impl(AccountController)
export default class Account {
  get () {
    this.test()
    Helper.test()
  }
  update () {}
  test () {
    console.log('article.test')
  }
}
