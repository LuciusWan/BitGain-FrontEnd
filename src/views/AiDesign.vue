<template>
  <div class="ai-design-container min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6 relative">
    <!-- 返回按钮 -->
    <div class="absolute top-6 right-6 z-50">
      <el-button @click="goToDashboard" type="info" plain>
        返回Dashboard
        <el-icon class="el-icon--right"><ArrowRight /></el-icon>
      </el-button>
    </div>
    
    <!-- 页面标题 -->
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-8">
        <h1 class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          AI智能日程设计
        </h1>
        <p class="text-gray-600 text-lg">
          基于您的个人信息和今日安排，AI为您智能推荐最适合的任务计划
        </p>
      </div>

      <!-- 推荐按钮区域 -->
      <div class="text-center mb-8">
        <div class="space-x-4">
          <el-button 
            type="primary" 
            size="large" 
            :loading="loading"
            :disabled="loading"
            @click="getRecommendations"
            class="px-8 py-3 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <el-icon class="mr-2"><MagicStick /></el-icon>
            {{ loading ? '正在生成推荐...' : '获取AI推荐任务' }}
          </el-button>
          
          <el-button 
            v-if="loading"
            type="danger" 
            size="large" 
            @click="stopRecommendations"
            class="px-6 py-3 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            plain
          >
            <el-icon class="mr-2"><Close /></el-icon>
            停止获取
          </el-button>
        </div>
      </div>

      <!-- 推荐任务列表 -->
      <div v-if="recommendedTasks.length > 0" class="space-y-6">
        <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-800 flex items-center">
              <el-icon class="mr-2 text-blue-500"><Cpu /></el-icon>
              AI推荐任务
            </h2>
            <div class="text-sm text-gray-500">
              共 {{ recommendedTasks.length }} 个推荐任务
            </div>
          </div>

          <!-- 任务列表 -->
          <div class="space-y-4 mb-6">
            <div 
              v-for="task in recommendedTasks" 
              :key="task.id"
              class="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
            >
              <div class="flex items-start space-x-4">
                <!-- 选择框 -->
                <div class="flex-shrink-0 pt-1">
                  <el-checkbox 
                    v-model="task.selected"
                    :indeterminate="task.action === 'reject'"
                    @change="handleTaskSelection(task)"
                    size="large"
                  />
                </div>

                <!-- 任务内容 -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-2">
                    <h3 class="text-lg font-semibold text-gray-800 truncate">
                      {{ task.title }}
                    </h3>
                    <div class="flex space-x-2">
                      <el-tag 
                        :type="task.action === 'commit' ? 'success' : task.action === 'reject' ? 'danger' : 'info'"
                        size="small"
                      >
                        {{ getActionText(task.action) }}
                      </el-tag>
                    </div>
                  </div>
                  
                  <p class="text-gray-600 mb-3 line-clamp-2">
                    {{ task.description }}
                  </p>
                  
                  <div class="flex items-center space-x-4 text-sm text-gray-500">
                    <div class="flex items-center">
                      <el-icon class="mr-1"><Clock /></el-icon>
                      {{ formatTime(task.startTime) }} - {{ formatTime(task.endTime) }}
                    </div>
                    <div class="flex items-center">
                      <el-icon class="mr-1"><Timer /></el-icon>
                      {{ getDuration(task.startTime, task.endTime) }}
                    </div>
                  </div>
                </div>

                <!-- 操作按钮 -->
                <div class="flex-shrink-0 flex space-x-2">
                  <el-button 
                    size="small" 
                    type="success" 
                    :class="{ 'opacity-50': task.action === 'reject' }"
                    @click="setTaskAction(task, 'commit')"
                    plain
                  >
                    <el-icon><Check /></el-icon>
                  </el-button>
                  <el-button 
                    size="small" 
                    type="danger" 
                    :class="{ 'opacity-50': task.action === 'commit' }"
                    @click="setTaskAction(task, 'reject')"
                    plain
                  >
                    <el-icon><Close /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 批量操作按钮 -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-200">
            <div class="flex space-x-3">
              <el-button @click="selectAll" size="small" plain>
                全选
              </el-button>
              <el-button @click="selectNone" size="small" plain>
                取消全选
              </el-button>
              <el-button @click="commitSelected" size="small" type="success" plain>
                批量确认
              </el-button>
              <el-button @click="rejectSelected" size="small" type="danger" plain>
                批量拒绝
              </el-button>
            </div>
            
            <div class="flex space-x-3">
              <el-button @click="resetSelections" size="small">
                重置选择
              </el-button>
              <el-button 
                type="primary" 
                :loading="confirmLoading"
                :disabled="!hasSelectedTasks"
                @click="confirmSelections"
                size="large"
                class="px-6"
              >
                <el-icon class="mr-1"><Check /></el-icon>
                确认选择 ({{ selectedCount }})
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!loading" class="text-center py-16">
        <div class="bg-white/70 backdrop-blur-sm rounded-2xl p-12 shadow-lg border border-white/20 max-w-md mx-auto">
          <el-icon class="text-6xl text-gray-400 mb-4"><MagicStick /></el-icon>
          <h3 class="text-xl font-semibold text-gray-600 mb-2">暂无推荐任务</h3>
          <p class="text-gray-500 mb-6">点击上方按钮获取AI智能推荐</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  MagicStick, 
  Cpu, 
  Clock, 
  Timer, 
  Check, 
  Close, 
  ArrowRight
} from '@element-plus/icons-vue'
import { recommendTasks, confirmTasks } from '@/api/aiDesign'
import { HaveStringPropertiesEmpty } from '@/utils'

