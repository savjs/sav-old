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
    let props = refer(target, true)
    props = Object.assign({}, props, opts)
    let moduleName = target.name
    let actions = {}
    let module = {
      moduleName,
      props,
      actions
    }
    for (let actionName in configs) {
      let middleware = {}
      let config = configs[actionName]
      for (let item of config) {
        let [name, ...args] = item
        if (name) {
          middleware[name] = args
        }
      }
      let action = { // action
        actionName,
        props: middleware,
        config
      }
      Object.defineProperty(action, 'method', {
        value: target.prototype[actionName]
      })
      actions[actionName] = action
    }
    return module
  }
}
