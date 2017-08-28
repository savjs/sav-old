import {isFunction} from 'sav-util'

export class Modal {
  constructor (opts) {
    this.opts = {}
    this.setOptions(opts)
    this.modals = {}
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
    this.modals[modalName] = classToObject(modal)
  }
  removeModal (modalName) {
    if (this.modals[modalName]) {
      delete this.modals[modalName]
    }
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
