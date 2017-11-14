import {Router} from './Router.js'
import {ModalAction} from './ModalAction.js'
import {Schema} from './Schema.js'
import {HttpError} from './Exception.js'
import {bindEvent, prop} from 'sav-util'

export class SavBase {
  constructor (opts) {
    bindEvent(this)
    this.opts = {
      name: 'sav',
      prod: true
    }
    this.shareOptions(this.router = new Router())
    this.shareOptions(this.modalAction = new ModalAction())
    this.shareOptions(this.schema = new Schema())
    this.schema.setRouter(this.router)
    this.actions = {}
    this.router.on('declareAction', (route) => {
      if (route.actionName) {
        let name = route.name
        this.actions[name] = route
      }
    })
    this.init()
    this.setOptions(opts)
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
  resolve (route) {
    let action = this.actions[route.name]
    if (action) {
      route.path = action.compile(route.params)
      prop(route, 'action', action)
      prop(route, 'savHandle', this)
      return route
    }
  }
  stripError (error) {
    let err
    if (error instanceof Error) {
      err = Object.assign({
        message: error.message,
        type: error.constructor.name,
        stack: error.stack
      }, error)
    } else if (typeof err !== 'object') {
      return error
    }
    if (this.opts.prod) {
      delete err.step
      delete err.stack
      delete err.stacks
    }
    if (!err.status) {
      if (!(error instanceof HttpError)) {
        err.status = 500
      }
    }
    return err
  }
}