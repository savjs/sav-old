import {ajax, bindEvent, compose} from 'sav-util'

export class Request {
  constructor (sav) {
    this.opts = {
      baseUrl: '/',
      stripHeaders: true, // 不返回头部信息
      ajax
    }
    sav.shareOptions(this)
    this.invokeQueues = [this.invoke.bind(this)]
    this.invoker = null
    bindEvent(this)
  }
  setOptions (opts) {
    assign(this.opts, opts)
  }
  before (fn) {
    this.invoker = null
    this.invokeQueues.unshift(fn)
  }
  after (fn) {
    this.invoker = null
    this.invokeQueues.push(fn)
  }
  get (url, options) {
    return this.request(assign({method: 'GET', url}, options))
  }
  post (url, options) {
    return this.request(assign({method: 'POST', url}, options))
  }
  put (url, options) {
    return this.request(assign({method: 'PUT', url}, options))
  }
  patch (url, options) {
    return this.request(assign({method: 'PATCH', url}, options))
  }
  del (url, options) {
    return this.request(assign({method: 'DELETE', url}, options))
  }
  request (options) {
    options = assign({
      url: '',
      dataType: 'JSON',
      headers: {
        Accept: 'application/json'
      }
    }, options)
    let {stripHeaders, baseUrl} = this.opts
    if ('stripHeaders' in options) {
      stripHeaders = options.stripHeaders
    }
    if (!/^(http(s?):)?\/\//i.test(options.url)) {
      options.url = baseUrl + options.url.replace(/^\//, '')
    }
    if (!this.invoker) {
      this.invoker = compose(this.invokeQueues)
    }
    let {invoker} = this
    let ctx = {request: options}
    let res = invoker(ctx).then(() => stripHeaders ? ctx.response.data : ctx.response)
    return res
  }
  invoke (ctx, next) {
    return new Promise((resolve, reject) => {
      ctx.xhr = ajax(ctx.request, (err, data, headers) => {
        if (err) {
          return reject(err)
        }
        try {
          ctx.response = {
            data,
            headers
          }
          this.emit('response', ctx)
        } catch (err) {
          return reject(err)
        }
        resolve()
      })
      this.emit('request', ctx)
    }).then(next)
  }
}

function assign (target, opts) {
  return Object.assign(target, opts)
}
