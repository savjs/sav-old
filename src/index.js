export {Router} from './sav/router'

import * as plugins from './sav/plugins'

export {plugins}

import {
  Api, Page, Layout,
  conf, quickConf, props,
  route, head, options, get, post, put, patch, del,
  auth, vue, invoke, title, meta, req, res,
  PageInterface, ApiInterface, LayoutInterface,
  PageModule, ApiModule, LayoutModule
} from './sav/decorator'

let decorators = {
  Api,
  Page,
  Layout,
  conf,
  quickConf,
  props,
  route,
  head,
  options,
  get,
  post,
  put,
  patch,
  del,
  auth,
  vue,
  invoke,
  title,
  meta,
  req,
  res,
  PageInterface,
  ApiInterface,
  LayoutInterface,
  PageModule,
  ApiModule,
  LayoutModule
}

export {decorators}

export {Api}
export {Page}
export {Layout}

export {ApiModule}
export {PageModule}
export {LayoutModule}

export {props}
