import {quickConf} from '../decorator'
import SavSchema from 'sav-schema'

export const req = quickConf('req')
export const res = quickConf('res')
export const hreq = quickConf('hreq')
export const hres = quickConf('hres')

let schemaMethods = ['req', 'res', 'hreq', 'hres']

export function schemaPlugin (ref) {
  let schema = ref.config('schema') || SavSchema
  ref.use({
    action (action) {
      let {props} = action
      let schemaCtx = {action, schema, ref}
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
    if (typeof schemaData === 'object') {
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
    // @TODO warn is lazying?
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
        let state = await struct.extractThen(ctx.state)
        if (ctx.setState) {
          ctx.setState(state)
        } else {
          ctx.state = state
        }
      }
    }
  })
}

function ucfirst (str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
