import {isFunction, testAssign} from 'sav-util'

export class ModalAction {
  constructor () {
    this.modals = {}
    this.actions = {}
  }
  declare (modals) {
    for (let modalName in modals) {
      this.declareModal(modalName, modals[modalName])
    }
  }
  declareModal (modalName, modal) {
    let actions = this.modals[modalName] = classToObject(modal)
    for (let actionName in actions) {
      this.actions[`${modalName}.${actionName}`] = actions[actionName]
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
