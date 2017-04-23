import {makeProp} from '@sav/util'
import {executeMiddlewares} from './executer'

export function walkModules (router, modules) {
  for (let module of modules) {
    makeProp(module, false)({
      router
    })
    // 模块分组注入
    if (module.moduleGroup) {
      let groups = router.groups[module.moduleGroup] || (router.groups[module.moduleGroup] = {})
      groups[module.moduleName] = module.actions
    }
    router.emit('module', module)
    for (let action of module.routes) {
      let prop = makeProp(action, false)
      prop(createMiddlewares(action))
      prop({
        router,
        module
      })
      router.emit('action', action)
    }
  }
}

function createMiddlewares (action) {
  return {
    middlewares: action.plugins.map((name) => {
      return {name}
    }),
    setMiddleware (name, middleware) {
      for (let it of action.middlewares) {
        if (it.name === name) {
          it.middleware = middleware
          return
        }
      }
      action.middlewares.push({name, middleware})
    },
    getMiddleware (name) {
      for (let it of action.middlewares) {
        if (it.name === name) {
          return it
        }
      }
    },
    hasMiddleware (name) {
      return ~action.plugins.indexOf(name)
    }
  }
}

export async function payloadStart (ctx, next) {
  let prop = makeProp(ctx)
  // @TODO 注入state
  await next()
}

export async function payloadEnd (ctx, next) {
  let method = ctx.method.toUpperCase()
  let path = ctx.path || ctx.originalUrl
  let matched = this.matchRoute(path, method)
  if (matched) {
    let [route, params] = matched
    let action = route.action
    ctx.prop({params, route, action})
    // 路由中间件
    await executeMiddlewares(action.middlewares, ctx)
    // @TODO 渲染
  } else {
    await next()
  }
}
