import {isFunction, isUndefined, prop} from '../util'

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

export function functional (intf) {
  return (target) => {
    prop(intf, 'actions', convertToFunction(target))
    return intf
  }
}

export function generator (props, opts) {
  if (typeof props === 'function') {
    return transform({})(props, opts)
  }
  return transform(props || {}, opts)
}

export function DeclareModule (factory) {
  return (props) => {
    return (target) => {
      return functional(factory(props)(target))(target)
    }
  }
}

export {generator as gen}

function transform (moduleProps, moduleOpts) {
  return (target) => {
    let configs = refer(target)
    let module = Object.assign({moduleName: target.name}, moduleOpts)
    module.uri = module.moduleName + (module.moduleGroup || '')
    module.props = Object.assign({}, refer(target, true), moduleProps)
    let routes = []
    for (let actionName in configs) {
      let middlewares = []
      let action = {
        actionName,
        uri: `${module.uri}.${actionName}`,
        middlewares
      }
      let config = configs[actionName]
      for (let item of config) {
        let [name, value] = item
        if (name) {
          middlewares.push({
            name,
            props: isUndefined(value) ? null : value
          })
        }
      }
      routes.push(action)
    }
    module.routes = routes
    return module
  }
}

let skips = ['constructor']
function convertToFunction (target) {
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
