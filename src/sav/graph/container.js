import {Modal} from './modal.js'

export const PageContainer = 'page'
export const LayoutContainer = 'layout'
export const ApiContainer = 'api'

export class Container {
  constructor (parent, name, props) {
    let root = parent.root
    root.setParent(this, parent, name)
    for (let name in props) {
      this.modal(name, props[name])
    }
  }
  get isPage () {
    return this.uri === PageContainer
  }
  get isLayout () {
    return this.uri === LayoutContainer
  }
  get isApi () {
    return this.uri === ApiContainer
  }
  modal (name, props) {
    if (this[name]) {
      return this[name]
    }
    let ret = this[name] = new Modal(this, name, props)
    return ret
  }
}
