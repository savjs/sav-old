let PROMISE = Promise
let promise = {
  resolve: PROMISE.resolve.bind(PROMISE),
  reject: PROMISE.reject.bind(PROMISE),
  all: PROMISE.all.bind(PROMISE),
  then: (fn, reject) => {
    return new PROMISE(fn, reject)
  }
}

export {promise}

export function toPromise (target, methods) {
  let dist = Object.create(null)
  methods.forEach((name) => {
    dist[name] = (...args) => {
      return promise.then((resolve, reject) => {
        try {
          return resolve(target[name].apply(target, args))
        } catch (err) {
          return reject(err)
        }
      })
    }
  })
  return dist
}
