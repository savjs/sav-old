import ArticlePageInterface from '../../interface/page/Article.js'
import {Page} from 'sav/decorator'

@Page(ArticlePageInterface)
export default class Article {
  list({setState}) {
    setState({
      articles: [
        {
          id: 1001,
          title: '标题1',
          content: '正文1'
        },
        {
          id: 1002,
          title: '标题2',
          content: '正文2',
          meta: '其他'
        },
      ]
    })
  }

  view({setState}) {
    setState({
      article: {
        id: 1002,
        title: '标题2',
        content: '正文2',
        meta: '其他'
      }
    })
  }

  modify() {}

  update() {}

  comment(){}
}
