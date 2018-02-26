import {Schema as SavSchema} from 'sav-schema'
import {isString, isObject, isArray, pascalCase} from 'sav-util'

export class Schema {
  constructor (opts) {
    this.opts = {
      schemaReqField: 'request',
      schemaResField: 'response',
      schemaReqPrefix: 'Req',
      schemaResPrefix: 'Res'
    }
    opts && this.setOptions(opts)
    this.schema = new SavSchema()
  }
  setRouter (router) {
    router.on('declareAction', declareActionSchema.bind(this))
  }
  setOptions (opts) {
    Object.assign(this.opts, opts)
  }
  declare (schemas) {
    if (isObject(schemas)) {
      for (let schemaName in schemas) {
        let schemaData = schemas[schemaName]
        schemaData.name = schemaName
        this.schema.declare(schemaData)
      }
    } else if (isArray(schemas)) {
      schemas.forEach(it => {
        this.schema.declare(it)
      })
    }
  }
  getSchema (schemaName) {
    return this.schema[schemaName]
  }
  get proxy () {
    let schema = new Proxy(this, {
      get (target, name) {
        return target.getSchema(name)
      }
    })
    return schema
  }
}

function declareActionSchema (actionRoute) {
  if (actionRoute.action) {
    extractSchema(actionRoute, this)
    extractSchema(actionRoute, this, true)
  }
}

function extractSchema (actionRoute, handler, isResponse) {
  let fieldName = isResponse ? handler.opts.schemaResField : handler.opts.schemaReqField
  let structPrefix = isResponse ? handler.opts.schemaResPrefix : handler.opts.schemaReqPrefix
  let value = actionRoute.action[fieldName]
  let structName = pascalCase((structPrefix + '_' + actionRoute.name).replace(/\./g, '_'))
  if (isString(value)) {
    structName = value
  } else if (isObject(value)) {
    if (value.name) {
      structName = value.name
    } else {
      value.name = structName
    }
    let {schema} = handler
    schema.declare(value)
  }
  actionRoute[isResponse ? 'response' : 'request'] = structName
}
