
export class Middleware {
  constructor (props, route) {
    this.middleware = null
    this.route = route
    Object.assign(this, props)
  }
  setMiddleware (middleware) {
    this.middleware = middleware
  }
  toJSON () {
    return this.route.module.writter.writeMiddleware(this)
  }
}
