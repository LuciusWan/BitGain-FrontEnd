import request from '@/utils/request'

/**
 * 创建今日目标
 * @param {Object} data - 目标数据
 * @param {string} data.goal - 目标内容
 * @returns {Promise} 响应数据
 */
export const createTodayGoal = (data) => {
  return request({
    url: '/api/today-goal',
    method: 'post',
    data
  })
}

/**
 * 更新今日目标
 * @param {number} id - 目标ID
 * @param {Object} data - 更新数据
 * @param {string} data.goal - 目标内容
 * @returns {Promise} 响应数据
 */
export const updateTodayGoal = (id, data) => {
  return request({
    url: `/api/today-goal/${id}`,
    method: 'put',
    data
  })
}

/**
 * 查询今日目标
 * @param {number} id - 目标ID
 * @returns {Promise} 响应数据
 */
export const getTodayGoal = (id) => {
  return request({
    url: `/api/today-goal/${id}`,
    method: 'get'
  })
}

/**
 * 查询我的今日目标
 * @returns {Promise} 响应数据
 */
export const getMyTodayGoals = () => {
  return request({
    url: '/api/today-goal/my/all',
    method: 'get'
  })
}

/**
 * 删除今日目标
 * @param {number} id - 目标ID
 * @returns {Promise} 响应数据
 */
export const deleteTodayGoal = (id) => {
  return request({
    url: `/api/today-goal/${id}`,
    method: 'delete'
  })
}

/**
 * 删除我的所有今日目标
 * @returns {Promise} 响应数据
 */
export const deleteAllMyTodayGoals = () => {
  return request({
    url: '/api/today-goal/my/all',
    method: 'delete'
  })
}