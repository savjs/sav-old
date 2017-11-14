import {isString} from 'sav-util'

export class VuePayload {
  constructor (opts) {
    this.opts = {
      deepth: 2,
      Vue: null,
      router: null
    }
    this.process = null
    this.processComponent = processComponent.bind(this)
    Object.assign(this.opts, opts)
  }
  setOptions (opts) {
    Object.assign(this.opts, opts)
  }
  getPayloads (route) {
    let {router, Vue} = this.opts
    let components = router.getMatchedComponents(route)
    let arr = []
    getComponentsDepth(Vue, components, this.opts.deepth, arr)
    let payloads = []
    arr.reduce(this.processComponent, payloads)
    return payloads
  }
}

function processComponent (payloads, component) {
  let options = typeof component === 'object' ? component : component.options
  if (this.process) {
    this.process(options)
  }
  if (options.payload) {
    payloads.push(options.payload)
  }
  return payloads
}

function getComponentsDepth (Vue, components, depth, arr) {
  if (Array.isArray(components)) {
    for (let i = 0; i < components.length; ++i) {
      appendComponent(Vue, components[i], depth, arr)
    }
  } else {
    for (let comName in components) {
      appendComponent(Vue, components[comName], depth, arr)
    }
  }
}

function appendComponent (Vue, com, depth, arr) {
  if (isString(com)) {
    com = Vue.component(com)
  }
  if (com) {
    arr.push(com)
    if (depth && com.components) {
      getComponentsDepth(Vue, com.components, depth--, arr)
    }
  }
}
