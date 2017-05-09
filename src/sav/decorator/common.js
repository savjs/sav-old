import {gen, quickConf, functional, DeclareModule} from './decorator'

export const auth = quickConf('auth')
export const vue = quickConf('vue')
export const invoke = quickConf('invoke')

export const title = quickConf('title')
export const meta = quickConf('meta')

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

export const ApiModule = DeclareModule(ApiInterface)
export const PageModule = DeclareModule(PageInterface)
export const LayoutModule = DeclareModule(LayoutInterface)

const maps = {
  api: ApiModule,
  page: PageModule,
  layout: LayoutModule
}

export function Composer (groups, actions) {
  let ret = []
  for (let moduleGroup in groups) {
    if (actions[moduleGroup]) {
      let group = groups[moduleGroup]
      let mods = []
      let acts = actions[moduleGroup].reduce((ret, mod) => {
        let moduleName = mod.name
        if (maps[moduleGroup] && group[moduleName]) {
          let actions = maps[moduleGroup]()(mod).actions
          ret[moduleName] = Object.assign(group[moduleName], {actions})
          mods.push(group[moduleName])
        }
        return ret
      }, {})
      for (let moduleName in group) {
        if (!acts[moduleName]) {
          mods.push(group[moduleName])
        }
      }
      ret = ret.concat(mods)
    }
  }
  return ret
}
