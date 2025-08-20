import request from '@/utils/request'

/**
 * 固定任务管理API
 */

// 创建固定任务
export const createFixedTask = (data) => {
  return request({
    url: '/api/fixed-task',
    method: 'post',
    data
  })
}

// 删除固定任务
export const deleteFixedTask = (id) => {
  return request({
    url: `/api/fixed-task/${id}`,
    method: 'delete'
  })
}

// 更新固定任务
export const updateFixedTask = (data) => {
  return request({
    url: '/api/fixed-task',
    method: 'put',
    data
  })
}

// 查询固定任务详情
export const getFixedTaskDetail = (id) => {
  return request({
    url: `/api/fixed-task/${id}`,
    method: 'get'
  })
}

// 查询我的固定任务
export const getMyFixedTasks = () => {
  return request({
    url: '/api/fixed-task/my',
    method: 'get'
  })
}

// 按时间范围查询固定任务
export const getFixedTasksByRange = (startTime, endTime) => {
  return request({
    url: '/api/fixed-task/range',
    method: 'get',
    params: {
      startTime,
      endTime
    }
  })
}