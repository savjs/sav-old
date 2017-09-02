import {STATUS_CODES} from 'http'

export class Exception extends Error {
  constructor (message) {
    if (message instanceof Error) {
      super(message.message)
      this.stacks = (message.stacks && message.stacks.slice()) || []
      this.stacks.push(message)
      delete message.stacks
    } else {
      super(message)
      this.stacks = []
    }
  }
}

export class HttpError extends Exception {
  constructor (status, message) {
    super(message || STATUS_CODES[status])
    this.status = status
  }
}
