const CONFIG_KEY = '_CONFIG'

/**
 * insert config data
 * @example
 * class Test {
 *   @conf('hello', 'world')
 *   say () {
 *   }
 * }
 */
export const conf = annotateMethod((target, it, args) => {
  it.push(args)
})

/**
 * get config reference data
 * @param  {Class} target dest class
 * @param  {Boolean} isTarget whether from target
 * @return {Object}        data
 */
export function refer (target, isTarget) {
  const proto = isTarget ? target : target.prototype
  return proto[CONFIG_KEY] || (proto[CONFIG_KEY] = {})
}

/**
 * conf with key
 * @param  {String} key config key name
 * @return {Function}     a fn wrappered conf
 */
export function quickConf (key) {
  return annotateMethod((target, it, args) => {
    args.unshift(key)
    it.push(args)
  })
}

/**
 * props interface
 * @param  {Class} intf interface class
 */
export function props (props) {
  return (target) => {
    target[CONFIG_KEY] = {...target[CONFIG_KEY], ...props}
  }
}

/**
 * impl interface
 * @param  {Class} intf interface class
 */
export function impl (intf) {
  return (target) => {
    target[CONFIG_KEY] = {...target[CONFIG_KEY], ...refer(intf, true)}
    target.prototype[CONFIG_KEY] = refer(intf)
  }
}

/**
 * annotate method
 * @param  {Function} fn   callback
 * @example
 * let conf = annotateMethod((target, arry, args) => arry.push(args))
 * class Test {
 *   @conf('hello', 'world')
 *   say () {
 *   }
 * }
 */
export function annotateMethod (fn) {
  return (...args) => {
    if (args.length === 3 && args[2]) {
      let descriptor = args[2]
      if (typeof descriptor === 'object' && descriptor.hasOwnProperty('configurable') && descriptor.hasOwnProperty('value')) {
        annotateMethodFactory(fn)(...args)
        return // can not ```return annotateMethodFactory(fn)(...args)```
      }
    }
    return annotateMethodFactory(fn, args)
  }
}

function annotateMethodFactory (fn, args) {
  let annotateion = (target, method, descriptor) => {
    let it = target[CONFIG_KEY] || (target[CONFIG_KEY] = {})
    fn(target, it[method] || (it[method] = []), args || [])
    return descriptor.value
  }
  return annotateion
}

// not used
// /**
//  * annotate class
//  * @param  {Function} fn callback
//  */
// export function annotateClass (fn) {
//   return (...args) => {
//     if (args.length === 1 && args[0]) {
//       let target = args[0]
//       if (typeof target === 'function') {
//         annotateClassFactory(fn)(...args)
//         return
//       }
//     }
//     return annotateClassFactory(fn, args)
//   }
// }

// function annotateClassFactory (fn, args) {
//   let annotateion = (target) => {
//     let it = target[CONFIG_KEY] || (target[CONFIG_KEY] = {})
//     fn(target, it, args || [])
//   }
//   return annotateion
// }
