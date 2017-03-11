
export function prop (ctx, name) {
  let prop = makeProp(ctx, 'value')
  prop.getter = makeProp(ctx, 'get')
  prop.setter = makeProp(ctx, 'set')
  prop(name || 'ctx', ctx)
  prop('prop', prop)
}

function makeProp (target, propName) {
  return (key, value) => {
    if (typeof key === 'object') {
      for (let name in key) {
        Object.defineProperty(target, name, {[`${propName}`]: key[name]})
      }
    } else {
      Object.defineProperty(target, key, {[`${propName}`]: value})
    }
  }
}
