import {PageInterface, post, get, auth} from '@sav/decorator'

@PageInterface({
  view: 'vue',
  layout: 'User'
})
export default class Article {
  @get()
  list() {}

  @get('article/:aid')
  view() {}

  @get('/modify/:aid')
  @auth()
  modify() {}

  @post('~update/:aid')
  @auth()
  update() {}
}
