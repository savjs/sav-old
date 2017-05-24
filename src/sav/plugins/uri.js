// uri资源处理, 扁平化
import {prop} from '../util'

export function uriPlugin (sav) {
  sav.use({
    prepare (groups) {
      normalizeUris(groups)
    }
  })
}

let modalGroups = ['page', 'layout', 'api']

export function normalizeUris (groups) {
  let uris = {}
  for (let groupName in groups) {
    if (modalGroups.indexOf(groupName) === -1) {
      continue
    }
    let group = groups[groupName]
    let groupRef = uris[groupName] = {
      name: groupName,
      // uri: groupName,
      self: group,
      isGroup: true
    }
    prop(groupRef, 'uri', groupName)
    prop(groupRef, 'self', group)
    for (let modalName in group) {
      let modal = group[modalName]
      let modalUri = `${groupName}.${modalName}`
      let modalRef = uris[modalUri] = {
        name: modalName,
        // uri: modalUri,
        self: modal,
        // parent: groupRef,
        isModal: true
      }
      prop(modalRef, 'uri', modalUri)
      prop(modalRef, 'self', modal)
      prop(modalRef, 'parent', groupRef)
      for (let routeName in modal.routes) {
        let route = modal.routes[routeName]
        let routeUri = `${modalUri}.${routeName}`
        let routeRef = uris[routeUri] = {
          name: routeName,
          // uri: routeUri,
          self: route,
          // parent: modalRef,
          isRoute: true
        }
        prop(routeRef, 'uri', routeUri)
        prop(routeRef, 'self', route)
        prop(routeRef, 'parent', modalRef)
      }
    }
  }
  prop(groups, 'uris', uris)
}
