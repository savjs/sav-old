import {refer} from './conf'

/**
 * the generator
 * @param  {Object} opts the options merge into module
 * @return {Object}      generatored module
 * @example
 *
 * class SaleInterface {
 *   @conf('hello', 'world')
 *   say () {}
 * }
 *
 * @generator({auth: true})
 * @impl(SaleInterface)
 * class Sale {
 *   say () {}
 * }
 *
 * @example
 * {
 *   name: 'Sale',
 *   options: {auth: true},
 *   actions:{
 *     say: {
 *       name: 'say',
 *       action: Sale.prototype.say,
 *       options: [
 *         ['hello', 'world']
 *       ]
 *     }
 *   }
 * }
 */
export function gen (opts) {
  if (typeof opts === 'function') {
    return transform({})(opts)
  }
  return transform(opts || {})
}

export {gen as generator}

function transform (opts) {
  return (target) => {
    let configs = refer(target)
    let props = refer(target, true)
    props = {...props, ...opts}
    let actions = {}
    for (let name in configs) {
      actions[name] = { // action
        name,
        method: target.prototype[name],
        middleware: configs[name]
      }
    }
    let ret = { // module
      name: target.name,
      props,
      actions
    }
    return ret
  }
}
