import {props, quickConf} from './decorator'

// 认证
export const auth = quickConf('auth')

// 控制器类型
export const controller = (opts) => {
  return props({moduleGroup: 'Controller', ...opts})
}

export {controller as ctrl}

// 接口类型
export const api = (opts) => {
  return props({moduleGroup: 'Api', ...opts})
}
