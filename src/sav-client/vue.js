import {pascalCase} from 'sav-util'

export function normalizeVue (contract, router, flux) {
  let {uris} = contract
  let nameUris = {}
  for (let uri in uris) {
    let ret = uris[uri]
    if (ret.isRoute) {
      let name = pascalCase(`${ret.parent.name}_${ret.name}`)
      nameUris[name] = uri
    }
  }
  router.beforeEach((to, from, next) => {
    if (!to.name) {
      return next()
    }
    let uri = nameUris[to.name]
    if (!uri) {
      return next()
    }
    return flux.dispatch('fetchPage', {
      uri, 
      url: to.fullPath,
      params: to.params,
      query: to.query
    }).then(next)
  })
  contract.nameUris = nameUris
}
