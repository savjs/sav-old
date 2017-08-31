import {STATUS_CODES} from 'http'

export class HttpError extends Error {
  constructor (code, message) {
    super(message || STATUS_CODES[code])
    this.code = code
  }
}
