// #ifndef VUE3
import Vue from 'vue'
import App from './App'
import store from './store'

Vue.config.productionTip = false
Vue.prototype.$store = store
App.mpType = 'app'

const app = new Vue({
    ...App,
	store
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
import App from './App.vue'
import store from './store'

export function createApp() {
  const app = createSSRApp(App)
  app.use(store)
  return {
    app
  }
}
// #endif

// #ifndef MP
// 处理 wx.connectSocket promisify 兼容问题，强制返回 SocketTask
uni.connectSocket = (function(connectSocket) {
	return function(options) {
		console.log(options)
		options.success = options.success || function() {}
		return connectSocket.call(this, options)
	}
})(uni.connectSocket)
// #endif