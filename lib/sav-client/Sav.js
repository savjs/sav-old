import {Router} from '../sav/Router.js'
import {Schema} from '../sav/Schema.js'
import {ModalAction} from '../sav/ModalAction.js'
import {Request} from './Request.js'

export class Sav {
  constructor (opts) {
    this.opts = {
      name: 'sav'
    }
    this.shareOptions(this.router = new Router())
    this.shareOptions(this.modalAction = new ModalAction())
    this.shareOptions(this.schema = new Schema())
    this.shareOptions(this.request = new Request())
    this.schema.setRouter(this.router)
    Object.assign(this.opts, opts)
    this.actions = {}
    this.router.on('declareAction', (route) => {
      if (route.actionName) {
        let name = route.name
        this.actions[name] = route
      }
    })
  }
  get name () {
    return this.opts.name
  }
  setOptions (opts) {
    Object.assign(this.opts, opts)
  }
  shareOptions (target) {
    target.opts = Object.assign(this.opts, target.opts)
  }
  declare ({actions, schemas, modals}) {
    if (schemas) {
      this.schema.declare(schemas)
    }
    if (modals) {
      this.router.declare(modals)
    }
    if (actions) {
      this.modalAction.declare(actions)
    }
  }
  fetch (args) {
    return this.request.request(args)
  }
}
