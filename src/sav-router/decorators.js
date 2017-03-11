
import {annotateMethod} from 'sav-decorator'

/**
 * 定义方法路由
 * @param  {String|Array} methods 方法名称
 * @param  {String}       path 路径
 * @example
 * class Test {
 *   @route(['get', 'post'])
 *   say () {
 *   }
 * }
 */
export const route = annotateMethod((target, it, [methods, ...args]) => {
  it.push(['route', processMethod(methods), ...args])
})

/**
 * 扩展路由方法
 * 包括 'head', 'options', 'get', 'post', 'put', 'patch', 'del(delete)'
 * @param  {String}       path 路径
 * @example
 * class Test {
 *   @post
 *   say () {
 *   }
 * }
 */
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
