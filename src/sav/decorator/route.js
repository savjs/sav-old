import {annotateMethod} from './decorator'
import {isObject} from '../util/type.js'

export const route = annotateMethod((target, it, [method, path]) => {
  it.push(['route', makeRouteProps(processMethod(method), path)])
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
  return method.toUpperCase()
  // method = Array.isArray(method) ? method : [method]
  // return method.filter(Boolean).map((it) => it.toUpperCase())
}

function makeRouteProps (method, path) {
  let ret = {method}
  if (isObject(path)) {
    Object.assign(ret, path)
  } else {
    ret.path = path
  }
  return ret
}
