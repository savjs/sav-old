import bootstrap from './server-entry.js'
import routes from './routes.js'
import {ajax} from 'sav-util'

let app = bootstrap({
  routes
})

app.router.beforeEach((to, from, next) => {
  if (app.hotReplace) {
    return next()
  }
  if (!to.name) {
    return next()
  }
  ajax({
    url: to.fullPath,
    dataType: 'JSON',
    timeout: 5000
  }, function (err, data) {
    if (err) {
      console.error(err)
    } else {
      app.flux.updateState(data).then(() => {
        next()
        if (data.title) {
          document.title = data.title
        }
      })
    }
  })
})

app.vm.$mount('#app')

window.app = app
