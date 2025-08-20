<template>
  <div class="today-goal-container min-h-screen p-6">
    <div class="max-w-4xl mx-auto">
      <!-- 页面标题 -->
      <el-card class="welcome-card mb-6" shadow="hover">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-800 mb-2">今日目标</h1>
            <p class="text-gray-600">设定并管理您的今日目标，让每一天都充满意义</p>
          </div>
          <div class="flex items-center space-x-4">
            <el-button type="primary" @click="handleAddGoal" :icon="Plus">
              新建目标
            </el-button>
            <el-button type="danger" @click="handleDeleteAll" :icon="Delete" v-if="goals.length > 0">
              清空所有
            </el-button>
            <el-button type="info" @click="$router.push('/dashboard')" :icon="ArrowLeft">
              返回控制台
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 目标统计 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <el-card class="stat-card" shadow="hover">
          <div class="flex items-center">
            <el-icon class="text-3xl text-blue-500 mr-4"><Aim /></el-icon>
            <div>
              <h3 class="text-lg font-semibold text-gray-800">总目标数</h3>
              <p class="text-2xl font-bold text-blue-500">{{ goals.length }}</p>
            </div>
          </div>
        </el-card>
        
        <el-card class="stat-card" shadow="hover">
          <div class="flex items-center">
            <el-icon class="text-3xl text-green-500 mr-4"><Clock /></el-icon>
            <div>
              <h3 class="text-lg font-semibold text-gray-800">今日创建</h3>
              <p class="text-2xl font-bold text-green-500">{{ todayCreatedCount }}</p>
            </div>
          </div>
        </el-card>
        
        <el-card class="stat-card" shadow="hover">
          <div class="flex items-center">
            <el-icon class="text-3xl text-orange-500 mr-4"><Calendar /></el-icon>
            <div>
              <h3 class="text-lg font-semibold text-gray-800">最新更新</h3>
              <p class="text-sm text-orange-500">{{ latestUpdateTime }}</p>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 目标列表 -->
      <el-card class="goal-list-card" shadow="hover">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-bold text-gray-800">我的目标</h2>
            <el-button @click="loadGoals" :icon="Refresh" size="small">刷新</el-button>
          </div>
        </template>
        
        <div class="goal-list">
          <div v-if="goals.length === 0" class="empty-state text-center py-12">
            <el-icon class="text-gray-400 text-6xl mb-4"><Document /></el-icon>
            <p class="text-gray-500 text-lg mb-4">还没有设定今日目标</p>
            <el-button type="primary" @click="handleAddGoal" :icon="Plus">
              创建第一个目标
            </el-button>
          </div>
          
          <div v-else class="space-y-4">
            <div 
              v-for="goal in goals" 
              :key="goal.id" 
              class="goal-item p-6 border border-gray-200 rounded-lg hover:shadow-md transition-all"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center space-x-3 mb-3">
                    <el-icon class="text-blue-500 text-xl"><Aim /></el-icon>
                    <h3 class="text-lg font-semibold text-gray-800">{{ goal.goal }}</h3>
                  </div>
                  <div class="flex items-center space-x-6 text-sm text-gray-500">
                    <span>
                      <el-icon><Clock /></el-icon>
                      创建时间：{{ formatDateTime(goal.createTime) }}
                    </span>
                    <span v-if="goal.updateTime !== goal.createTime">
                      <el-icon><Edit /></el-icon>
                      更新时间：{{ formatDateTime(goal.updateTime) }}
                    </span>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <el-button 
                    @click="handleEditGoal(goal)" 
                    :icon="Edit" 
                    size="default" 
                    type="primary" 
                    link
                  />
                  <el-button 
                    @click="handleDeleteGoal(goal.id)" 
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

      <!-- 目标编辑对话框 -->
      <el-dialog 
        v-model="dialogVisible" 
        :title="isEditing ? '编辑目标' : '新建目标'" 
        width="500px"
        @close="resetForm"
      >
        <el-form :model="goalForm" :rules="goalRules" ref="goalFormRef" label-width="80px">
          <el-form-item label="目标内容" prop="goal">
            <el-input 
              v-model="goalForm.goal" 
              type="textarea"
              :rows="4"
              placeholder="请输入您的今日目标..."
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSubmitGoal" :loading="submitting">
              {{ isEditing ? '更新' : '创建' }}
            </el-button>
          </span>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus,
  Delete,
  ArrowLeft,
  Aim,
  Clock,
  Calendar,
  Document,
  Refresh,
  Edit
} from '@element-plus/icons-vue'
import {
  createTodayGoal,
  updateTodayGoal,
  getMyTodayGoals,
  deleteTodayGoal,
  deleteAllMyTodayGoals
} from '@/api/todayGoal'

const router = useRouter()
const store = useStore()

// 计算属性
const userInfo = computed(() => store.getters['user/userInfo'])
const isAuthenticated = computed(() => store.getters['user/isAuthenticated'])

// 响应式数据
const goals = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEditing = ref(false)
const submitting = ref(false)
const goalFormRef = ref()

