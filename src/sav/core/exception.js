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

// 功能尚未实现
export class NotImplementedException extends Exception {}

// 没有匹配到路由
export class NotRoutedException extends Exception {}

// 参数错误
export class InvalidaArgumentException extends Exception {}

// 调用错误
export class EnsureException extends Exception {}

export function ensure (value, message) {
  if (!value) {
    throw new EnsureException(message)
  }
}
