import {isString, isUndefined, isObject} from './type.js'

export function prop (target, key, value) {
  Object.defineProperty(target, key, {value})
}

function makePropFunc (target, propName) {
  return (key, value) => {
    if (isObject(key)) {
      for (let name in key) {
        Object.defineProperty(target, name, {[`${propName}`]: key[name], writable: true})
      }
    } else {
      Object.defineProperty(target, key, {[`${propName}`]: value, writable: true})
    }
  }
}

export function makeProp (ctx, name) {
  if (ctx.prop) {
    return ctx.prop
  }
  let prop = makePropFunc(ctx, 'value')
  prop.getter = makePropFunc(ctx, 'get')
  prop.setter = makePropFunc(ctx, 'set')
  if (isString(name) || isUndefined(name)) {
    prop(name || 'ctx', ctx)
  }
  prop('prop', prop)
  return prop
}
