import {Exception, isPromise, isFunction} from '@sav/util'

export class ExecuterException extends Exception {
  constructor (message, step) {
    super(message)
    this.step = step
  }
}

async function getReturnValue (ret) {
  if (ret && isPromise(ret)) {
    ret = await ret
  }
  return ret
}

export async function executeQueue (queues, ctx, payload = {}) {
  for (let it of queues) {
    let {name, middleware} = it
    if (isFunction(it)) {
      middleware = it
    }
    if (isFunction(middleware)) {
      try {
        let ret = await getReturnValue(middleware(ctx, payload))
        if (ret !== undefined) {
          payload.input = ret
        }
        payload[name] = ret
      } catch (err) {
        throw new ExecuterException(err, name)
      }
    }
  }
  return payload
}
