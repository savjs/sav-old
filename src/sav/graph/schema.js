import {isObject} from '../util'

export class Schema {
  constructor (parent, props) {
    let root = parent.root
    root.setParent(this, parent, 'schema')
    if (props) {
      this.declare(props)
    }
  }
  declare (name, props) {
    if (Array.isArray(name)) {
      name.forEach((props) => {
        this.add(props.name, props)
      })
      return this
    } else if (typeof name === 'string') {
      this.add(name, props)
      return this
    }
    if (isObject(name) && name.name) {
      this.add(name.name, name)
      return this
    }
    for (let it in name) {
      this.add(it, name[it])
    }
    return this
  }
  add (name, value) {
    if (name === 'default') {
      return
    }
    this[name] = value
    this.root.addUri(`${this.uri}.${name}`, value)
  }
}
