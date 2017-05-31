import SavSchema from 'sav-schema'
import {isString} from 'sav-util'
import {normalizeUris} from '../sav/plugins/uri.js'
import {normalizeRoutes} from '../sav/plugins/router.js'
import {normalizeSchema} from '../sav/plugins/schema.js'
import {normalizeFetch} from './fetch.js'
import {normalizeVue} from './vue.js'
import {normalizeState} from './state.js'

export function resolveContract ({contract, schema, flux, router, opts}) {
  schema || (schema = SavSchema)
  if (opts) {
    Object.assign(flux.opts, opts)
  }
  flux.prop('contract', contract)
  flux.prop('schema', schema)
  if (!isString(flux.opts.baseUrl)) {
    flux.opts.baseUrl = router.options.baseUrl || ''
  }
  normalizeUris(contract)
  normalizeRoutes(contract)
  normalizeVue(contract, router, flux)
  normalizeSchema(contract, schema, true)
  normalizeFetch(contract, flux, router)
  return schema.ready().then(() => {
    if (typeof window !== 'undefined') {
      if (window.INIT_STATE) {
        flux.replaceState(window.INIT_STATE)
      }
    }
    normalizeState(contract, flux)
  })
}
