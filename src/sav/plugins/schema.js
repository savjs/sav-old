// Schema中间件
import SavSchema from 'sav-schema'
// import {isString} from '../util'

export function schemaPlugin (sav) {
  let schema = sav.config.get('schema') || SavSchema
  sav.use({
    prepare (payload, promise) {
      normalizeSchema(payload)
      schema.declare(payload.schema)
    }
  })
}

export function normalizeSchema ({uris}) {
  for (let uri in uris) {
    let ret = uris[uri]
    if (ret.isRoute) {
      // 提取路由中的schema定义
    }
  }
}
