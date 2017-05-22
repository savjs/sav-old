import {Route} from './route.js'
import {objectAssign} from './util'

export class Modal {
  constructor (parent, name, props) {
    let root = parent.root
    root.setParent(this, parent, name)
    objectAssign(this, root.readProps(props), ['routes'])
    this.routes = {}
    if (props) {
      let {routes} = props
      for (let name in routes) {
        this.route(name, routes[name])
      }
    }
  }
  route (name, props) {
    if (this[name]) {
      return this[name]
    }
    let route = this.routes[name] = new Route(this, name, props)
    return this
  }
  modal (name, props) {
    return this.parent.modal(name, props)
  }
  toJSON () {
    return this.root.writeModal(this)
  }
}
