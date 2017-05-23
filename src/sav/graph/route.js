import {convertFunctionToName} from './util.js'

export class Route {
  constructor (parent, name, props) {
    let root = parent.root
    root.setParent(this, parent, name)
    Object.assign(this, convertFunctionToName(root.readProps(props)))
  }
  toJSON () {
    return this.root.writeRoute(this)
  }
}
