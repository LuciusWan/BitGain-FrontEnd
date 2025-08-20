// 获取token的工具函数
const getToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token') || ''
}

// 获取用户信息的工具函数
const getUserInfo = () => {
  try {
    const userInfoStr = localStorage.getItem('userInfo')
    return userInfoStr ? JSON.parse(userInfoStr) : null
  } catch (error) {
    console.error('Parse userInfo error:', error)
    return null
  }
}

// 用户状态管理模块
const state = {
  userInfo: getUserInfo(),
  token: getToken(),
  isAuthenticated: !!getToken(),
  permissions: []
}

const mutations = {
  SET_USER_INFO(state, userInfo) {
    state.userInfo = userInfo
    state.isAuthenticated = !!userInfo
  },
  SET_TOKEN(state, token) {
    state.token = token
    // 注意：token的存储位置由调用方决定，这里只更新state
    // 实际的localStorage/sessionStorage操作在登录组件中处理
  },
  SET_PERMISSIONS(state, permissions) {
    state.permissions = permissions
  },
  CLEAR_USER_DATA(state) {
    state.userInfo = null
    state.token = ''
    state.isAuthenticated = false
    state.permissions = []
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    sessionStorage.removeItem('token')
  }
}

const actions = {
  // 设置用户信息
  async setUserInfo({ commit }, userInfo) {
    try {
      // 设置token
      if (userInfo.token) {
        commit('SET_TOKEN', userInfo.token)
      }
      
      // 设置用户信息
      const userData = {
        id: userInfo.userId || userInfo.id,
        username: userInfo.username,
        email: userInfo.email || userInfo.username + '@example.com',
        avatar: userInfo.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
      }
      
      commit('SET_USER_INFO', userData)
      
      // 保存到localStorage
      localStorage.setItem('userInfo', JSON.stringify(userData))
      
      return { success: true }
    } catch (error) {
      console.error('Set user info failed:', error)
      return { success: false, message: error.message }
    }
  },
  
  // 登录（保留用于兼容）
  async login({ dispatch }, loginData) {
    // 这个方法现在主要用于兼容，实际登录逻辑在组件中处理
    return dispatch('setUserInfo', loginData)
  },
  
  // 登出
  async logout({ commit }) {
    try {
      // 这里应该调用登出API
      // await request.post('/api/auth/logout')
      
      commit('CLEAR_USER_DATA')
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      commit('CLEAR_USER_DATA') // 即使API失败也清除本地数据
      return { success: false, message: error.message }
    }
  },
  
  // 获取用户信息
  async getUserInfo({ commit, state }) {
    if (!state.token) {
      return { success: false, message: '未登录' }
    }
    
    try {
      // 这里应该调用获取用户信息API
      // const response = await request.get('/api/user/info')
      // const userInfo = response.data
      
      // 模拟获取用户信息
      const userInfo = {
        id: 1,
        username: 'testuser',
        email: 'user@example.com',
        role: 'user'
      }
      
      commit('SET_USER_INFO', userInfo)
      return { success: true, data: userInfo }
    } catch (error) {
      console.error('Get user info error:', error)
      return { success: false, message: error.message }
    }
  }
}

const getters = {
  isAuthenticated: state => state.isAuthenticated,
  userInfo: state => state.userInfo,
  token: state => state.token,
  permissions: state => state.permissions,
  hasPermission: state => permission => {
    return state.permissions.includes(permission)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}