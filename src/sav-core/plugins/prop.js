
export function prop (ctx, name) {
  let prop = makeProp(ctx, 'value')
  prop.getter = makeProp(ctx, 'get')
  prop.setter = makeProp(ctx, 'set')
  prop(name || 'ctx', ctx)
  prop('prop', prop)
}

let initProp = prop

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

export function promise (ctx, Promiser) {
  if (!ctx.prop) {
    initProp(ctx)
  }
  let prop = ctx.prop
  Promiser || (Promiser = Promise)
  prop({
    resolve: Promiser.resolve.bind(Promiser),
    reject: Promiser.reject.bind(Promiser),
    all: Promiser.all.bind(Promiser),
    then: (fn, fail) => {
      return new Promiser(fn, fail)
    }
  })
}

export function state (ctx) {
  if (!ctx.prop) {
    initProp(ctx)
  }
  let prop = ctx.prop
  let state = {}
  prop.getter('state', () => state)
  prop('setState', (...args) => {
    let len = args.length
    if (len < 1) {
      return
    } else if (len === 1) {
      if (Array.isArray(args[0])) {
        args = args[0]
      } else {
        state = {...state, ...args[0]}
        return
      }
    }
    args.unshift(state)
    state = Object.assign.apply(state, args)
  })
  prop('replaceState', (newState) => {
    state = newState || {}
  })
}

export function propPlugin (sav) {
  sav.use({
    async payload (ctx, next) {
      promise(ctx)
      state(ctx)
      await next()
      ctx.end(ctx.state)
    }
  })
}
