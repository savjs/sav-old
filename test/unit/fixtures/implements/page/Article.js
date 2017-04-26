import ArticlePageInterface from '../../interface/page/Article.js'
import {Page} from 'sav/decorator'

@Page(ArticlePageInterface)
export default class Article {
  list() {}

  view() {}

  modify() {}

  update() {}

  comment(){}
}
