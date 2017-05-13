import {annotateMethod} from './decorator'
import {isObject} from '../util/type.js'

export const route = annotateMethod((target, it, [methods, path]) => {
  it.push(['route', makeRouteProps(processMethod(methods), path)])
})

export const head = routeMethods('head')
export const options = routeMethods('options')
export const get = routeMethods('get')
export const post = routeMethods('post')
export const put = routeMethods('put')
export const patch = routeMethods('patch')
export const del = routeMethods('delete')

function routeMethods (method) {
  return annotateMethod((target, it, args) => {
    it.push(['route', makeRouteProps(processMethod(method), args[0])])
  })
}

function processMethod (method) {
  method = Array.isArray(method) ? method : [method]
  return method.filter(Boolean).map((it) => it.toUpperCase())
}

function makeRouteProps (methods, path) {
  let ret = {methods}
  if (isObject(path)) {
    Object.assign(ret, path)
  } else {
    ret.path = path
  }
  return ret
}
