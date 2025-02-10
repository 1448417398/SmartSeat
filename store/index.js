// store.js (Vue 3)
import { createStore } from 'vuex';

const store = createStore({
  state() {
    return {
      isConnected: false,
      connectionStatus: '未连接',
	  backrestData0: [], 
    };
  },
  mutations: {
    setConnectionStatus(state, status) {
      state.isConnected = status.isConnected;
      state.connectionStatus = status.connectionStatus;
    },
	setbackrestData0(state, data) {
		state.backrestData0 = data;
	},
  },
  actions: {
    updateConnectionStatus({ commit }, status) {
      commit('setConnectionStatus', status);
    },
	updatebackrestData0({ commit }, data) {
		commit('setbackrestData0', data);
		console.log(data);
	},
  },
});

export default store;
