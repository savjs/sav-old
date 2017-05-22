export class Route {
  constructor (parent, name, props) {
    let root = parent.root
    root.setParent(this, parent, name)
    Object.assign(this, root.readProps(props))
  }
  toJSON () {
    return this.root.writeRoute(this)
  }
}
