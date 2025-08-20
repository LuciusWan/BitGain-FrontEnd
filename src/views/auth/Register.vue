<template>
  <div class="register-container min-h-screen flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- 注册卡片 -->
      <div class="glass rounded-2xl p-8 max-w-md w-full soft-shadow animate-slide-up">
        <!-- Logo和标题 -->
        <div class="text-center mb-8">
          <div class="w-12 h-12 mx-auto bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center glow mb-4">
            <el-icon class="text-xl text-white">
              <UserFilled />
            </el-icon>
          </div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">注册</h2>
          <p class="text-gray-600">加入 BitGain 社区</p>
        </div>

        <!-- 注册表单 -->
        <el-form
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          @submit.prevent="handleRegister"
          class="space-y-6"
        >
          <!-- 用户名 -->
          <el-form-item prop="username">
            <el-input
              v-model="registerForm.username"
              placeholder="请输入用户名"
              size="large"
              class="glass-input"
              :prefix-icon="User"
            />
          </el-form-item>

          <!-- 手机号 -->
          <el-form-item prop="phone">
            <el-input
              v-model="registerForm.phone"
              placeholder="请输入手机号"
              size="large"
              class="glass-input"
              :prefix-icon="Phone"
            />
          </el-form-item>

          <!-- 密码 -->
          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码"
              size="large"
              class="glass-input"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <!-- 确认密码 -->
          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请确认密码"
              size="large"
              class="glass-input"
              :prefix-icon="Lock"
              show-password
            />
          </el-form-item>

          <!-- 注册按钮 -->
          <el-form-item>
            <el-button 
              type="primary" 
              size="large" 
              class="w-full bg-green-500 hover:bg-green-600 border-green-500 hover:border-green-600"
              :loading="loading"
              @click="handleRegister"
            >
              <el-icon v-if="!loading" class="mr-2">
                <UserFilled />
              </el-icon>
              {{ loading ? '注册中...' : '注册' }}
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 登录链接 -->
        <div class="text-center mt-6">
          <span class="text-gray-600">已有账号？</span>
          <router-link 
            to="/login" 
            class="text-green-600 hover:text-green-700 ml-2 font-medium transition-colors"
          >
            立即登录
          </router-link>
        </div>
      </div>

      <!-- 底部信息 -->
      <div class="text-center mt-8">
        <p class="text-gray-500 text-sm">
          注册即表示您同意我们的
          <a href="#" class="text-green-600 hover:text-green-700 transition-colors duration-300">服务条款</a>
          和
          <a href="#" class="text-green-600 hover:text-green-700 transition-colors duration-300">隐私政策</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Phone, UserFilled } from '@element-plus/icons-vue'
import { register } from '@/api/user'
import { HaveStringPropertiesEmpty } from '@/utils'

const router = useRouter()
const loading = ref(false)
const registerFormRef = ref()

// 注册表单数据
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  phone: ''
})

// 表单验证规则
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  try {
    // 表单验证
    await registerFormRef.value.validate()
    
    // 检查必填字段
    if (HaveStringPropertiesEmpty(registerForm)) {
      ElMessage.warning('请填写完整信息')
      return
    }
    
    loading.value = true
    
    // 准备注册数据
    const registerData = {
      username: registerForm.username,
      password: registerForm.password,
      phone: registerForm.phone
    }
    
    // 调用注册API
    const response = await register(registerData)
    
    // 添加调试日志
    console.log('注册API响应:', response)
    console.log('响应code:', response?.code)
    console.log('响应message:', response?.message)
    
    if (response && (response.code === 0 || response.code === 200)) {
      ElMessage.success(response.message || response.data || '注册成功')
      // 注册成功后跳转到登录页
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } else {
      ElMessage.error(response?.message || '注册失败')
    }
  } catch (error) {
    console.error('注册失败:', error)
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else {
      ElMessage.error('注册失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  background: linear-gradient(135deg, #f7fafc 0%, #e6fffa 50%, #c6f6d5 100%);
}

/* 自定义动画 */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slideUp 0.6s ease-out;
}

/* Element Plus 输入框样式覆盖 */
:deep(.glass-input .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(72, 187, 120, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

:deep(.glass-input .el-input__wrapper:hover) {
  border-color: rgba(72, 187, 120, 0.4);
}

:deep(.glass-input .el-input__wrapper.is-focus) {
  border-color: #48bb78;
  box-shadow: 0 0 0 2px rgba(72, 187, 120, 0.2);
}

:deep(.glass-input .el-input__inner) {
  color: #2d3748;
}

:deep(.glass-input .el-input__inner::placeholder) {
  color: #a0aec0;
}

:deep(.glass-input .el-icon) {
  color: #68d391;
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
</style>