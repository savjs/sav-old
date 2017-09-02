// Promise中间件

export function promisePlugin (sav) {
  sav.use({
    name: 'promise',
    setup ({prop}) {
      prop(promise)
    }
  })
}

let PROMISE = Promise
let promise = {
  resolve: PROMISE.resolve.bind(PROMISE),
  reject: PROMISE.reject.bind(PROMISE),
  all: PROMISE.all.bind(PROMISE)
}

export {promise}
