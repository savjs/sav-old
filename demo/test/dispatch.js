import Helper from './Helper.js'
import Article from './Article.js'
import {prop, isPromise, isFunction} from '@sav/util'

// let modules = {}

function proxyApi (entry) {
  return new Proxy(entry, {
    get (target, name) {
      return (payload) => {
        return entry(name, payload)
      }
    }
  })
}

var modules = {
  Account: {
    get (ctx) {
      console.log(this, ctx)
      this.test()
    },
    test (ctx) {
      console.log('test')
      ctx.User.demo()
    }
  },
  User: {
    async demo (ctx) {
      console.log(this, ctx)
    }
  }
}

function ProxyModules (ctx, modules) {
  for (let propName in modules) {
    let propValue = modules[propName]
    let cache = {} // need this ?
    let newValue = new Proxy(propValue, {
      get (target, name) {
        if (target.hasOwnProperty(name)) {
          if (cache[name]) {
            return cache[name]
          }
          let fn = target[name]
          if (isFunction(fn)) {
            return cache[name] = async () => {
              let args = [].slice.call(arguments)
              args.unshift(ctx)
              return fn.apply(newValue, args)
            }
          }
        }
      }
    })
    ctx[propName] = newValue
  }
}

var ctx = {}

ProxyModules(ctx, modules)

console.log(ctx.Account.get())
console.log('done')

// prop(Helper, '$dispatch', dispatch)

// console.log(Helper, Article)

// function createProxyBind () {
//   let first
//   return (target) => {
//     let proxy = new Proxy(target, {
//       get (target, name) {
//         if (name in target) {
//         }
//       }
//     })
//     return proxy
//   }
// }
