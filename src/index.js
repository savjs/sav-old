export * from './sav'

// // import './test/dispatch.js'

// import {gen, post, props, auth, impl, get,
//   controller,
//   functional,
//   Router
// } from './sav.js'

// @controller()
// class AccountController {
//   @get()
//   get () {}

//   @post('update/:aid')
//   @auth()
//   update () {}
// }

// @gen()
// @impl(AccountController)
// class Account {
//   get () {
//   }
//   update () {}
//   test () {}
// }

// @functional
// class MyController {
//   get () {}
//   test () {}
// }

// // let skips = ['constructor']
// // export function getProtoMethods (cls, binder) {
// //   let target = cls.prototype
// //   return Object.getOwnPropertyNames(target).reduce((tar, it) => {
// //     if (!~skips.indexOf(it) && 'function' === typeof target[it]) {
// //       tar[it] = binder(it, target[it], tar)
// //     }
// //     return tar
// //   }, {})
// // }

// // console.log(getProtoMethods(MyController, function (name, func, target) {

// // }))

// // console.log(JSON.stringify(Account, null, 2))

// let router = new Router()

// router.declare(Account)
// // console.log(Account)
// // console.log(JSON.stringify(Account, null, 2))
// // console.log(JSON.stringify(router, null, 2))

// let ctx = {
//   method: 'GET',
//   path: '/Article/get'
// }
// router.exec(ctx).catch(err => console.error(err))

// // 模块定义
// let ModuleSchema = {
//   moduleName: 'Account',
//   routes: [
//     {
//       actionName: 'get',
//       queue: [ // 执行队列
//         {
//           name: 'route',
//           argv: {
//             methods: ['get'],
//             path: 'account/get/:aid'
//           }
//         },
//         {name: 'vue', argv: {}}
//       ]
//     }
//   ],
//   actions: {
//     get () {}
//   },
//   group: {
//     name: 'Auth',     // 分组名称(模块)
//     middlewares: [    // 分组中间件
//         {name: 'vue', argv: {}}
//     ],
//     queue: [ // 队列

//     ],
//     action () {}, // 分组中间件实现
//     exclude: [],
//     include: []
//   }
// }

// // 应用定义
// let AppSchema = {
//   // 应用中间件, 路由无关
//   middlewares: [
//     {name: 'dataset', argv: {}},
//     {name: 'database', argv: {}},
//     {name: 'cache', argv: {}}
//   ],
//   // 路由分组控制
//   groups: [
//     {
//       name: 'Auth',     // 分组名称(模块)
//       global: false,    // 是否全局控制
//       middlewares: [    // 分组中间件
//         {name: 'vue', argv: {}}
//       ],
//       routes: [
//         {
//           name: 'user',
//           route: 'Account@get',
//           middlewares: [    // 分组中间件
//             {name: 'vue', argv: {}}
//           ]
//         }
//       ],
//       methods: { // 分组中间件方法
//         user () {}
//       }
//     }
//   ]
// }

// // function queue1(ctx, {input}) {
// //   return 'hello'
// // }

// // function queue2(ctx, {input}) {
// //   return input + 'world'
// // }

// // function throwExp () {
// //   throw  'xxx'
// // }

// // let ctx = executeQueue([
// //   queue1,
// //   queue2,
// //   throwExp,
// // ])
