import EventEmitter from 'events'
import {Router} from './Router.js'
import {Modal} from './Modal.js'
import {Schema} from './Schema.js'

export class Sav extends EventEmitter {
  constructor (opts) {
    super()
    this.opts = Object.assign({

    }, opts)
    this.shareOptions(this.router = new Router())
    this.shareOptions(this.modal = new Modal())
    this.shareOptions(this.schema = new Schema())
    this.schema.setRouter(this.router)
  }
  setOptions (opts) {
    Object.assign(this.opts, opts)
  }
  shareOptions (target) {
    target.opts = Object.assign(this.opts, target.opts)
  }
  declare ({contract: {actions, schemas}, modals}) {
    if (schemas) {
      this.schema.declare(schemas)
    }
    if (actions) {
      this.router.declare(actions)
    }
    if (modals) {
      this.modal.declare(modals)
    }
  }
}
