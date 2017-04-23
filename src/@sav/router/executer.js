import {Exception, isPromise, isFunction} from '@sav/util'

export class ExecuterException extends Exception {
  constructor (message, step) {
    super(message)
    this.step = step
  }
}

export async function executeMiddlewares (queues, ctx) {
  for (let it of queues) {
    let {name, middleware} = it
    if (isFunction(it)) {
      middleware = it
    }
    if (isFunction(middleware)) {
      try {
        let ret = middleware(ctx)
        if (ret && isPromise(ret)) {
          ret = await ret
        }
      } catch (err) {
        throw new ExecuterException(err, name)
      }
    }
  }
  return ctx
}
