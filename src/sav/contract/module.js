import {Route} from './route.js'

export class Module {
  constructor (props, writter) {
    this.routes = []
    this.props = {}
    this.writter = writter
    this.uris = {}
    Object.assign(this, props)
    this.routes = this.routes.map(this.appendRoute.bind(this))
  }
  appendRoute (props) {
    let route = new Route(props, this)
    this.routes.push(route)
    this.uris[route.uri] = route
    return route
  }
  toJSON () {
    return this.writter.writeModal(this)
  }
}
