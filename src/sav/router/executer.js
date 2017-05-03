import {Exception} from '../core/exception'
import {isPromise, isFunction} from '../util'

export class ExecuterException extends Exception {
  constructor (message, step) {
    super(message)
    this.step = step
  }
}

export async function executeMiddlewares (queues, ctx) {
  for (let it of queues) {
    let {name, middleware} = it
    if (isFunction(middleware)) {
      try {
        // console.log('exec', name, ctx.path)
        let ret = middleware(ctx)
        if (isPromise(ret)) {
          ret = await ret
        }
      } catch (err) {
        throw new ExecuterException(err, name)
      }
    }
  }
}
