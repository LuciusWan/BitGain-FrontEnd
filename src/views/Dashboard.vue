<template>
  <div class="dashboard-container min-h-screen p-6">
    <div class="max-w-6xl mx-auto">
      <!-- 页面标题 -->
      <el-card class="welcome-card mb-6" shadow="hover">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-800 mb-2">个人日程</h1>
            <p class="text-gray-600">欢迎回来，{{ userInfo?.username || '用户' }}！管理您的日程安排</p>
          </div>
          <div class="flex items-center space-x-4">
            <el-button type="primary" @click="$router.push('/profile')" :icon="User">
              个人资料
            </el-button>
            <el-button type="success" @click="handleAddTask" :icon="Plus">
              新建任务
            </el-button>
            <el-button type="danger" @click="handleLogout" :icon="SwitchButton">
              退出登录
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 日程管理区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 左侧：任务列表 -->
        <div class="lg:col-span-2">
          <el-card class="task-list-card" shadow="hover">
            <template #header>
              <div class="flex items-center justify-between">
                <h2 class="text-xl font-bold text-gray-800">我的任务</h2>
                <div class="flex items-center space-x-2">
                  <el-select v-model="filterStatus" placeholder="筛选状态" size="small" style="width: 120px">
                    <el-option label="全部" value="all" />
                    <el-option label="待开始" value="pending" />
                    <el-option label="已完成" value="completed" />
                    <el-option label="已放弃" value="abandoned" />
                  </el-select>
                  <el-button @click="loadTasks" :icon="Refresh" size="small">刷新</el-button>
                </div>
              </div>
            </template>
            
            <!-- 任务列表 -->
            <div class="task-list">
              <div v-if="filteredTasks.length === 0" class="empty-state text-center py-8">
                <el-icon class="text-gray-400 text-4xl mb-4"><Document /></el-icon>
                <p class="text-gray-500">暂无任务，点击右上角新建任务开始管理您的日程</p>
              </div>
              
              <div v-else class="space-y-3">
                <div 
                  v-for="task in filteredTasks" 
                  :key="task.id" 
                  class="task-item p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer"
                  :class="getTaskItemClass(task.status)"
                  @click="handleTaskClick(task)"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center space-x-2 mb-2">
                        <h3 class="font-semibold text-gray-800" :class="{ 'text-gray-500': task.status === 'completed' }">
                          {{ task.title }}
                        </h3>
                        <el-tag :type="getStatusTagType(task.status)" size="small">
                          {{ getStatusText(task.status) }}
                        </el-tag>
                      </div>
                      <p class="text-gray-600 text-sm mb-2" v-if="task.description">
                        {{ task.description }}
                      </p>
                      <div class="flex items-center space-x-4 text-xs text-gray-500">
                        <span><el-icon><Clock /></el-icon> {{ formatTime(task.startTime) }} - {{ formatTime(task.endTime) }}</span>
                        <span><el-icon><Calendar /></el-icon> {{ formatDate(task.startTime) }}</span>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <el-button 
                        @click.stop="handleEditTask(task)" 
                        :icon="Edit" 
                        size="default" 
                        type="primary" 
                        link
                      />
                      <el-button 
                        @click.stop="handleDeleteTask(task.id)" 
                        :icon="Delete" 
                        size="default" 
                        type="danger" 
                        link
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 右侧：快速操作和统计 -->
        <div class="space-y-6">
          <!-- 今日概览 -->
          <el-card class="overview-card" shadow="hover">
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-bold text-gray-800">今日概览</h3>
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="$router.push('/today-goal')"
                  :icon="Aim"
                >
                  今日目标
                </el-button>
              </div>
            </template>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-gray-600">今日任务</span>
                <span class="font-bold text-blue-600">{{ todayTasks.length }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">已完成</span>
                <span class="font-bold text-green-600">{{ completedTodayTasks.length }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-600">待处理</span>
                <span class="font-bold text-orange-600">{{ pendingTodayTasks.length }}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-green-500 h-2 rounded-full transition-all" 
                  :style="{ width: todayProgress + '%' }"
                ></div>
              </div>
              <p class="text-xs text-gray-500 text-center">今日完成进度 {{ todayProgress }}%</p>
            </div>
          </el-card>

          <!-- AI智能设计 -->
          <el-card class="ai-design-card" shadow="hover">
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-bold text-gray-800 flex items-center">
                  <el-icon class="mr-2 text-purple-500"><MagicStick /></el-icon>
                  AI智能设计
                </h3>
              </div>
            </template>
            <div class="space-y-4">
              <p class="text-gray-600 text-sm">
                让AI根据您的个人信息和今日安排，智能推荐最适合的任务计划
              </p>
              <div class="grid grid-cols-1 gap-3">
                <el-button 
                  type="primary" 
                  @click="$router.push('/ai-design')"
                  :icon="Cpu"
                  class="w-full"
                >
                  开始AI设计
                </el-button>
                <el-button 
                  type="info" 
                  @click="$router.push('/ai-design')"
                  :icon="View"
                  plain
                  class="w-full"
                >
                  查看推荐历史
                </el-button>
              </div>
              <div class="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg">
                <div class="flex items-center text-sm text-gray-600">
                  <el-icon class="mr-1 text-purple-500"><Star /></el-icon>
                  <span>AI将分析您的习惯和偏好</span>
                </div>
              </div>
            </div>
          </el-card>

          <!-- 快速添加 -->
          <el-card class="quick-add-card" shadow="hover">
            <template #header>
              <h3 class="text-lg font-bold text-gray-800">快速添加</h3>
            </template>
            <el-form @submit.prevent="handleQuickAdd">
              <el-form-item>
                <el-input 
                  v-model="quickTaskTitle" 
                  placeholder="输入任务标题..." 
                  @keyup.enter="handleQuickAdd"
                />
              </el-form-item>
              <el-form-item>
                <div class="grid grid-cols-2 gap-2 mb-3">
                  <el-button 
                    :type="quickTaskDate === 'today' ? 'primary' : 'default'"
                    @click="quickTaskDate = 'today'"
                    size="small"
                  >
                    今天
                  </el-button>
                  <el-button 
                    :type="quickTaskDate === 'tomorrow' ? 'primary' : 'default'"
                    @click="quickTaskDate = 'tomorrow'"
                    size="small"
                  >
                    明天
                  </el-button>
                </div>
              </el-form-item>
              <el-form-item>
                <div class="grid grid-cols-2 gap-2">
                  <el-time-picker
                    v-model="quickStartTime"
                    placeholder="开始时间"
                    format="HH:mm"
                    value-format="HH:mm"
                    size="small"
                    style="width: 100%"
                  />
                  <el-time-picker
                    v-model="quickEndTime"
                    placeholder="结束时间"
                    format="HH:mm"
                    value-format="HH:mm"
                    size="small"
                    style="width: 100%"
                  />
                </div>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleQuickAdd" :disabled="!quickTaskTitle.trim()" block>
                  <el-icon><Plus /></el-icon>
                  添加任务
                </el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </div>
      </div>

      <!-- 任务编辑对话框 -->
      <el-dialog 
        v-model="dialogVisible" 
        :title="isEditing ? '编辑任务' : '新建任务'" 
        width="500px"
        @close="resetForm"
      >
        <el-form :model="taskForm" :rules="taskRules" ref="taskFormRef" label-width="80px">
          <el-form-item label="任务标题" prop="title">
            <el-input v-model="taskForm.title" placeholder="请输入任务标题" />
          </el-form-item>
          <el-form-item label="日期" prop="taskDate">
            <div class="grid grid-cols-2 gap-2">
              <el-button 
                :type="taskForm.taskDate === 'today' ? 'primary' : 'default'"
                @click="taskForm.taskDate = 'today'"
                size="small"
              >
                今天
              </el-button>
              <el-button 
                :type="taskForm.taskDate === 'tomorrow' ? 'primary' : 'default'"
                @click="taskForm.taskDate = 'tomorrow'"
                size="small"
              >
                明天
              </el-button>
            </div>
          </el-form-item>
          <el-form-item label="开始时间" prop="startTime">
            <el-time-picker
              v-model="taskForm.startTimeOnly"
              placeholder="选择开始时间"
              format="HH:mm"
              value-format="HH:mm"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="结束时间" prop="endTime">
            <el-time-picker
              v-model="taskForm.endTimeOnly"
              placeholder="选择结束时间"
              format="HH:mm"
              value-format="HH:mm"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="任务描述">
            <el-input 
              v-model="taskForm.description" 
              type="textarea" 
              :rows="3" 
              placeholder="请输入任务描述（可选）" 
            />
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <el-select v-model="taskForm.status" placeholder="选择状态" style="width: 100%">
              <el-option label="待开始" value="pending" />
              <el-option label="已完成" value="completed" />
              <el-option label="已放弃" value="abandoned" />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSubmitTask" :loading="submitting">
              {{ isEditing ? '更新' : '创建' }}
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  User, 
  Plus,
  Refresh, 
  SwitchButton,
  Document,
  Clock,
  Calendar,
  Edit,
  Delete,
  Aim,
  MagicStick,
  Cpu,
  View,
  Star
} from '@element-plus/icons-vue'
import {
  createFixedTask,
  updateFixedTask,
  deleteFixedTask,
  getMyFixedTasks
} from '@/api/task'

const router = useRouter()
const store = useStore()

// 计算属性
const userInfo = computed(() => store.getters['user/userInfo'])
const isAuthenticated = computed(() => store.getters['user/isAuthenticated'])

// 响应式数据
const tasks = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEditing = ref(false)
const submitting = ref(false)
const filterStatus = ref('all')
const quickTaskTitle = ref('')
const quickTaskDate = ref('today')
const quickStartTime = ref('09:00')
const quickEndTime = ref('10:00')
const taskFormRef = ref()

// 任务表单
const taskForm = ref({
  id: null,
  title: '',
  taskDate: 'today',
  startTimeOnly: '09:00',
  endTimeOnly: '10:00',
  startTime: null,
  endTime: null,
  description: '',
  status: 'pending'
})

// 表单验证规则
const taskRules = {
  title: [
    { required: true, message: '请输入任务标题', trigger: 'blur' },
    { min: 1, max: 100, message: '标题长度在 1 到 100 个字符', trigger: 'blur' }
  ],
  taskDate: [
    { required: true, message: '请选择日期', trigger: 'change' }
  ],
  startTimeOnly: [
    { required: true, message: '请选择开始时间', trigger: 'change' }
  ],
  endTimeOnly: [
    { required: true, message: '请选择结束时间', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 计算属性
const filteredTasks = computed(() => {
  if (filterStatus.value === 'all') {
    return tasks.value
  }
  return tasks.value.filter(task => task.status === filterStatus.value)
})

const todayTasks = computed(() => {
  const today = new Date().toDateString()
  return tasks.value.filter(task => {
    const taskDate = new Date(task.startTime).toDateString()
    return taskDate === today
  })
})

const completedTodayTasks = computed(() => {
  return todayTasks.value.filter(task => task.status === 'completed')
})

const pendingTodayTasks = computed(() => {
  return todayTasks.value.filter(task => task.status === 'pending')
})

const todayProgress = computed(() => {
  if (todayTasks.value.length === 0) return 0
  return Math.round((completedTodayTasks.value.length / todayTasks.value.length) * 100)
})

// 方法定义
const loadTasks = async () => {
  loading.value = true
  try {
    const response = await getMyFixedTasks()
    if (response.code === 0) {
      tasks.value = response.data || []
    } else {
      ElMessage.error(response.message || '获取任务列表失败')
    }
  } catch (error) {
    console.error('获取任务列表失败:', error)
    ElMessage.error('获取任务列表失败')
  } finally {
    loading.value = false
  }
}

const handleAddTask = () => {
  isEditing.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEditTask = (task) => {
  isEditing.value = true
  
  const startDate = new Date(task.startTime)
  const endDate = new Date(task.endTime)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  
  // 判断是今天还是明天
  const isToday = startDate.toDateString() === today.toDateString()
  const isTomorrow = startDate.toDateString() === tomorrow.toDateString()
  
  taskForm.value = {
    id: task.id,
    title: task.title,
    taskDate: isToday ? 'today' : (isTomorrow ? 'tomorrow' : 'today'),
    startTimeOnly: startDate.toTimeString().slice(0, 5),
    endTimeOnly: endDate.toTimeString().slice(0, 5),
    startTime: new Date(task.startTime),
    endTime: new Date(task.endTime),
    description: task.description || '',
    status: task.status
  }
  dialogVisible.value = true
}

const handleTaskClick = (task) => {
  // 点击任务项可以快速切换状态
  if (task.status === 'pending') {
    updateTaskStatus(task.id, 'completed')
  } else if (task.status === 'completed') {
    updateTaskStatus(task.id, 'pending')
  }
}

const updateTaskStatus = async (taskId, newStatus) => {
  const task = tasks.value.find(t => t.id === taskId)
  if (!task) return
  
  try {
    const updateData = {
      id: task.id,
      title: task.title,
      startTime: task.startTime,
      endTime: task.endTime,
      description: task.description,
      status: newStatus
    }
    
    const response = await updateFixedTask(updateData)
    if (response.code === 0) {
      task.status = newStatus
      // 移除成功提示以减少闪烁
      // ElMessage.success(`任务已标记为${getStatusText(newStatus)}`)
    } else {
      ElMessage.error(response.message || '更新任务状态失败')
    }
  } catch (error) {
    console.error('更新任务状态失败:', error)
    ElMessage.error('更新任务状态失败')
  }
}

const handleDeleteTask = async (taskId) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个任务吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await deleteFixedTask(taskId)
    if (response.code === 0) {
      tasks.value = tasks.value.filter(task => task.id !== taskId)
      ElMessage.success('任务已删除')
    } else {
      ElMessage.error(response.message || '删除任务失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除任务失败:', error)
      ElMessage.error('删除任务失败')
    }
  }
}

const handleSubmitTask = async () => {
  if (!taskFormRef.value) return
  
  try {
    await taskFormRef.value.validate()
  } catch {
    return
  }
  
  // 验证时间逻辑
  const [startHour, startMinute] = taskForm.value.startTimeOnly.split(':').map(Number)
  const [endHour, endMinute] = taskForm.value.endTimeOnly.split(':').map(Number)
  const startTotalMinutes = startHour * 60 + startMinute
  const endTotalMinutes = endHour * 60 + endMinute
  
  if (endTotalMinutes <= startTotalMinutes) {
    ElMessage.error('结束时间必须晚于开始时间')
    return
  }
  
  // 构建完整的日期时间
  const baseDate = taskForm.value.taskDate === 'today' ? new Date() : (() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow
  })()
  
  const startDateTime = new Date(baseDate)
  startDateTime.setHours(startHour, startMinute, 0, 0)
  
  const endDateTime = new Date(baseDate)
  endDateTime.setHours(endHour, endMinute, 0, 0)
  
  submitting.value = true
  
  try {
    const submitData = {
      ...taskForm.value,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString()
    }
    
    // 清理不需要的字段
    delete submitData.taskDate
    delete submitData.startTimeOnly
    delete submitData.endTimeOnly
    
    let response
    if (isEditing.value) {
      response = await updateFixedTask(submitData)
    } else {
      delete submitData.id
      response = await createFixedTask(submitData)
    }
    
    if (response.code === 0) {
      ElMessage.success(isEditing.value ? '任务更新成功' : '任务创建成功')
      dialogVisible.value = false
      await loadTasks()
    } else {
      ElMessage.error(response.message || (isEditing.value ? '更新任务失败' : '创建任务失败'))
    }
  } catch (error) {
    console.error('提交任务失败:', error)
    ElMessage.error(isEditing.value ? '更新任务失败' : '创建任务失败')
  } finally {
    submitting.value = false
  }
}

const handleQuickAdd = async () => {
  if (!quickTaskTitle.value.trim()) return
  
  // 验证时间逻辑
  const [startHour, startMinute] = quickStartTime.value.split(':').map(Number)
  const [endHour, endMinute] = quickEndTime.value.split(':').map(Number)
  const startTotalMinutes = startHour * 60 + startMinute
  const endTotalMinutes = endHour * 60 + endMinute
  
  if (endTotalMinutes <= startTotalMinutes) {
    ElMessage.error('结束时间必须晚于开始时间')
    return
  }
  
  // 构建完整的日期时间
  const baseDate = quickTaskDate.value === 'today' ? new Date() : (() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow
  })()
  
  const startDateTime = new Date(baseDate)
  startDateTime.setHours(startHour, startMinute, 0, 0)
  
  const endDateTime = new Date(baseDate)
  endDateTime.setHours(endHour, endMinute, 0, 0)
  
  try {
    const response = await createFixedTask({
      title: quickTaskTitle.value.trim(),
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      description: '',
      status: 'pending'
    })
    
    if (response.code === 0) {
      ElMessage.success('任务创建成功')
      quickTaskTitle.value = ''
      await loadTasks()
    } else {
      ElMessage.error(response.message || '创建任务失败')
    }
  } catch (error) {
    console.error('快速创建任务失败:', error)
    ElMessage.error('创建任务失败')
  }
}

const resetForm = () => {
  taskForm.value = {
    id: null,
    title: '',
    taskDate: 'today',
    startTimeOnly: '09:00',
    endTimeOnly: '10:00',
    startTime: null,
    endTime: null,
    description: '',
    status: 'pending'
  }
  if (taskFormRef.value) {
    taskFormRef.value.resetFields()
  }
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await store.dispatch('user/logout')
    ElMessage.success('已退出登录')
    router.push('/')
  } catch {
    // 用户取消
  }
}

