import {annotateMethod} from './decorator'

export const route = annotateMethod((target, it, [methods, ...args]) => {
  it.push(['route', processMethod(methods), ...args])
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
    it.push(['route', processMethod(method), ...args])
  })
}

function processMethod (method) {
  method = Array.isArray(method) ? method : [method]
  return method.filter(it => !!it).map((it) => it.toUpperCase())
}
