import {promise as initPromise} from './promise'

export function state (ctx) {
  if (!ctx.resolve) {
    initPromise(ctx)
  }
  let {prop} = ctx
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
