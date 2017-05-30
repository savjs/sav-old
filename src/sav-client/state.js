
export function normalizeState (contract, flux) {
  let state = {}
  let {uris} = contract
  let dismiss = []
  for (let uri in uris) {
    let ret = uris[uri]
    if (ret.isPage && ret.isRoute) {
      if (ret.responseSchema) {
        Object.assign(state, ret.responseSchema.createResponse())
      } else {
        dismiss.push({uri, schema: ret.response})
      }
      if (ret.props.reqstate) {
        if (ret.requestSchema) {
          Object.assign(state, ret.requestSchema.createRequest())
        } else {
          dismiss.push({uri, schema: ret.request})
        }
      }
    }
  }
  if (dismiss.length) {
    flux.emit('schemaRequired', dismiss)
  }
  flux.declare({state})
}
