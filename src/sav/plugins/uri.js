// uri资源处理, 扁平化
import {prop} from 'sav-util'

export function uriPlugin (sav) {
  let uris
  sav.use({
    name: 'uri',
    prepare (groups) {
      uris = normalizeUris(groups)
    },
    setup ({prop, ctx}) {
      prop('uri', (uri) => {
        return uris[uri || ctx.route.uri]
      })
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
      // name: groupName,
      uri: groupName,
      // isGroup: true,
      props: group
    }
    // prop(groupRef, 'uri', groupName)
    // prop(groupRef, 'props', group)
    prop(groupRef, 'name', groupName)
    prop(groupRef, 'isGroup', true)
    for (let modalName in group) {
      let modal = group[modalName]
      let modalUri = `${groupName}.${modalName}`
      let modalRef = uris[modalUri] = {
        // name: modalName,
        uri: modalUri,
        // parent: groupRef,
        // isModal: true,
        props: modal
      }
      // prop(modalRef, 'uri', modalUri)
      // prop(modalRef, 'props', modal)
      prop(modalRef, 'name', modalName)
      prop(modalRef, 'isModal', true)
      prop(modalRef, 'parent', groupRef)
      for (let routeName in modal.routes) {
        let route = modal.routes[routeName]
        let routeUri = `${modalUri}.${routeName}`
        let routeRef = {
          // name: routeName,
          uri: routeUri,
          // parent: modalRef,
          // isRoute: true,
          props: route
        }
        uris[routeUri] = routeRef
        // prop(routeRef, 'uri', routeUri)
        // prop(routeRef, 'props', route)
        prop(routeRef, 'name', routeName)
        prop(routeRef, 'parent', modalRef)
        prop(routeRef, 'isRoute', true)
      }
    }
  }
  prop(groups, 'uris', uris)
  return uris
}
