<template>
  <div class="profile-container min-h-screen p-6">
    <div class="max-w-4xl mx-auto">
      <!-- 页面标题 -->
      <el-card class="header-card mb-6" shadow="hover">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-800 mb-2">个人资料</h1>
            <p class="text-gray-600">管理您的账户信息和偏好设置</p>
          </div>
          <div class="flex items-center space-x-2">
            <el-button type="primary" @click="goToDashboard" :icon="ArrowLeft">
              返回Dashboard
            </el-button>
            <el-button type="success" @click="handleSave" :loading="saving" :icon="Check">
              保存更改
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 主要内容 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- 用户头像和基本信息 -->
        <div class="lg:col-span-1">
          <el-card class="profile-card" shadow="hover">
            <div class="text-center">
              <el-avatar 
                :size="96" 
                class="mx-auto mb-4 bg-gradient-to-r from-green-400 to-green-600"
              >
                <el-icon class="text-3xl text-white">
                  <User />
                </el-icon>
              </el-avatar>
              <h3 class="text-xl font-bold text-gray-800 mb-2">{{ userInfo.username || '未设置' }}</h3>
              <p class="text-gray-600 mb-4">{{ userInfo.email || '未设置邮箱' }}</p>
              <el-button type="success" size="small" @click="handleUploadAvatar" :icon="Upload">
                更换头像
              </el-button>
            </div>
            
            <el-divider />
            
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-500">手机号</span>
                <span class="text-gray-800">{{ userInfo.phone || '未设置' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">职业</span>
                <span class="text-gray-800">{{ userInfo.profession || '未设置' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500">邮件订阅</span>
                <span class="text-gray-800">{{ userInfo.emailSubscribe ? '已开启' : '已关闭' }}</span>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 表单区域 -->
        <div class="lg:col-span-2">
          <el-card class="form-card" shadow="hover">
            <template #header>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-bold text-gray-800">编辑资料</h3>
                <el-button 
                  type="success" 
                  :icon="Edit" 
                  @click="toggleEditMode"
                >
                  {{ isEditing ? '取消编辑' : '编辑资料' }}
                </el-button>
              </div>
            </template>
            
            <el-form
              ref="profileFormRef"
              :model="formData"
              :rules="formRules"
              label-width="100px"
            >
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <el-form-item label="用户名" prop="username">
                  <el-input 
                    v-model="formData.username" 
                    :disabled="!isEditing"
                    placeholder="请输入用户名"
                    :prefix-icon="User"
                  />
                </el-form-item>
                
                <el-form-item label="邮箱" prop="email">
                  <el-input 
                    v-model="formData.email" 
                    :disabled="!isEditing"
                    placeholder="请输入邮箱"
                    :prefix-icon="Message"
                  />
                </el-form-item>
                
                <el-form-item label="手机号" prop="phone">
                  <el-input 
                    v-model="formData.phone" 
                    :disabled="!isEditing"
                    placeholder="请输入手机号"
                    :prefix-icon="Phone"
                  />
                </el-form-item>
                
                <el-form-item label="职业" prop="profession">
                  <el-input 
                    v-model="formData.profession" 
                    :disabled="!isEditing"
                    placeholder="请输入职业"
                    :prefix-icon="Star"
                  />
                </el-form-item>
              </div>
              
              <el-form-item label="技能标签" prop="skills">
                <el-input 
                  v-model="formData.skills" 
                  :disabled="!isEditing"
                  type="textarea" 
                  :rows="3"
                  placeholder="请输入技能标签，用逗号分隔"
                />
              </el-form-item>
              
              <el-form-item label="提升目标" prop="goals">
                <el-input 
                  v-model="formData.goals" 
                  :disabled="!isEditing"
                  type="textarea" 
                  :rows="3"
                  placeholder="请输入您的提升目标"
                />
              </el-form-item>
              
              <el-form-item label="邮件订阅">
                <el-switch
                  v-model="formData.emailSubscribe"
                  :disabled="!isEditing"
                  :active-value="1"
                  :inactive-value="0"
                  active-text="开启"
                  inactive-text="关闭"
                />
              </el-form-item>
            </el-form>
          </el-card>
        </div>
      </div>

      <!-- 技能标签展示 -->
      <div v-if="skillTags.length > 0" class="glass rounded-2xl p-6 shadow-2xl backdrop-blur-lg border border-white/20">
        <h3 class="text-lg font-semibold text-white mb-4 flex items-center">
          <el-icon class="mr-2"><Collection /></el-icon>
          技能标签
        </h3>
        <div class="flex flex-wrap gap-2">
          <el-tag
            v-for="tag in skillTags"
            :key="tag"
            type="primary"
            effect="light"
            class="glass-tag"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  User, 
  Edit, 
  Check, 
  Star, 
  Collection,
  Upload,
  Message,
  Phone,
  ArrowLeft
} from '@element-plus/icons-vue'
import { getUserInfo, updateUserInfo } from '@/api/user'

const router = useRouter()
const store = useStore()

const goToDashboard = () => {
  router.push({ name: 'dashboard' })
}

// 响应式数据
const loading = ref(false)
const saving = ref(false)
const isEditing = ref(false)
const profileFormRef = ref()

// 用户信息
const userInfo = ref({})
const formData = reactive({
  username: '',
  phone: '',
  email: '',
  profession: '',
  skills: '',
  goals: '',
  emailSubscribe: 1
})

// 表单验证规则
const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

// 计算属性
const skillTags = computed(() => {
  if (!userInfo.value.skills) return []
  return userInfo.value.skills.split(',').filter(tag => tag.trim())
})

// 方法定义
const loadUserInfo = async () => {
  loading.value = true
  try {
    const response = await getUserInfo()
    
    console.log('获取用户信息响应:', response)
    
    if (response && (response.code === 0 || response.code === 200)) {
      userInfo.value = response.data || {}
      
      // 填充表单数据
      Object.assign(formData, {
        username: userInfo.value.username || '',
        phone: userInfo.value.phone || '',
        email: userInfo.value.email || '',
        profession: userInfo.value.profession || '',
        skills: userInfo.value.skills || '',
        goals: userInfo.value.goals || '',
        emailSubscribe: userInfo.value.emailSubscribe ?? 1
      })
    } else {
      ElMessage.error(response?.message || '获取用户信息失败')
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      router.push('/login')
    } else {
      ElMessage.error('获取用户信息失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

const toggleEditMode = () => {
  if (isEditing.value) {
    // 取消编辑，恢复原始数据
    Object.assign(formData, {
      username: userInfo.value.username || '',
      phone: userInfo.value.phone || '',
      email: userInfo.value.email || '',
      profession: userInfo.value.profession || '',
      skills: userInfo.value.skills || '',
      goals: userInfo.value.goals || '',
      emailSubscribe: userInfo.value.emailSubscribe ?? 1
    })
  }
  isEditing.value = !isEditing.value
}

const handleUploadAvatar = () => {
  ElMessage.info('头像上传功能开发中...')
}

const handleSave = async () => {
  if (!profileFormRef.value) return
  
  try {
    // 表单验证
    await profileFormRef.value.validate()
    
    saving.value = true
    
    // 调用更新API
    const response = await updateUserInfo(formData)
    
    console.log('更新用户信息响应:', response)
    
    if (response && (response.code === 0 || response.code === 200)) {
      ElMessage.success(response.message || response.data || '更新成功')
      
      // 更新本地用户信息
      Object.assign(userInfo.value, formData)
      
      // 退出编辑模式
      isEditing.value = false
      
      // 重新加载用户信息
      await loadUserInfo()
    } else {
      ElMessage.error(response?.message || '更新失败')
    }
  } catch (error) {
    console.error('更新用户信息失败:', error)
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      router.push('/login')
    } else {
      ElMessage.error('更新失败，请稍后重试')
    }
  } finally {
    saving.value = false
  }
}

// 页面加载时获取用户信息
onMounted(() => {
  loadUserInfo()
})
</script>

<style scoped>
.profile-container {
  background: linear-gradient(135deg, #f7fafc 0%, #e6fffa 50%, #c6f6d5 100%);
}

/* 卡片样式覆盖 */
:deep(.header-card .el-card__body) {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

:deep(.profile-card .el-card__body) {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

:deep(.form-card .el-card__body) {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* 输入框样式覆盖 */
:deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(72, 187, 120, 0.2);
}

:deep(.el-input__wrapper:hover) {
  border-color: rgba(72, 187, 120, 0.4);
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #48bb78;
  box-shadow: 0 0 0 2px rgba(72, 187, 120, 0.2);
}

:deep(.el-textarea__inner) {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(72, 187, 120, 0.2);
}

:deep(.el-textarea__inner:hover) {
  border-color: rgba(72, 187, 120, 0.4);
}

:deep(.el-textarea__inner:focus) {
  border-color: #48bb78;
  box-shadow: 0 0 0 2px rgba(72, 187, 120, 0.2);
}

/* 表单标签样式 */
:deep(.el-form-item__label) {
  color: #4a5568 !important;
  font-weight: 500;
}

/* 按钮样式覆盖 */
:deep(.el-button--success) {
  background: linear-gradient(135deg, #48bb78, #38a169);
  border: none;
}

:deep(.el-button--success:hover) {
  background: linear-gradient(135deg, #38a169, #2f855a);
}

/* Switch 样式覆盖 */
:deep(.el-switch.is-checked .el-switch__core) {
  background-color: #48bb78;
  border-color: #48bb78;
}

/* 标签样式 */
.glass-tag {
  background: rgba(72, 187, 120, 0.1) !important;
  border: 1px solid rgba(72, 187, 120, 0.2) !important;
  color: #2f855a !important;
}

/* 表单验证错误样式 */
:deep(.el-form-item.is-error .el-input__wrapper) {
  border-color: #f56565 !important;
  box-shadow: 0 0 0 2px rgba(245, 101, 101, 0.2) !important;
}

:deep(.el-form-item__error) {
  color: #e53e3e;
  background: rgba(245, 101, 101, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
  margin-top: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .grid-cols-1.md\:grid-cols-2 {
    grid-template-columns: 1fr;
  }
}
</style>