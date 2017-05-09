import {Route} from './route.js'

export class Module {
  constructor (props, writter) {
    this.routes = []
    this.props = {}
    this.writter = writter
    Object.assign(this, props)
    this.routes = this.routes.map((props) => new Route(props, this))
  }
  appendRoute (props) {
    let route = new Route(props, this)
    this.routes.push(route)
    return route
  }
  toJSON () {
    return this.writter.writeModal(this)
  }
}
