// 注入模块方法

import {isFunction, pascalCase} from '../util'

export function actionPlugin (sav) {
  let actions
  sav.use({
    prepare (groups) {
      if (groups.actions) {
        actions = normalizeActions(groups.actions)
      }
    },
    setup (ctx) {
      if (actions) {
        ctx.prop('sav', proxyModuleActions(ctx, actions))
      }
    }
  })
}

function normalizeActions (groups) {
  let ret = {}
  for (let groupName in groups) {
    let group = groups[groupName]
    for (let modalName in group) {
      // sav.ApiArticle.test()
      ret[pascalCase(groupName + '_' + modalName)] = classToFunction(group[modalName])
    }
  }
  return ret
}

const skips = ['constructor']

function classToFunction (target) {
  if (isFunction(target)) {
    let proto = target.prototype
    return Object.getOwnPropertyNames(proto).reduce((tar, it) => {
      if (!~skips.indexOf(it) && typeof proto[it] === 'function') {
        tar[it] = proto[it]
      }
      return tar
    }, {})
  } else {
    return target
  }
}

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
                let proxyAction = cache[cacheName] = async function () {
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
