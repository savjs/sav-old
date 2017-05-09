import {gen, quickConf, functional, DeclareModule} from './decorator'

export const auth = quickConf('auth')
export const vue = quickConf('vue')
export const invoke = quickConf('invoke')

export const title = quickConf('title')
export const meta = quickConf('meta')

export const PageInterface = (props) => {
  return gen(props, {modalGroup: 'Page'})
}

export const ApiInterface = (props) => {
  return gen(props, {modalGroup: 'Api'})
}

export const LayoutInterface = (props) => {
  return gen(props, {modalGroup: 'Layout'})
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

export function Composer (contracts, actions) {
  let ret = []
  for (let modalGroup in contracts) {
    if (actions[modalGroup]) {
      let group = contracts[modalGroup]
      let mods = []
      let acts = actions[modalGroup].reduce((ret, mod) => {
        let modalName = mod.name
        if (maps[modalGroup] && group[modalName]) {
          let actions = maps[modalGroup]()(mod).actions
          ret[modalName] = Object.assign(group[modalName], {actions})
          mods.push(group[modalName])
        }
        return ret
      }, {})
      for (let modalName in group) {
        if (!acts[modalName]) {
          mods.push(group[modalName])
        }
      }
      ret = ret.concat(mods)
    }
  }
  return ret
}
