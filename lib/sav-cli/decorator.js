/**
 * 装饰器方法
 */

const ROUTES_KEY = '_routes_'

export const get = routeMethod('GET')
export const post = routeMethod('POST')
export const head = routeMethod('HEAD')
export const put = routeMethod('PUT')
export const patch = routeMethod('PATCH')
export const del = routeMethod('DELETE')

function routeMethod (method) {
  return (args) => {
    return (target, action, descriptor) => {
      let it = target[ROUTES_KEY] || (target[ROUTES_KEY] = {})
      it[action] = Object.assign({}, method && {method},
        typeof args === 'string' ? {path: args} : args)
      return descriptor.value
    }
  }
}

export function Modal (props) {
  return (target) => {
    let routes = target.prototype[ROUTES_KEY]
    return Object.assign({}, props, routes && {routes})
  }
}
