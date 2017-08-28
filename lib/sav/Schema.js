import {Schema as SavSchema} from 'sav-schema'
import {isString, isObject, pascalCase} from 'sav-util'

export class Schema {
  constructor (opts) {
    this.opts = {
      schemaReqField: 'request',
      schemaResField: 'response',
      schemaReqPrefix: 'Req',
      schemaResPrefix: 'Res'
    }
    opts && this.setOptions(opts)
    this.savSchema = new SavSchema()
    this.schemas = {}
  }
  setRouter (router) {
    router.on('declareAction', declareActionSchema.bind(this))
  }
  setOptions (opts) {
    Object.assign(this.opts, opts)
  }
  declare (schemas) {
    for (let schemaName in schemas) {
      this.schemas[schemaName] = this.savSchema.declare(schemas[schemaName])
    }
  }
  getSchema (schemaName) {
    return this.schemas[schemaName]
  }
}

function declareActionSchema (actionRoute) {
  if (actionRoute.action) {
    extractSchema(actionRoute, this)
    extractSchema(actionRoute, this, true)
  }
}

function extractSchema (actionRoute, schema, isResponse) {
  let fieldName = isResponse ? schema.opts.schemaResField : schema.opts.schemaReqField
  let structPrefix = isResponse ? schema.opts.schemaResPrefix : schema.opts.schemaReqPrefix
  let value = actionRoute.action[fieldName]
  let structName = pascalCase((structPrefix + '_' + actionRoute.name).replace(/\./g, '_'))
  if (isString(value)) {
    structName = value
  } else if (isObject(value)) {
    if (value.name) {
      structName = value.name
    }
    let {schemas, savSchema} = schema
    schemas[structName] = savSchema.declare(value)
  }
  actionRoute[isResponse ? 'response' : 'request'] = structName
}
