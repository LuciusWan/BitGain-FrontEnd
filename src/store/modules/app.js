// 应用状态管理模块
const state = {
  loading: false,
  theme: 'light',
  language: 'zh-CN',
  sidebarCollapsed: false,
  deviceType: 'desktop' // desktop, tablet, mobile
}

const mutations = {
  SET_LOADING(state, loading) {
    state.loading = loading
  },
  SET_THEME(state, theme) {
    state.theme = theme
    localStorage.setItem('theme', theme)
  },
  SET_LANGUAGE(state, language) {
    state.language = language
    localStorage.setItem('language', language)
  },
  SET_SIDEBAR_COLLAPSED(state, collapsed) {
    state.sidebarCollapsed = collapsed
    localStorage.setItem('sidebarCollapsed', collapsed)
  },
  SET_DEVICE_TYPE(state, deviceType) {
    state.deviceType = deviceType
  }
}

const actions = {
  setLoading({ commit }, loading) {
    commit('SET_LOADING', loading)
  },
  setTheme({ commit }, theme) {
    commit('SET_THEME', theme)
  },
  setLanguage({ commit }, language) {
    commit('SET_LANGUAGE', language)
  },
  toggleSidebar({ commit, state }) {
    commit('SET_SIDEBAR_COLLAPSED', !state.sidebarCollapsed)
  },
  setDeviceType({ commit }, deviceType) {
    commit('SET_DEVICE_TYPE', deviceType)
  },
  // 初始化应用设置
  initAppSettings({ commit }) {
    const theme = localStorage.getItem('theme') || 'light'
    const language = localStorage.getItem('language') || 'zh-CN'
    const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true'
    
    commit('SET_THEME', theme)
    commit('SET_LANGUAGE', language)
    commit('SET_SIDEBAR_COLLAPSED', sidebarCollapsed)
    
    // 检测设备类型
    const width = window.innerWidth
    let deviceType = 'desktop'
    if (width < 768) {
      deviceType = 'mobile'
    } else if (width < 1024) {
      deviceType = 'tablet'
    }
    commit('SET_DEVICE_TYPE', deviceType)
  }
}

const getters = {
  loading: state => state.loading,
  theme: state => state.theme,
  language: state => state.language,
  sidebarCollapsed: state => state.sidebarCollapsed,
  deviceType: state => state.deviceType,
  isMobile: state => state.deviceType === 'mobile',
  isTablet: state => state.deviceType === 'tablet',
  isDesktop: state => state.deviceType === 'desktop'
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}