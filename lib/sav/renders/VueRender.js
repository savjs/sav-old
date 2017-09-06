import {readFileSync} from 'fs'
import {resolve} from 'path'
import {isFunction, isString} from 'sav-util'

export class VueRender {
  constructor (sav) {
    this.opts = {
      serverTemplate: './views/index.html',
      serverEntry: './server-entry.js'
    }
    sav.shareOptions(this)
    this.require = require
    this.invokePayloads = null
  }
  async render ({ctx, argv, sav}, {route, payloads}) {
    let {vm, render, router} = this.ssr
    let newState
    if (payloads.length) {
      newState = await this.invokePayloads(sav, ctx, route, router, payloads)
    }
    vm.$root.$state = Object.assign(argv.state, newState)
    router.push(route)
    return new Promise((resolve, reject) => {
      render.renderToString(vm, (err, html) => {
        if (err) {
          return reject(err)
        }
        html = html.replace('data-server-rendered="true"', '')
        ctx.body = html
        resolve()
      })
    })
  }
  match ({ctx, argv}) {
    if (ctx.method !== 'GET') {
      return false
    }
    let {router, Vue, deepth} = this.getRender()
    let route = router.resolve(argv.path).route
    if (!route.matched.length) {
      return false
    }
    // 需要复制一份, 因为path不可写, 估计是被Vue冻结了
    route = Object.assign({}, route)
    let components = router.getMatchedComponents(route)
    let arr = []
    getComponentsDepth(Vue, components, deepth || 2, arr)
    let ret = {
      route,
      payloads: []
    }
    arr.reduce(processComponent, ret)
    return ret
  }
  getRender () {
    if (!this.ssr) {
      let {opts} = this
      let entryFile = resolve(opts.rootPath, opts.serverEntry)
      let {Vue, vm, router, createRenderer, renderOptions, deepth} = this.serverEntry ||
        (this.serverEntry = this.require(entryFile))
      let template = this.serverTemplate ||
        (this.serverTemplate = readFileSync(resolve(opts.rootPath, opts.serverTemplate)).toString())
      let render = createRenderer(Object.assign({template}, renderOptions))
      this.ssr = {
        router,
        render,
        vm,
        Vue,
        deepth
      }
    }
    return this.ssr
  }
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

function processComponent (target, component) {
  let options = typeof component === 'object' ? component : component.options
  if (options.getters) {
    let computed = options.computed || (options.computed = {})
    Object.assign(computed, mapGetters(options))
    delete options.getters
  }
  // @TODO 删除相关方法
  if (options.payload) {
    target.payloads.push(options.payload)
  }
  return target
}

function mapGetters ({getters}) {
  let res = {}
  normalizeMap(getters).forEach(function (ref) {
    let key = ref.key
    let val = ref.val
    res[key] = isFunction(val) ? function mappedGetter () { // function(state){}
      return val.call(this, this.$root.$state)
    } : function mappedGetter () {
      return this.$root.$state[val]
    }
  })
  return res
}

function normalizeMap (map) {
  return Array.isArray(map) ? map.map(key => {
    return {
      key: key,
      val: key
    }
  }) : Object.keys(map).map(key => {
    return {
      key: key,
      val: map[key]
    }
  })
}
