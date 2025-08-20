import request from '@/utils/request'
import { getToken } from '@/utils/index'
import { SSE } from '@/utils/sse'

/**
 * AI智能设计相关API
 */

/**
 * 获取AI任务推荐 - 使用SSE流式获取
 * @param {Object} options - 配置选项
 * @param {Function} options.onMessage - 接收到消息时的回调
 * @param {Function} options.onError - 发生错误时的回调
 * @param {Function} options.onEnd - 连接结束时的回调
 * @returns {SSE} SSE连接实例
 */
export const recommendTasks = (options = {}) => {
  const { onMessage, onError, onEnd } = options
  const token = getToken()
  
  // 检查token是否存在
  if (!token) {
    console.error('JWT令牌不存在，请先登录')
    if (onError) onError('用户未登录，请先登录')
    return null
  }
  
  console.log('使用的JWT令牌:', token.substring(0, 20) + '...')
  
  // 创建SSE连接 - 使用完整的baseURL
  const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
  const fullURL = `${baseURL}api/bitgain-design/recommend-tasks`
  const sseConnection = new SSE(fullURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    payload: JSON.stringify({}), // 发送空对象作为初始请求
    start: false // 禁止自动连接
  })
  
  // 监听连接打开事件
  sseConnection.addEventListener('open', (event) => {
    console.log('SSE连接已建立')
  })
  
  // 监听消息事件
  sseConnection.addEventListener('message', (event) => {
    try {
      const dataStr = event.data ? String(event.data).trim() : ''
      
      // 检查是否是结束信号
      if (dataStr === 'end' || dataStr === '"end"' || dataStr === 'data:end') {
        console.log('接收到结束信号，关闭SSE连接')
        sseConnection.close()
        if (onEnd) onEnd()
        return
      }
      
      // 移除可能的data:前缀
      const cleanData = dataStr.replace(/^data:/, '').trim()
      
      // 尝试解析JSON数据
      let parsedData
      try {
        parsedData = JSON.parse(cleanData)
      } catch {
        // 如果不是JSON，直接传递原始数据
        parsedData = cleanData
      }
      
      // 调用消息回调
      if (onMessage) onMessage(parsedData)
    } catch (error) {
      console.error('处理SSE数据失败:', error, '原始数据:', event.data)
      if (onError) onError(error)
    }
  })
  
  // 监听错误事件
  sseConnection.addEventListener('error', (event) => {
    console.error('SSE连接错误:', event)
    if (onError) onError(event.error || '连接失败')
  })
  
  return sseConnection
}

/**
 * 确认推荐任务
 * @param {Array} taskActions - 任务操作列表
 * @param {number} taskActions[].taskId - 任务ID
 * @param {string} taskActions[].action - 操作类型："commit"（确认启用）或"reject"（拒绝删除）
 * @returns {Promise} 响应数据
 */
export const confirmTasks = (taskActions) => {
  return request({
    url: 'api/bitgain-design/confirm-tasks',
    method: 'post',
    data: {
      taskActions
    }
  })
}