// 目标表单
const goalForm = ref({
  id: null,
  goal: ''
})

// 表单验证规则
const goalRules = {
  goal: [
    { required: true, message: '请输入目标内容', trigger: 'blur' },
    { min: 1, max: 500, message: '目标内容长度在 1 到 500 个字符', trigger: 'blur' }
  ]
}

// 计算属性
const todayCreatedCount = computed(() => {
  const today = new Date().toDateString()
  return goals.value.filter(goal => {
    const createDate = new Date(goal.createTime).toDateString()
    return createDate === today
  }).length
})

const latestUpdateTime = computed(() => {
  if (goals.value.length === 0) return '暂无'
  const latest = goals.value.reduce((latest, goal) => {
    return new Date(goal.updateTime) > new Date(latest.updateTime) ? goal : latest
  })
  return formatDateTime(latest.updateTime)
})

// 方法定义
const loadGoals = async () => {
  loading.value = true
  try {
    const response = await getMyTodayGoals()
    if (response.code === 0) {
      goals.value = response.data || []
    } else {
      ElMessage.error(response.message || '获取目标列表失败')
    }
  } catch (error) {
    console.error('获取目标列表失败:', error)
    ElMessage.error('获取目标列表失败')
  } finally {
    loading.value = false
  }
}

const handleAddGoal = () => {
  isEditing.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEditGoal = (goal) => {
  isEditing.value = true
  goalForm.value = {
    id: goal.id,
    goal: goal.goal
  }
  dialogVisible.value = true
}

const handleDeleteGoal = async (goalId) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个目标吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await deleteTodayGoal(goalId)
    if (response.code === 0) {
      goals.value = goals.value.filter(goal => goal.id !== goalId)
      ElMessage.success('目标已删除')
    } else {
      ElMessage.error(response.message || '删除目标失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除目标失败:', error)
      ElMessage.error('删除目标失败')
    }
  }
}

const handleDeleteAll = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要删除所有今日目标吗？此操作不可恢复！',
      '警告',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await deleteAllMyTodayGoals()
    if (response.code === 0) {
      goals.value = []
      ElMessage.success('所有目标已删除')
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除所有目标失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

const handleSubmitGoal = async () => {
  if (!goalFormRef.value) return
  
  try {
    await goalFormRef.value.validate()
  } catch {
    return
  }
  
  submitting.value = true
  
  try {
    let response
    if (isEditing.value) {
      response = await updateTodayGoal(goalForm.value.id, {
        goal: goalForm.value.goal
      })
    } else {
      response = await createTodayGoal({
        goal: goalForm.value.goal
      })
    }
    
    if (response.code === 0) {
      ElMessage.success(isEditing.value ? '目标更新成功' : '目标创建成功')
      dialogVisible.value = false
      await loadGoals()
    } else {
      ElMessage.error(response.message || (isEditing.value ? '更新目标失败' : '创建目标失败'))
    }
  } catch (error) {
    console.error('提交目标失败:', error)
    ElMessage.error(isEditing.value ? '更新目标失败' : '创建目标失败')
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  goalForm.value = {
    id: null,
    goal: ''
  }
  if (goalFormRef.value) {
    goalFormRef.value.clearValidate()
  }
}

const formatDateTime = (dateTimeString) => {
  return new Date(dateTimeString).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 页面加载时检查认证状态并加载数据
onMounted(async () => {
  if (!isAuthenticated.value) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  await loadGoals()
})
</script>

<style scoped>
.today-goal-container {
  background: linear-gradient(135deg, #f7fafc 0%, #e6fffa 50%, #c6f6d5 100%);
  min-height: 100vh;
}

/* 卡片样式覆盖 */
:deep(.welcome-card .el-card__body),
:deep(.stat-card .el-card__body),
:deep(.goal-list-card .el-card__body) {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

:deep(.goal-list-card .el-card__body) {
  max-height: 600px;
  overflow-y: auto;
}

/* 目标项样式 */
.goal-item {
  transition: all 0.3s ease;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.goal-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.9);
}

/* 统计卡片样式 */
.stat-card {
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 空状态样式 */
.empty-state {
  color: #9ca3af;
}

/* 滚动条样式 */
.goal-list::-webkit-scrollbar {
  width: 6px;
}

.goal-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.goal-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.goal-list::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

/* 按钮样式覆盖 */
:deep(.el-button) {
  border-radius: 6px;
  font-weight: 500;
}

/* 对话框样式 */
:deep(.el-dialog) {
  border-radius: 12px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* 表单样式优化 */
:deep(.el-form-item__label) {
  font-weight: 600;
  color: #374151;
}

:deep(.el-textarea__inner) {
  border-radius: 6px;
  border: 1px solid #d1d5db;
  transition: all 0.3s ease;
}

:deep(.el-textarea__inner:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .today-goal-container {
    padding: 1rem;
  }
  
  .welcome-card .flex {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .goal-item {
    padding: 1rem;
  }
  
  .goal-item .flex {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>