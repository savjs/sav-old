
@Page({                 // 页面模块
  view: 'vue',          // 渲染引擎
  layout: 'User'       // 页面布局
})
export default class Article {
  @get('artilce/:aid')  // 需要提供接口路由地址
  view () {}

  @api()                // 这是一个api类型的接口, 因此不需要渲染引擎
  @get('comment/:aid')
  comment () {}
}
