import {readFileSync} from 'fs'
import {resolve} from 'path'
import {isFunction, isObject} from 'sav-util'
import {VuePayload} from '../VuePayload.js'

export class VueRender {
  constructor (sav) {
    this.opts = {
      rootPath: '.',
      serverTemplate: './views/index.html',
      serverEntry: './server-entry.js'
    }
    sav.shareOptions(this)
    this.require = require
    let payload = this.payload = new VuePayload()
    payload.process = processComponent
    sav.shareOptions(payload)
  }
  async render ({ctx, argv, sav}, {route, payloads}) {
    let {vm, render, router} = this.ssr
    let newState
    if (payloads.length) {
      newState = await invokePayloads(sav, ctx, route, payloads)
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
    let {router} = this.getRender()
    let route = router.resolve(argv.path).route
    if (!route.matched.length) {
      return false
    }
    // 需要复制一份, 因为path不可写, 估计是被Vue冻结了
    route = Object.assign({}, route)
    let payloads = this.payload.getPayloads(route)
    return {
      route,
      payloads
    }
  }
  getRender () {
    if (!this.ssr) {
      let {opts} = this
      let entryFile = resolve(opts.rootPath, opts.serverEntry)
      if (!this.serverEntry) {
        this.serverEntry = this.require(entryFile)
      }
      let {Vue, vm, router, createRenderer, renderOptions} = this.serverEntry
      if (!this.serverTemplate) {
        this.serverTemplate = readFileSync(resolve(opts.rootPath, opts.serverTemplate)).toString()
      }
      let template = this.serverTemplate
      let render = createRenderer(Object.assign({template}, renderOptions))
      this.payload.setOptions({
        Vue,
        router
      })
      this.ssr = {router, render, vm, Vue}
    }
    return this.ssr
  }
}

function processComponent (options) {
  if (!options._savStriped) {
    if (options.getters) {
      let computed = options.computed || (options.computed = {})
      Object.assign(computed, mapGetters(options))
      delete options.getters
    }
    delete options.beforeCreate
    delete options.created
    delete options.beforeMount
    delete options.mounted
    delete options.beforeUpdate
    delete options.updated
    delete options.activated
    delete options.deactivated
    delete options.beforeDestroy
    delete options.destroyed

    delete options.watch

    delete options.beforeRouteEnter
    delete options.beforeRouteUpdate
    delete options.beforeRouteLeave
    options._savStriped = true
  }
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

function invokePayloads (sav, ctx, vueRoute, payloads) {
  let states = []
  let routes = payloads.filter((it) => {
    if (isObject(it)) {
      if (it.sav) {
        if (it.sav !== sav.name) { // 跨sav的情况
          return false
        }
      }
      if (sav.resolvePayload(it, vueRoute)) {
        if (it.state) {
          states.push(it.state)
          return false
        }
        // 只处理GET请求
        if (it.route.method !== 'GET') {
          return false
        }
        // 跳过当前路由
        return it.path !== vueRoute.path
      }
    }
  })
  return Promise.all(routes.map((route) => sav.invokePayload(ctx, route)))
    .then((args) => {
      args = states.concat(args)
      return args.length ? Object.assign.apply({}, args) : {}
    })
}
