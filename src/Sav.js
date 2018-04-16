import {Exception, HttpError} from './Exception.js'
import {testAssign, prop, compose, isFunction} from 'sav-util'
import {HtmlRender} from './renders/HtmlRender.js'
// import {VueRender} from './renders/VueRender.js'
import {Contract} from './Contract.js'

export class Sav {
  constructor (opts = {}) {
    this.opts = testAssign(opts, {
      rootPath: './',
      ssr: false,
      modals: null,
      prod: process.env.NODE_ENV === 'production'
    })
    this.htmlRender = new HtmlRender(this.opts)
    this.invokeQueues = [this.invoke]
    this.invoker = null
    this.load()
  }
  load (opts) {
    Object.assign(this.opts, opts)
    this.contract = new Contract(this.opts)
    this.modals = loadModals(this.opts.modals)
  }
  insert (fn) {
    this.invokeQueues.unshift(fn)
  }
  append (fn) {
    this.invokeQueues.push(fn)
  }
  compose () {
    return composeInvokes(this)
  }
  exec (ctx) {
    if (!this.invoker) {
      this.invoker = this.compose()
    }
    return this.invoker(ctx)
  }
  prepare ({ctx, argv, sav}) {
    let path = ctx.path || ctx.originalUrl
    let data = Object.assign({}, ctx.query, ctx.request && ctx.request.body)
    let {route, input} = Object.assign(argv, sav.contract.matchRoute(
      path, ctx.method.toUpperCase(), data    
    ))
    sav.contract.checkInput(route, input)
    argv.isView = isClientView(route)
    let modal = sav.modals[route.modal.name]
    argv.invoker = modal ? modal[route.opts.name] : null
  }
  async invoke ({ctx, argv, sav}, next) {
    let {route} = argv
    argv.output = await argv.invoker.call(sav, ctx, argv)
    sav.contract.checkOutput(route, argv.output)
    return next()
  }
  render ({ctx, argv, sav}) {
    argv.state = argv.error ? {error: argv.error} : argv.output
    if (argv.view) {
      if (sav.opts.ssr) {
        let mat = sav.vueRender.match(ctx)
        if (mat) {
          return sav.vueRender.render(ctx, mat)
        }
      }
      return sav.htmlRender.render(ctx)
    }
    if (argv.error) {
      if (argv.error.status) {
        ctx.status = argv.error.status
      }
    } else {
      ctx.status = 200
    }
    ctx.body = argv.state
  }
}

function stripError (error, sav) {
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
  if (sav.opts.prod) {
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

function isClientView (route) {
  if (route.modal.opts.view) {
    return route.opts.view || (route.opts.view !== false)
  }
  return !!route.opts.view
}

function composeInvokes (sav) {
  let queues = compose(sav.invokeQueues)
  return (ctx, next) => {
    Object.assign(ctx, {ctx, sav,
      schema: sav.contract.schema,
      router: sav.contract.router,
      Exception, HttpError, argv: {}})
    return new Promise((resolve, reject) => {
      sav.prepare(ctx)
      return queues(ctx, () => {
        return sav.render(ctx)
      }).then(resolve).catch(reject)
    }).catch((err) => {
      ctx.argv.error = stripError(err, sav)
      return sav.render(ctx)
    })
  }
}

function loadModals (modals) {
  if (!modals) {
    return {}
  }
  return Object.keys(modals).reduce((ret, name) => {
    ret[name] = classToObject(modals[name])
    return ret
  }, {})
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
