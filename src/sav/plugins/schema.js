import SavSchema from 'sav-schema'
import {isObject, pascalCase} from '../util'

let schemaMethods = ['req', 'res']

export function schemaPlugin (sav) {
  let schema = sav.config.get('schema') || SavSchema
  sav.use({
    async payload ({prop}, next) {
      prop('schema', schema)
      await next()
    },
    route (route) {
      let {props} = route
      for (let type of schemaMethods) {
        if (props[type]) {
          createSchemaMiddleware(props[type], route.uri, schema)
        }
      }
    }
  })
}

function createSchemaMiddleware (route, uri, schema) {
  let {name, props} = route
  let struct
  let getSchemaStruct = () => {
    if (struct || (struct === null)) {
      return struct
    }
    let schemaData = props
    if (isObject(schemaData)) {
      struct = schema.declare(schemaData)
    } else {
      if (schemaData === null) {
        schemaData = pascalCase(`${name}_${uri}`.replace('.', '_'))
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
  route.setMiddleware(async (ctx) => {
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
        // console.log('res', struct.extractThen(ctx.state))
        ctx.setState(await struct.extractThen(ctx.state))
      }
    }
  })
}
