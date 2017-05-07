import {isString, isUndefined, isObject} from './type.js'

export function prop (target, key, value) {
  Object.defineProperty(target, key, {value, writable: true, configurable: true})
}

function makePropFunc (target, propName) {
  if (!target._props_) {
    prop(target, '_props_', ['_props_'])
  }
  let props = target._props_
  return (key, value) => {
    if (isObject(key)) {
      for (let name in key) {
        Object.defineProperty(target, name, {[`${propName}`]: key[name], writable: true, configurable: true})
        props.push(name)
      }
    } else {
      let descriptor = {[`${propName}`]: value, configurable: true}
      if (propName === 'value') {
        descriptor.writable = true
      }
      Object.defineProperty(target, key, descriptor)
      props.push(key)
    }
  }
}

export function delProps (target) {
  if (target._props_) {
    target._props_.forEach((it) => {
      delete target[it]
    })
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
