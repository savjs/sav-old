import {SavBase} from '../sav/SavBase.js'
import {Request} from './Request.js'
import {prop} from 'sav-util'

export class Sav extends SavBase {
  init () {
    this.request = new Request(this)
  }
  inject (flux) {
    let isSav = this.name === 'sav'
    flux.declare({
      actions: Object.keys(this.actions).reduce((ret, action) => {
        action = this.actions[action]
        let actionName = action.method.toLowerCase() + (isSav ? '' : this.name) + action.name
        ret[actionName] = (flux, argv) => {
          return this.invoke(flux, argv || {}, action)
        }
        return ret
      }, {})
    })
  }
  invoke (flux, argv, action) {
    prop(argv, 'action', action)
    return this.invokePayload(argv).then(async data => {
      await flux.updateState(data)
    })
  }
  async invokePayload (argv) {
    // @TODO 接口缓存
    let {schema} = this
    let {action} = argv
    argv.url = action.compile(argv.params)
    let reqStruct = schema.getSchema(action.request)
    argv.input = Object.assign({}, argv.params, argv.query, argv.data)
    if (reqStruct) {
      try {
        reqStruct.check(argv.input)
      } catch (err) {
        err.status = 400
        throw err
      }
    }
    let output = await this.fetch(argv)
    let resStruct = schema.getSchema(action.response)
    if (resStruct) {
      resStruct.check(output)
    }
    argv.output = output
    return this.mapState(argv)
  }
  fetch (argv) {
    // @TODO 使用mock数据或mockServer获取
    return this.request.request(argv)
  }
  mapState (argv) {
    // @TODO 将state提取出来
    return argv.output
  }
}
