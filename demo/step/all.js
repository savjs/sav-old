let all = {
  apis: [ // 数据接口
    {
      moduleName: 'Article',  // 模块名称
      moduleType: 'Api',     // 模块类型
      props: {},  // 模块配置
      routes: [   // 模块路由列表
        {
          actionName: 'get',      // 路由方法名称
          plugins: ['auth', 'route'], // 路由插件列表
          props: { // 方法配置
            route: {
              methods: ['GET'],
              path: 'article/:aid'
            },
            auth: 'user'
          }
        }
      ]
    }
  ],
  pages: [ // 页面
    {
      moduleName: 'Article',  // 模块名称
      moduleType: 'Page',     // 模块类型
      props: { // 模块配置
        view: 'vue',    // 渲染引擎
        layout: 'User'  // 页面布局
      },
      routes: [   // 模块路由列表
        {
          actionName: 'view',      // 路由方法名称
          plugins: ['auth'], // 路由插件列表
          props: { // 方法配置
            route: {
              methods: ['GET'],
              path: 'article/:aid'
            }
          }
        }
      ]
    }
  ],
  layouts: [ // 布局
    {
      moduleName: 'User',   // 模块名称
      moduleType: 'Layout', // 模块类型
      props: { // 模块配置
      },
      routes: [   // 模块路由列表
        {
          actionName: 'userInfo', // 路由方法名称
          plugins: ['route'],     // 路由插件列表
          props: { // 方法配置
            route: {
              methods: ['GET'],
              path: 'user/:aid'
            }
          }
        }
      ]
    }
  ]
}
