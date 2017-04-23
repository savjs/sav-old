import {prop, makeProp, isFunction} from '@sav/util'

const CONFIG_KEY = '_CONFIG'

export const conf = annotateMethod((target, it, args) => {
  it.push(args)
})

export function refer (target, isTarget) {
  const proto = isTarget ? target : target.prototype
  return proto[CONFIG_KEY] || (proto[CONFIG_KEY] = {})
}

export function quickConf (key) {
  return annotateMethod((target, it, args) => {
    args.unshift(key)
    it.push(args)
  })
}

export function annotateMethod (fn) {
  return (...args) => {
    let annotateion = (target, method, descriptor) => {
      let it = target[CONFIG_KEY] || (target[CONFIG_KEY] = {})
      fn(target, it[method] || (it[method] = []), args || [])
      return descriptor.value
    }
    return annotateion
  }
}

export function props (props) {
  return (target) => {
    target[CONFIG_KEY] = {...target[CONFIG_KEY], ...props}
  }
}

export function impl (intf) {
  return (target) => {
    target[CONFIG_KEY] = {...target[CONFIG_KEY], ...refer(intf, true)}
    target.prototype[CONFIG_KEY] = refer(intf)
  }
}

export function functional (target) {
  return target ? convertToFunction(target) : (target) => convertToFunction(target)
}

export function generator (opts) {
  if (typeof opts === 'function') {
    return transform({})(opts)
  }
  return transform(opts || {})
}

export {generator as gen}

function transform (opts) {
  return (target) => {
    let configs = refer(target)
    let module = Object.assign({moduleName: target.name}, refer(target, true), opts)
    let routes = []
    for (let actionName in configs) {
      let plugins = []
      let props = {}
      let action = {
        actionName,
        plugins,
        props
      }
      let config = configs[actionName]
      for (let item of config) {
        let [name, value] = item
        if (name) {
          props[name] = value || null
          plugins.push(name)
        }
      }
      routes.push(action)
    }
    if (isFunction(target)) {
      prop(module, 'actions', convertToFunction(target))
    }
    module.routes = routes
    return module
  }
}

let skips = ['constructor']
export function convertToFunction (target) {
  if (isFunction(target)) {
    let proto = target.prototype
    return Object.getOwnPropertyNames(proto).reduce((tar, it) => {
      if (!~skips.indexOf(it) && 'function' === typeof proto[it]) {
        tar[it] = () => {
          return tar.$dispatch(it, proto[it], tar)
        }
      }
      return tar
    }, {})
  } else {
    for (let name in target) {
      target[name] = ((func) => {
        return target.$dispatch(name, func, target)
      })(target[it])
    }
    return target
  }
}
