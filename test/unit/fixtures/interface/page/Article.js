import {PageInterface, post, get, auth, vue} from '@sav/decorator'

@PageInterface({
  view: 'vue',
  layout: 'User'
})
export default class Article {
  @get()
  list() {}

  @get('/articles/:aid')
  view() {}

  @vue({
    component: 'Article/ArticleModify'
  })
  @get('modify/:id?')
  @auth()
  modify() {}

  @vue({
    component: 'Article/ArticleModify'
  })
  @post('update/:aid')
  @auth()
  update() {}

  @vue(false)
  @post('comment/:aid')
  comment(){}
}
