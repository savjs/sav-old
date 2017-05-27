// Schema中间件
import SavSchema from 'sav-schema'
import {isString, isObject, pascalCase} from '../util'

export function schemaPlugin (sav) {
  let schema = sav.config.get('schema') || SavSchema
  sav.use({
    name: 'schema',
    prepare (payload, next) {
      for (let name in payload.schema) {
        payload.schema[name].name = name
        schema.declare(payload.schema[name])
      }
      normalizeSchema(payload, schema)
      next(schema.ready())
    },
    setup ({prop, ctx}) {
      prop({
        schema,
        async checkRequest (uri) {
          let ref = ctx.uri(uri || ctx.route.uri)
          let struct = schema[ref.request]
          if (struct) {
            struct.check(ctx.inputData)
          }
        },
        async checkResponse (uri) {
          let ref = ctx.uri(uri || ctx.route.uri)
          let struct = schema[ref.response]
          let data = ctx.renderData || ctx.state
          if (struct) {
            struct.check(data)
          }
          ctx.setData(data)
        }
      })
    }
  })
}

export function normalizeSchema ({uris}, schema) {
  for (let uri in uris) {
    let ret = uris[uri]
    if (ret.isRoute) {
      // 提取路由中的schema定义
      extractSchema(ret, 'request', schema)
      extractSchema(ret, 'response', schema)
    }
  }
}

const shortMaps = {
  request: 'Req',
  response: 'Res'
}

function extractSchema (ref, type, schema) {
  let {uri, props} = ref
  let value = props[type]
  let structName = pascalCase((shortMaps[type] + '_' + uri.replace('page.', '')).replace(/\./g, '_'))
  if (isString(value)) {
    structName = value
  } else if (isObject(value)) {
    if (value.name) {
      structName = value.name
    } else {
      value.name = structName
    }
    schema.declare(value)
  }
  ref[type] = structName
}
