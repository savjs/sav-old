import {Middleware} from './middleware.js'

export class Route {
  constructor (props, modal) {
    this.middlewares = []
    this.props = {}
    this.modal = modal
    Object.assign(this, props)
    this.middlewares.map((props) => {
      let mid = new Middleware(props, this)
      setProps(this, mid)
      return mid
    })
  }
  prependMiddleware (props) {
    let mid = new Middleware(props, this)
    this.middlewares.unshift(mid)
    setProps(this, mid)
    return mid
  }
  appendMiddleware (props) {
    let mid = new Middleware(props, this)
    this.middlewares.push(mid)
    setProps(this, mid)
    return mid
  }
  toJSON () {
    return this.modal.writter.writeRoute(this)
  }
}

function setProps ({props}, middleware) {
  props[middleware.name] = middleware
}
