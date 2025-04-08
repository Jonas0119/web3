import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
import CryptoIcon from './components/CryptoIcon.vue'

Vue.config.productionTip = false
Vue.component('crypto-icon', CryptoIcon)
App.mpType = 'app'
const app = new Vue({
  ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import CryptoIcon from './components/CryptoIcon.vue'

export function createApp() {
  const app = createSSRApp(App)
  app.component('crypto-icon', CryptoIcon)
  return {
    app
  }
}
// #endif