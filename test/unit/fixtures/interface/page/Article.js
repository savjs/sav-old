import {PageInterface, post, get, auth, vue, req, res} from 'sav/decorator'

@PageInterface({
  view: 'vue',
  layout: 'User'
})
export default class Article {
  @get()
  list() {}

  @res()
  @get('/articles/:aid')
  @req()
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
