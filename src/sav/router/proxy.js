import {isFunction} from '../util'

export function proxyModuleActions (ctx, modules) {
  let cache = {}
  let proxy = new Proxy(modules, {
    get (target, moduleName) {
      if (target.hasOwnProperty(moduleName)) {
        let module = target[moduleName]
        if (cache[moduleName]) {
          return cache[moduleName]
        }
        let proxyModule = new Proxy(module, {
          get (target, actionName) {
            if (target.hasOwnProperty(actionName)) {
              let cacheName = `${moduleName}.${actionName}`
              if (cache[cacheName]) {
                return cache[cacheName]
              }
              let fn = target[actionName]
              if (isFunction(fn)) {
                let proxyAction = cache[cacheName] = async () => {
                  let args = [].slice.call(arguments)
                  args.unshift(ctx)
                  return fn.apply(proxyModule, args)
                }
                return proxyAction
              }
            }
          }
        })
        cache[moduleName] = proxyModule
        return proxyModule
      }
    }
  })
  return proxy
}
