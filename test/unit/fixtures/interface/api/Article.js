import {ApiInterface, post} from '@sav/decorator'

@ApiInterface()
export default class Article {
  
  @post('comment/:aid')
  comment() {}
}
