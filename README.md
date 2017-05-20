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


## todo

开发工具打包
rollup
webpack
standard
    eslint
ava
nyc
babel

```js

装饰器提取后的模块格式

{
  "moduleName": "Account",
  "moduleGroup": "Page",
  "uri": "AccountPage",
  "props": {
    "view": "vue",
    "layout": "UserLayout"
  },
  "routes": [
    {
      "actionName": "login",
      "uri": "AccountPage.login",
      "tasks": [
        { "name": "title", "props": "登录" },
        { "name": "route", "props": {"methods": ["GET"]}}
      ]
    }
  ]
}

经由模块预处理插件(注入, 不会被序列化)
{
  "routes": [
    {
      "actionName": "login",
      "uri": "AccountPage.login",
      "tasks": [
        { "name": "title", "props": "登录" }, // 任务项
      ],
      module, // 双向绑定
      middlewares: [],
      appendMiddleware (name, middleware, prepend) {}
      props: { // 将tasks转换为props方便后续处理
        title: { // 任务项
          name: "title",
          props: "登录",

          middleware: null,
          setMiddleware (middleware) {}
        }
      }
    }
  ],

}

经由路由转换插件(添加)
{
  "SavRoute": {
    "uri": "AccountPage",
    "path": "/account",
    "childs": [
      {
        "uri": "AccountPage.login",
        "path": "/account/login",
        "methods": [
          "GET"
        ]
      }
    ],
    "parents": []
  },
  "VueRoute": {
    "component": "Account/Account",
    "path": "/account",
    "children": [
      {
        "component": "Account/AccountLogin",
        "name": "AccountLogin",
        "path": "login",
        "methods": [
          "GET"
        ]
      }
    ]
  }
}

```

#### sav要做什么

App = Page + Route
Page = PageLayout + PageRoute + PageView
PageLayout = Views
View = Template + State + Route
Route = Api + Schema
State = Schema

=>

Page = Route + View + State
Route = View = State

mapGetter => DataSource

