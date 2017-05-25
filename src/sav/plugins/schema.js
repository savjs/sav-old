// Schema中间件
import SavSchema from 'sav-schema'
import {isString, isObject, pascalCase} from '../util'

export function schemaPlugin (sav) {
  let schema = sav.config.get('schema') || SavSchema
  sav.use({
    prepare (payload, promise) {
      schema.declare(payload.schema)
      normalizeSchema(payload, schema)
      promise.then(schema.ready())
    },
    setup ({prop}) {
      prop('schema', schema)
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

function extractSchema (ref, type, schema) {
  let {uri, self} = ref
  let value = self[type]
  let ret = {
    name: pascalCase((type + uri).replace(/./g, '_'))
  }
  if (isString(value)) {
    ret.name = value
  } else if (isObject(value)) {
    if (value.name) {
      ret.name = value.name
    } else {
      value.name = ret.name
    }
    ret.schema = schema.declare(value)
  }
  if (!ret.schema) {
    ret.schema = schema[ret.name]
  }
  ref[type] = ret
}
