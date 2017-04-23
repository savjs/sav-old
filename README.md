# sav

### sav-core
核心模块
cookie
header
request
response
socket

### sav-decorator
装饰器
### sav-prop
模块注入
### sav-router
路由

### sav-dataset
nosql数据库
### sav-database
sql数据库
### sav-cache
缓存

### sav-view
页面渲染

### sav-vue
vue页面渲染

### 层次结构
app
    ctx
        request
        response

        req.headers
            req.cookies
        req.body

        res.headers
        res.body
        res.status

    socket
    services



```js

class Article {
    @get('article/:aid')
    async get ({db, ds, service, params, self}) {
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

    @post('article/update/:aid')
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

class User {
    async me ({cache, session}) {
        return await cache.getBy('user', session.uid)
    }
}

```
