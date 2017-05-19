import {Middleware} from './middleware.js'
import {objectAssign} from '../util'

export class Route {
  constructor (props, module) {
    this.middlewares = []
    this.props = {}
    this.module = module
    objectAssign(this, props, ['uri', 'middlewares'])
    if (props.middlewares) {
      this.middlewares = props.middlewares.map((props) => {
        let mid = new Middleware(props, this)
        toProps(this, mid)
        return mid
      })
    }
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
  get uri () {
    return this.module.uri + '.' + this.actionName
  }
  toJSON () {
    return this.module.writter.writeRoute(this)
  }
}

function toProps ({props}, middleware) {
  props[middleware.name] = middleware
}