// 工具函数
const getStatusText = (status) => {
  const statusMap = {
    pending: '待开始',
    completed: '已完成',
    abandoned: '已放弃'
  }
  return statusMap[status] || status
}

const getStatusTagType = (status) => {
  const typeMap = {
    pending: 'warning',
    completed: 'success',
    abandoned: 'danger'
  }
  return typeMap[status] || 'info'
}

const getTaskItemClass = (status) => {
  const classMap = {
    pending: 'border-orange-200 bg-orange-50',
    completed: 'border-green-200 bg-green-50',
    abandoned: 'border-red-200 bg-red-50'
  }
  return classMap[status] || ''
}

const formatTime = (timeString) => {
  return new Date(timeString).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDate = (timeString) => {
  return new Date(timeString).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}

// 页面加载时检查认证状态并加载数据
onMounted(async () => {
  if (!isAuthenticated.value) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  await loadTasks()
})
</script>

<style scoped>
.dashboard-container {
  background: linear-gradient(135deg, #f7fafc 0%, #e6fffa 50%, #c6f6d5 100%);
  min-height: 100vh;
}

/* 卡片样式覆盖 */
:deep(.welcome-card .el-card__body) {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

:deep(.task-list-card .el-card__body) {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  max-height: 600px;
  overflow-y: auto;
}

:deep(.overview-card .el-card__body),
:deep(.quick-add-card .el-card__body) {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* 任务项样式 */
.task-item {
  transition: all 0.3s ease;
  border-radius: 8px;
}

.task-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 空状态样式 */
.empty-state {
  color: #9ca3af;
}

/* 滚动条样式 */
.task-list::-webkit-scrollbar {
  width: 6px;
}

.task-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.task-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.task-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 按钮样式覆盖 */
:deep(.el-button--success) {
  background: linear-gradient(135deg, #48bb78, #38a169);
  border: none;
}

:deep(.el-button--success:hover) {
  background: linear-gradient(135deg, #38a169, #2f855a);
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #4299e1, #3182ce);
  border: none;
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #3182ce, #2c5aa0);
}

/* 对话框样式 */
:deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  background: linear-gradient(135deg, #f7fafc, #e6fffa);
  padding: 20px 24px 16px;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

/* 表单样式优化 */
:deep(.el-form-item__label) {
  font-weight: 500;
  color: #374151;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #48bb78;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px #48bb78;
}

:deep(.el-select .el-input__wrapper) {
  border-radius: 8px;
}

:deep(.el-textarea__inner) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

:deep(.el-textarea__inner:hover) {
  border-color: #48bb78;
}

:deep(.el-textarea__inner:focus) {
  border-color: #48bb78;
  box-shadow: 0 0 0 2px rgba(72, 187, 120, 0.2);
}

/* 日期选择器样式 */
:deep(.el-date-editor .el-input__wrapper) {
  border-radius: 8px;
}

/* 标签样式 */
:deep(.el-tag) {
  border-radius: 6px;
  font-size: 12px;
  padding: 2px 8px;
}

/* 进度条样式 */
.bg-green-500 {
  background: linear-gradient(90deg, #48bb78, #38a169);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }
  
  :deep(.task-list-card .el-card__body) {
    max-height: 400px;
  }
  
  .task-item {
    padding: 12px;
  }
  
  .task-item h3 {
    font-size: 14px;
  }
  
  .task-item p {
    font-size: 12px;
  }
}
</style>