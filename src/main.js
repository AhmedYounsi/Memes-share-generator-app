import Vue from 'vue'
import App from './App.vue'
import router from './router'
import VueLazyload from 'vue-lazyload'
import VueDraggableResizable from 'vue-draggable-resizable'
import {WebRTC} from 'vue-webrtc'
import * as io from 'socket.io-client'
Vue.component(WebRTC.name, WebRTC)
window.io = io
// optionally import default styles
import 'vue-draggable-resizable/dist/VueDraggableResizable.css'

import './registerServiceWorker'

Vue.component('vue-draggable-resizable', VueDraggableResizable)
Vue.use(VueLazyload)




// or with options
Vue.use(VueLazyload, {
  preLoad: 1.3,
  error: 'dist/error.png',
  loading: 'dist/loading.gif',
  attempt: 1
})
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')

 
