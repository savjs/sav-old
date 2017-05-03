import {PageInterface, post, get, auth, vue, req, res, meta, title} from 'sav/decorator'

@PageInterface({
  view: 'vue',
  layout: 'User'
})
export default class Article {
  @res({
    props: {
      articles: 'Array<ArticleItem>'
    },
    refs: {
      ArticleItem: {
        name: 'ArticleItem',
        props: {
          id: 'Number',
          title: 'String',
          content: 'String'
        }
      }
    }
  })
  @get()
  @title('文章列表')
  @meta({
    keywords: '关键字列表',
    description: '页面描述',
  })
  list() {}

  @res({
    props: {
      article: 'ArticleItem'
    }
  })
  @get('/articles/:aid')
  @req({
    props: {
      aid: 'String'
    }
  })
  @auth()
  view() {}

  @get('modify/:id?')
  @auth()
  @vue({
    component: 'Article/ArticleModify'
  })
  modify() {}

  @post('update/:aid')
  @auth()
  @vue({
    component: 'Article/ArticleModify'
  })
  update() {}

  @post('comment/:aid')
  @vue(false)
  comment(){}
}
