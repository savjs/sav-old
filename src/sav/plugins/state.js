// State中间件

export function statePlugin (sav) {
  sav.use({
    setup ({prop}) {
      let state = {}
      prop.getter('state', () => state)
      prop({
        setState (...args) {
          let len = args.length
          if (len < 1) {
            return
          } else if (len === 1) {
            if (Array.isArray(args[0])) { // for Promise.all
              args = args[0]
            }
          }
          args.unshift(state)
          Object.assign.apply(state, args)
        },
        replaceState (newState) {
          state = newState || {}
        }
      })
    }
  })
}