// 路由
const router = useRouter()

// 响应式数据
const loading = ref(false)
const confirmLoading = ref(false)
const recommendedTasks = ref([])

// 跳转到Dashboard
const goToDashboard = () => {
  router.push({ name: 'dashboard' })
}

// 计算属性
const hasSelectedTasks = computed(() => {
  return recommendedTasks.value.some(task => task.action && task.action !== 'none')
})

const selectedCount = computed(() => {
  return recommendedTasks.value.filter(task => task.action && task.action !== 'none').length
})

// SSE连接实例
let eventSource = null

// 获取AI推荐任务 - 使用SSE流式接收
const getRecommendations = () => {
  if (loading.value) {
    ElMessage.warning('正在获取推荐任务，请稍候...')
    return
  }
  
  loading.value = true
  recommendedTasks.value = [] // 清空之前的数据
  
  // 关闭之前的连接
  if (eventSource) {
    eventSource.close()
  }
  
  try {
    eventSource = recommendTasks({
      // onMessage - 接收推荐任务数据
      onMessage: (data) => {
        console.log('接收到推荐任务:', data)
        
        try {
          // 处理任务数组数据（用户提供的格式）
          if (Array.isArray(data)) {
            // 直接是任务数组
            const newTasks = data.map(task => ({
              ...task,
              selected: false,
              action: 'none' // none, commit, reject
            }))
            recommendedTasks.value = [...recommendedTasks.value, ...newTasks]
          } else if (typeof data === 'string') {
            // 尝试解析字符串格式的JSON
            const parsedData = JSON.parse(data)
            if (Array.isArray(parsedData)) {
              const newTasks = parsedData.map(task => ({
                ...task,
                selected: false,
                action: 'none'
              }))
              recommendedTasks.value = [...recommendedTasks.value, ...newTasks]
            }
          } else if (data && data.id) {
            // 单个任务
            recommendedTasks.value.push({
              ...data,
              selected: false,
              action: 'none'
            })
          }
        } catch (error) {
          console.error('处理任务数据失败:', error)
        }
      },
      
      // onError - 处理错误
      onError: (error) => {
        console.error('SSE连接错误:', error)
        const errorMessage = typeof error === 'string' ? error : 
                           error?.message || '获取推荐任务失败，请稍后重试'
        ElMessage.error(errorMessage)
        loading.value = false
      },
      
      // onEnd - 连接结束
      onEnd: () => {
        console.log('AI推荐任务获取完成')
        loading.value = false
        
        if (recommendedTasks.value.length > 0) {
          ElMessage.success(`成功获取 ${recommendedTasks.value.length} 个AI推荐任务`)
        } else {
          ElMessage.info('暂无推荐任务')
        }
      }
    })
    
    // 检查SSE连接是否创建成功
    if (!eventSource) {
      loading.value = false
      ElMessage.error('无法创建连接，请检查登录状态')
      return
    }
    
    // 启动SSE连接
    eventSource.stream()
  } catch (error) {
    console.error('启动SSE连接失败:', error)
    const errorMessage = error?.message || '连接失败，请检查网络后重试'
    if (errorMessage.includes('token') || errorMessage.includes('认证')) {
      ElMessage.error('登录已过期，请重新登录')
    } else {
      ElMessage.error(errorMessage)
    }
    loading.value = false
  }
}

