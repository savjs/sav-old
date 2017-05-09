import {only} from '../util/helper.js'
import {Modal} from './modal.js'

export class Contract {
  constructor (props, filter) {
    this.modals = [
      'modalName', 'modalGroup', 'uri', 'props', 'routes',
      'SavRoute', 'VueRoute'
    ]
    this.routes = ['actionName', 'uri', 'middlewares']
    this.middlewares = ['name', 'props']
    Object.assign(this, filter ? filter(this, props) : props)
  }
  createModal (props) {
    return new Modal(props, this)
  }
  writeModal (modal) {
    return only(modal, this.modals)
  }
  writeRoute (route) {
    return only(route, this.routes)
  }
  writeMiddleware (middleware) {
    return only(middleware, this.middlewares)
  }
}
