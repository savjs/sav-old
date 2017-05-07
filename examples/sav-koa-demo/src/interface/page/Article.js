const {PageInterface, post, get, auth, vue, req, res, meta, title} = SavDecorators

@PageInterface({
  view: 'vue',
  layout: 'UserLayout'
})
export default class Article {
  @res({
    name: 'ResArticleList',
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
    name: 'ResArtilceView',
    props: {
      article: 'ArticleItem'
    }
  })
  @get('view/:aid')
  @req({
    props: {
      aid: 'String'
    }
  })
  view() {}

  @get('modify/:id?')
  @auth()
  @vue({component: 'Article/ArticleModify'})
  modify() {}

  @post('update/:aid')
  @auth()
  @vue({component: 'Article/ArticleModify'})
  update() {}
}
