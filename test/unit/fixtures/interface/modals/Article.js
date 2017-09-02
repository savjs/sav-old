import {Modal, post, get} from 'sav'

@Modal({
  view: true
})
export default class Article {
  @get({
    title: '文章列表',
    response: {
      props: {
        articles: 'Array<ArticleItem>'
      },
      refs: {
        ArticleItem: {
          export: 1,
          props: {
            id: 'Number',
            title: 'String',
            content: 'String'
          }
        }
      }
    }
  })
  posts() {}

  @get({
    path: '/articles/:aid',
    response: {
      props: {
        article: 'ArticleItem'
      }
    },
    request: {
      props: {
        aid: 'String'
      }
    }
  })
  view() {}

  @post({
    path: 'modify/:aid?',
    auth: true,
    component: 'Article/ArticleModify'
  })
  modify() {}

  @post({
    path: 'update/:aid',
    auth: true,
    component: 'Article/ArticleModify'
  })
  update() {}
}
