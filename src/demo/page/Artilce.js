import ArticlePage from '../interface/page/Article.js'

@page(ArticlePage)
export default class Article {
  list () {}
  async view ({db, ds, service, params, self}) {
    let article = await ds.articles.findOne({aid: params.aid}).ensure()
    let auther = await db.table('users').where({uid: article.uid}).ensure()
    let comments = await service.get("article/comments", {aid: params.aid})
    let me = await self.user.me()
    return {
        me,
        article,
        auther
    }
  }
  modify () {}
  async update ({db, ds, service, session, params, throwExp, input}) {
    let article = await ds.articles.findOne({aid: params.aid}).ensure()
    if (session.uid !== article.uid) {
        throwExp(403)
    }
    article = await ds.articles.update(input).ensure()
    return {
        article
    }
  }
}
