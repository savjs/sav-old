import {gen, quickConf, functional} from './decorator'

export const auth = quickConf('auth')
export const title = quickConf('title')
export const vue = quickConf('vue')
export const invoke = quickConf('invoke')

export const PageInterface = (props) => {
  return gen(props, {moduleGroup: 'Page'})
}

export const ApiInterface = (props) => {
  return gen(props, {moduleGroup: 'Api'})
}

export const LayoutInterface = (props) => {
  return gen(props, {moduleGroup: 'Layout'})
}

export const requestSchema = quickConf('req')
export const responseSchema = quickConf('res')

export {requestSchema as req}
export {responseSchema as res}

export {functional as Api}
export {functional as Page}
export {functional as Layout}
