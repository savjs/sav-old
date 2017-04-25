import {gen, quickConf} from './decorator'

export const auth = quickConf('auth')
export const vue = quickConf('vue')

export const invoke = quickConf('invoke')

export const PageInterface = (opts) => {
  return gen({moduleType: 'Page', ...opts})
}

export const ApiInterface = (opts) => {
  return gen({moduleType: 'Api', ...opts})
}

export const LayoutInterface = (opts) => {
  return gen({moduleType: 'Layout', ...opts})
}
