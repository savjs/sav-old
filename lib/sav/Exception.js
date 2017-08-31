import {STATUS_CODES} from 'http'

let proto = Error.prototype

proto.toJSON = function () {
  return Object.assign({
    message: this.message,
    type: this.constructor.name,
    stack: this.stack
  }, this)
}

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
