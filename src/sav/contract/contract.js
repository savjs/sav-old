import {only} from '../util/helper.js'
import {Module} from './module.js'

export class Contract {
  constructor (props, filter) {
    this.modules = [
      'moduleName', 'moduleGroup', 'props', 'routes',
      'SavRoute', 'VueRoute'
    ]
    this.routes = ['actionName', 'middlewares']
    this.middlewares = ['name', 'props']
    Object.assign(this, filter ? filter(this, props) : props)
  }
  createModule (props) {
    return new Module(props, this)
  }
  writeModal (module) {
    return only(module, this.modules)
  }
  writeRoute (route) {
    return only(route, this.routes)
  }
  writeMiddleware (middleware) {
    return only(middleware, this.middlewares)
  }
}
