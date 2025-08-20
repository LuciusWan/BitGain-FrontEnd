/**
 * 通用工具函数
 */

/**
 * 获取用户token
 * @returns {string|null} - 用户token
 */
export const getToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token')
}

/**
 * 检查对象的字符串属性是否为空
 * @param {Object} obj - 要检查的对象
 * @returns {boolean} - 如果有空字符串属性返回true
 */
export const HaveStringPropertiesEmpty = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return true
  }
  
  return Object.values(obj).some(value => {
    if (typeof value === 'string') {
      return value.trim() === ''
    }
    return false
  })
}

/**
 * 格式化日期
 * @param {Date|string|number} date - 日期
 * @param {string} format - 格式化字符串，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} - 格式化后的日期字符串
 */
export const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @param {boolean} immediate - 是否立即执行
 * @returns {Function} - 防抖后的函数
 */
export const debounce = (func, wait, immediate = false) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func(...args)
  }
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 时间间隔（毫秒）
 * @returns {Function} - 节流后的函数
 */
export const throttle = (func, limit) => {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 深拷贝
 * @param {any} obj - 要拷贝的对象
 * @returns {any} - 拷贝后的对象
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime())
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item))
  }
  
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

/**
 * 生成随机字符串
 * @param {number} length - 字符串长度
 * @returns {string} - 随机字符串
 */
export const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 文件大小格式化
 * @param {number} bytes - 字节数
 * @returns {string} - 格式化后的文件大小
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 获取设备类型
 * @returns {string} - 设备类型：mobile, tablet, desktop
 */
export const getDeviceType = () => {
  const width = window.innerWidth
  if (width < 768) {
    return 'mobile'
  } else if (width < 1024) {
    return 'tablet'
  } else {
    return 'desktop'
  }
}

/**
 * 数字格式化（添加千分位分隔符）
 * @param {number} num - 数字
 * @returns {string} - 格式化后的数字字符串
 */
export const formatNumber = (num) => {
  if (typeof num !== 'number') return ''
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * URL参数解析
 * @param {string} url - URL字符串
 * @returns {Object} - 参数对象
 */
export const parseUrlParams = (url = window.location.href) => {
  const params = {}
  const urlObj = new URL(url)
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value
  })
  return params
}

/**
 * 对象转URL参数字符串
 * @param {Object} obj - 参数对象
 * @returns {string} - URL参数字符串
 */
export const objectToUrlParams = (obj) => {
  const params = new URLSearchParams()
  Object.keys(obj).forEach(key => {
    if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
      params.append(key, obj[key])
    }
  })
  return params.toString()
}