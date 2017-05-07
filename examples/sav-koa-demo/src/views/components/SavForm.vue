<template>
  <form :action="location.path" @submit.prevent="submit">
    <slot></slot>
  </form>
</template>
<script type="text/javascript">
  import {ajax} from 'sav-util'
  import {mapActions} from 'sav-flux'
  export default {
    props: {
      to: {
        type: [String, Object],
        required: true
      },
      data: {
        type: Object
      },
      append: {
        type: Boolean,
        default: false
      }
    },
    computed: {
      location () {
        let router = this.$router
        let current = this.$route
        let ref = router.resolve(this.to, current, this.append)
        return ref.location
      }
    },
    methods: {
      ...mapActions(['replaceHistoryState']),
      submit ($event) {
        let {location, data} = this
        ajax({
          url: location.path,
          data,
          dataType: 'JSON',
          method: 'POST',
          timeout: 5000
        }, (err, data) => {
          if (err) {
            console.error(err)
          } else {
            this.replaceHistoryState({
              url: location.path,
              state: data
            })
          }
        })
      }
    }
  }
</script>