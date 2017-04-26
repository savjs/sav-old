import {Api} from 'sav/decorator'

import ArticleApiInterface from '../../interface/api/Article.js'
import * as Article from './Article.js'

export default [
  Api(ArticleApiInterface)(Article)
]