// 停止获取推荐任务
const stopRecommendations = () => {
  if (eventSource) {
    console.log('用户手动停止SSE连接')
    eventSource.close()
    eventSource = null
  }
  loading.value = false
  ElMessage.info('已停止获取推荐任务')
}

// 设置任务操作
const setTaskAction = (task, action) => {
  task.action = task.action === action ? 'none' : action
  task.selected = task.action !== 'none'
}

// 处理任务选择
const handleTaskSelection = (task) => {
  if (!task.selected) {
    task.action = 'none'
  } else if (task.action === 'none') {
    task.action = 'commit'
  }
}

// 批量操作
const selectAll = () => {
  recommendedTasks.value.forEach(task => {
    task.selected = true
    if (task.action === 'none') {
      task.action = 'commit'
    }
  })
}

const selectNone = () => {
  recommendedTasks.value.forEach(task => {
    task.selected = false
    task.action = 'none'
  })
}

const commitSelected = () => {
  recommendedTasks.value.forEach(task => {
    if (task.selected) {
      task.action = 'commit'
    }
  })
}

const rejectSelected = () => {
  recommendedTasks.value.forEach(task => {
    if (task.selected) {
      task.action = 'reject'
    }
  })
}

const resetSelections = () => {
  recommendedTasks.value.forEach(task => {
    task.selected = false
    task.action = 'none'
  })
}

// 确认选择
const confirmSelections = async () => {
  const taskActions = recommendedTasks.value
    .filter(task => task.action && task.action !== 'none')
    .map(task => ({
      taskId: task.id,
      action: task.action
    }))
  
  if (taskActions.length === 0) {
    ElMessage.warning('请选择要操作的任务')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要执行选中的 ${taskActions.length} 个任务操作吗？`,
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    confirmLoading.value = true
    
    const response = await confirmTasks(taskActions)
    console.log('确认任务响应:', response)
    
    if (response && (response.code === 0 || response.code === 200)) {
      ElMessage.success(response.data || '操作成功')
      // 清空推荐列表，用户可以重新获取推荐
      recommendedTasks.value = []
    } else {
      ElMessage.error(response?.message || '操作失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('确认任务失败:', error)
      ElMessage.error('操作失败，请稍后重试')
    }
  } finally {
    confirmLoading.value = false
  }
}

// 工具函数
const getActionText = (action) => {
  switch (action) {
    case 'commit': return '确认启用'
    case 'reject': return '拒绝删除'
    default: return '未选择'
  }
}

const formatTime = (timeString) => {
  if (!timeString) return '时间未定'
  const date = new Date(`1970-01-01T${timeString}`)
  if (isNaN(date.getTime())) {
    console.error('Invalid time string for formatTime:', timeString)
    return '无效时间'
  }
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

const getDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return '时长未知'
  const start = new Date(`1970-01-01T${startTime}`)
  const end = new Date(`1970-01-01T${endTime}`)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    console.error('Invalid time string for getDuration:', { startTime, endTime })
    return '时长无法计算'
  }

  const diffMs = end.getTime() - start.getTime()
  if (diffMs < 0) {
    return '结束时间早于开始时间'
  }

  const diffMinutes = Math.round(diffMs / (1000 * 60))
  
  if (diffMinutes === 0) {
    return '小于1分钟'
  }
  
  const diffHours = Math.floor(diffMinutes / 60)
  const remainingMinutes = diffMinutes % 60

  if (diffHours > 0) {
    return `${diffHours}小时${remainingMinutes > 0 ? remainingMinutes + '分钟' : ''}`
  } else {
    return `${remainingMinutes}分钟`
  }
}

// 页面挂载时的操作
onMounted(() => {
  console.log('AI智能设计页面已挂载')
})

// 页面卸载时清理SSE连接
onUnmounted(() => {
  if (eventSource) {
    console.log('关闭SSE连接')
    eventSource.close()
    eventSource = null
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ai-design-container {
  min-height: calc(100vh - 60px);
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ai-design-container {
    padding: 1rem;
  }
  
  .space-x-4 > * + * {
    margin-left: 0.5rem;
  }
  
  .space-x-3 > * + * {
    margin-left: 0.25rem;
  }
}
</style>