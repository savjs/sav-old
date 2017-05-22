import {Container, PageContainer, LayoutContainer, ApiContainer} from './container.js'
import {Schema} from './schema.js'
import {registerNames, shortToLong, longToShort, arrayToObject, objectToArray} from './util'

export class Graph {
  constructor (opts = {}, props = {}) {
    this.setParent = this.setParent.bind(this)
    let setProp = this.setProp = this.setProp.bind(this)
    setProp(this, 'root', this)
    setProp(this, 'opts', opts)
    setProp(this, 'uris', {})
    setProp(this, 'uri', props.uri || opts.uri || 'app')
    this.schema = new Schema(this, props.schema)
    this[ApiContainer] = new Container(this, ApiContainer, props.api)
    this[LayoutContainer] = new Container(this, LayoutContainer, props.layout)
    this[PageContainer] = new Container(this, PageContainer, props.page)
  }
  addUri (uri, target) {
    this.uris[uri] = target
  }
  readProps (props) {
    let ret = props
    if (this.opts.fromShort) {
      ret = shortToLong(props)
    }
    if (this.opts.fromArray) {
      ret = arrayToObject(ret)
    }
    return ret
  }
  writeModal (ret) {
    if (this.opts.toShort) {
      ret = longToShort(ret)
    }
    if (this.opts.toArray) {
      ret = objectToArray(ret)
    }
    return ret
  }
  writeRoute (ret) {
    if (this.opts.toShort) {
      ret = longToShort(ret)
    }
    if (this.opts.toArray) {
      ret = objectToArray(ret)
    }
    return ret
  }
  setParent (target, parent, name) {
    let {setProp} = this
    setProp(target, 'parent', parent)
    setProp(target, 'root', this)
    if (name) {
      let uri = `${parent.uri}.${name}`
      setProp(target, 'uri', uri)
      setProp(target, 'name', name)
      this.addUri(uri, target)
    }
  }
  setProp (target, key, value) {
    Object.defineProperty(target, key, {value, writable: true, configurable: true})
  }
}

registerNames([
  'method',
  'path',
  'request',
  'response',
  'get',
  'post',
  'delete',
  'vue',
  'component',
  'keywords',
  'description',
  'title',
  'layout',
  'meta'
])
