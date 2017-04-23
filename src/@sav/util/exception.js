Error.prototype.toJSON = function () {
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
      this.stacks = message.stacks || [message]
      delete message.stacks
    } else {
      super(message)
      this.stacks = []
    }
  }
}
