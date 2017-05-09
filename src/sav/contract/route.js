import {Middleware} from './middleware.js'

export class Route {
  constructor (props, module) {
    this.middlewares = []
    this.props = {}
    this.module = module
    Object.assign(this, props)
    this.middlewares = this.middlewares.map((props) => {
      let mid = new Middleware(props, this)
      toProps(this, mid)
      return mid
    })
  }
  prependMiddleware (props) {
    let mid = new Middleware(props, this)
    this.middlewares.unshift(mid)
    toProps(this, mid)
    return mid
  }
  appendMiddleware (props) {
    let mid = new Middleware(props, this)
    this.middlewares.push(mid)
    toProps(this, mid)
    return mid
  }
  toJSON () {
    return this.module.writter.writeRoute(this)
  }
}

function toProps ({props}, middleware) {
  props[middleware.name] = middleware
}
