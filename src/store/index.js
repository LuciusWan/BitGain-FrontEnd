import { createStore } from 'vuex'
import user from './modules/user'
import app from './modules/app'

// 创建 Vuex store
const store = createStore({
  modules: {
    user,
    app
  },
  strict: import.meta.env.NODE_ENV !== 'production'
})

export default store