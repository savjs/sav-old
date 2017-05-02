import SavSchema from 'sav-schema'
import {isObject, ucfirst} from '../util'

let schemaMethods = ['req', 'res']

export function schemaPlugin (sav) {
  let schema = sav.config.get('schema') || SavSchema
  sav.use({
    action (action) {
      let {props} = action
      let schemaCtx = {action, schema, sav}
      for (let type of schemaMethods) {
        if (props[type]) {
          createSchemaMiddleware(type, props[type], schemaCtx)
        }
      }
    }
  })
}

function createSchemaMiddleware (type, args, {action, schema}) {
  let struct
  let getSchemaStruct = () => {
    if (struct || (struct === null)) {
      return struct
    }
    let schemaData = args[0]
    if (isObject(schemaData)) {
      struct = schema.declare(schemaData)
    } else {
      if (!schemaData) {
        schemaData = ucfirst(type) + ucfirst(action.module.moduleName) + ucfirst(action.actionName)
      }
      struct = schema[schemaData]
    }
    if (!struct) {
      struct = null
    }
    return struct
  }
  if (!getSchemaStruct()) {
    struct = undefined
  }
  action.set(type, async (ctx) => {
    let struct = getSchemaStruct()
    if (struct) {
      if (type === 'req') {
        let argv = {
          ...ctx.query,
          ...(ctx.request && ctx.request.body),
          ...ctx.params
        }
        ctx.input = await struct.extractThen(argv)
      } else if (type === 'res') {
        let data = ctx.data
        if (isObject(data)) {
          data = await struct.extractThen(data)
          ctx.end(data)
        }
      }
    }
  })
}
