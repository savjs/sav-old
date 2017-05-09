
export class Middleware {
  constructor (props, route) {
    this.middleware = null
    this.route = route
    Object.assign(this, props)
  }
  toJSON () {
    return this.route.modal.writter.writeMiddleware(this)
  }
}
