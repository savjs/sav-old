import SavSchema from 'sav-schema'
import {quickConf} from 'sav-decorator'

export const req = quickConf('req')
export const res = quickConf('res')

let schemaMethods = ['req', 'res']

export function schemaPlugin (ctx) {
  let schema = ctx.config('schema') || SavSchema
  ctx.use({
    middleware ({name, args}, {ctx, module, action, middlewares}) {
      if (schemaMethods.indexOf(name) === -1) {
        return
      }
      let schemaStruct
      let getSchemaStruct = () => {
        if (schemaStruct || (schemaStruct === null)) {
          return schemaStruct
        }
        let moduleName = module.name
        let actionName = action.name
        let schemaData = args[0]
        if (typeof schemaData === 'object') {
          schemaStruct = schema.declare(schemaData)
        } else {
          if (!schemaData) {
            schemaData = ucfirst(name) + ucfirst(moduleName) + ucfirst(actionName)
          }
          schemaStruct = schema[schemaData]
        }
        if (!schemaStruct) {
          schemaStruct = null
        }
        return schemaStruct
      }
      if (!getSchemaStruct()) {
        // @TODO warn is lazying?
        schemaStruct = undefined
      }
      middlewares.push(async (ctx) => {
        let struct = getSchemaStruct()
        if (struct) {
          if (name === 'req') {
            let argv = {
              ...ctx.query,
              ...(ctx.request && ctx.request.body),
              ...ctx.params
            }
            ctx.input = await struct.extractThen(argv)
          } else if (name === 'res') {
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
  })
}

function ucfirst (str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
