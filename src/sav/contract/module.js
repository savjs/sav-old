import {Route} from './route.js'
import {objectAssign} from '../util'
import {SavRoute} from './SavRoute.js'

export class Module {
  constructor (props, writter) {
    this.routes = []
    this.props = {}
    this.writter = writter
    this.uris = {}
    objectAssign(this, props, ['uri', 'routes', 'savRoute'])
    this.savRoute = new SavRoute(this)
    if (props.routes) {
      this.routes = props.routes.map(this.appendRoute.bind(this))
    }
  }
  appendRoute (props) {
    let route = new Route(props, this)
    this.routes.push(route)
    this.uris[route.uri] = route
    this.savRoute.resolveRoute(route)
    return route
  }
  get uri () {
    return this.moduleName + this.moduleGroup
  }
  toJSON () {
    return this.writter.writeModal(this)
  }
}
