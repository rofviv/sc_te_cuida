import Vue from 'vue'
import Vuex from 'vuex'
import { clientData } from './clientData';

Vue.use(Vuex)

export default function () {
  const Store = new Vuex.Store({
    modules: {
      clientData
    },
    strict: process.env.DEV
  })

  return Store
}
