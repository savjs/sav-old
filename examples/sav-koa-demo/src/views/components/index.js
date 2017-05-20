import SavForm from './SavForm.vue'
import SavBtn from './SavBtn.vue'

export function install (Vue) {
  Object.keys(components).forEach((it) => {
    let component = components[it]
    component.name = it
    Vue.component(it, components[it])
  })
}

let components = {
  SavForm,
  SavBtn
}

Object.defineProperty(components, 'install', {
  value: install,
  enumerable: false,
  configurable: true
})

export default components
