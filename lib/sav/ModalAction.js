import {isFunction} from 'sav-util'

export class ModalAction {
  constructor (opts) {
    this.opts = {}
    this.setOptions(opts)
    this.modals = {}
    this.actions = {}
  }
  setOptions (opts) {
    Object.assign(this.opts, opts)
  }
  declare (modals) {
    for (let modalName in modals) {
      this.declareModal(modalName, modals[modalName])
    }
  }
  declareModal (modalName, modal) {
    this.removeModal(modalName)
    let actions = this.modals[modalName] = classToObject(modal)
    for (let actionName in actions) {
      this.actions[`${modalName}.${actionName}`] = actions[actionName]
    }
  }
  removeModal (modalName) {
    if (this.modals[modalName]) {
      delete this.modals[modalName]
      modalName = modalName + '.'
      for (let actionName in this.actions) {
        if (actionName.indexOf(modalName) === 0) {
          delete this.actions[actionName]
        }
      }
    }
  }
  getAction (actionName) {
    return this.actions[actionName]
  }
}

const skips = ['constructor']

function classToObject (target) {
  if (isFunction(target)) {
    let proto = target.prototype
    return Object.getOwnPropertyNames(proto).reduce((tar, it) => {
      if (!~skips.indexOf(it) && typeof isFunction(proto[it])) {
        tar[it] = proto[it]
      }
      return tar
    }, {})
  } else {
    return target
  }
}
