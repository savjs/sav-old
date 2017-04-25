import {annotateMethod} from './decorator'

export const route = annotateMethod((target, it, [methods, path]) => {
  it.push(['route', {
    methods: processMethod(methods),
    path
  }])
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
    it.push(['route', {
      methods: processMethod(method),
      path: args[0]
    }])
  })
}

function processMethod (method) {
  method = Array.isArray(method) ? method : [method]
  return method.filter(Boolean).map((it) => it.toUpperCase())
}
