import {gen, quickConf} from './decorator'

export const auth = quickConf('auth')
export const title = quickConf('title')
export const vue = quickConf('vue')
export const invoke = quickConf('invoke')

export const PageInterface = (opts) => {
  return gen({moduleGroup: 'Page', ...opts})
}

export const ApiInterface = (opts) => {
  return gen({moduleGroup: 'Api', ...opts})
}

export const LayoutInterface = (opts) => {
  return gen({moduleGroup: 'Layout', ...opts})
}

export const requestSchema = quickConf('req')
export const responseSchema = quickConf('res')

export {requestSchema as req}
export {responseSchema as res}
