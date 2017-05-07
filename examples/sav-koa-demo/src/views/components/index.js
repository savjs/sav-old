import SavForm from './SavForm.vue'

export function install (Vue) {
  Object.keys(components).forEach((it) => {
    let component = components[it]
    component.name = it
    Vue.component(it, components[it])
  })
}

let components = {
  SavForm
}

Object.defineProperty(components, 'install', {
  value: install,
  enumerable: false,
  configurable: true
})

export default components
