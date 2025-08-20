<template>
  <div class="login-container min-h-screen flex items-center justify-center p-4">
    <div class="glass rounded-2xl p-8 max-w-sm w-full soft-shadow animate-slide-up">
      <div class="text-center mb-8">
        <div class="w-12 h-12 mx-auto bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center glow mb-4">
          <el-icon class="text-xl text-white">
            <User />
          </el-icon>
        </div>
        <h2 class="text-2xl font-bold text-gray-800 mb-2">登录</h2>
        <p class="text-gray-600">欢迎回到 BitGain</p>
        <el-alert
          class="mt-4"
          title="测试账号"
          type="info"
          :closable="false"
          show-icon
        >
          <template #default>
            <div class="text-sm">
              <p class="mb-1">用户名: 123456</p>
              <p>密码: 123456</p>
            </div>
          </template>
        </el-alert>
      </div>
      
      <el-form 
        ref="loginFormRef" 
        :model="loginForm" 
        :rules="loginRules" 
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名"
            size="large"
            :prefix-icon="User"
            class="glass-input"
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            size="large"
            :prefix-icon="Lock"
            class="glass-input"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <div class="flex items-center justify-between mb-4">
            <el-checkbox v-model="rememberMe" class="text-gray-700">
              记住登录状态
            </el-checkbox>
            <el-button 
              type="text" 
              size="small" 
              class="text-green-600 hover:text-green-700"
              @click="handleForgotPassword"
            >
              忘记密码？
            </el-button>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            size="large" 
            class="w-full bg-green-500 hover:bg-green-600 border-green-500 hover:border-green-600"
            :loading="loading"
            @click="handleLogin"
            native-type="submit"
          >
            <el-icon v-if="!loading" class="mr-2">
              <ArrowRight />
            </el-icon>
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>
      
      <!-- 注册链接 -->
      <div class="text-center mt-6">
        <span class="text-gray-600">还没有账号？</span>
        <router-link 
          to="/register" 
          class="text-green-600 hover:text-green-700 ml-2 font-medium transition-colors"
        >
          立即注册
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { User, Lock, ArrowRight } from '@element-plus/icons-vue'
import { login } from '@/api/user'
import { HaveStringPropertiesEmpty } from '@/utils'

const router = useRouter()
const store = useStore()

// 响应式数据
const loading = ref(false)
const loginFormRef = ref(null)
const rememberMe = ref(true) // 默认记住登录状态
const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

// 方法定义
const handleLogin = async () => {
  console.log('handleLogin 被调用')
  if (!loginFormRef.value) {
    console.log('loginFormRef 不存在')
    return
  }
  
  try {
    console.log('开始表单验证')
    const valid = await loginFormRef.value.validate()
    console.log('表单验证结果:', valid)
    if (!valid) return
    
    if (HaveStringPropertiesEmpty(loginForm)) {
      ElMessage.warning('请填写完整的登录信息')
      return
    }
    
    console.log('准备发送登录请求:', loginForm)
    
    loading.value = true
    
    // 调用登录API
    const response = await login(loginForm)
    console.log('登录API响应:', response)
    
    if (response && (response.code === 0 || response.code === 200)) {
       // 登录成功，提取token和用户信息
       const token = response.data?.token || response.token
       const userInfo = response.data || response
       
       console.log('提取的token:', token)
       console.log('rememberMe状态:', rememberMe.value)
       
       // 根据rememberMe选择存储方式
       if (rememberMe.value) {
         localStorage.setItem('token', token)
         sessionStorage.removeItem('token')
         console.log('Token已存储到localStorage')
         console.log('localStorage中的token:', localStorage.getItem('token'))
       } else {
         sessionStorage.setItem('token', token)
         localStorage.removeItem('token')
         console.log('Token已存储到sessionStorage')
         console.log('sessionStorage中的token:', sessionStorage.getItem('token'))
       }
       
       // 保存用户信息到Vuex
       await store.dispatch('user/setUserInfo', {
         token,
         ...userInfo
       })
      
      ElMessage.success('登录成功！')
      
      // 跳转到控制台
      console.log('准备跳转到dashboard页面')
      try {
        await router.push('/dashboard')
        console.log('路由跳转成功')
      } catch (routerError) {
        console.error('路由跳转失败:', routerError)
        ElMessage.error('页面跳转失败，请手动刷新页面')
      }
    } else {
      ElMessage.error(response?.message || '登录失败')
    }
  } catch (error) {
    console.error('Login error:', error)
    let errorMessage = '登录失败，请检查用户名和密码'
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.response?.status === 401) {
      errorMessage = '用户名或密码错误'
    } else if (error.response?.status === 403) {
      errorMessage = '账户已被禁用'
    } else if (error.response?.status >= 500) {
      errorMessage = '服务器错误，请稍后重试'
    } else if (error.code === 'NETWORK_ERROR') {
      errorMessage = '网络连接失败，请检查网络'
    }
    
    ElMessage.error(errorMessage)
  } finally {
    loading.value = false
  }
}

const handleForgotPassword = () => {
  ElMessage.info('忘记密码功能开发中...')
}
</script>

<style scoped>
.login-container {
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

/* Alert 样式覆盖 */
:deep(.el-alert) {
  background: rgba(72, 187, 120, 0.1);
  border: 1px solid rgba(72, 187, 120, 0.2);
}

:deep(.el-alert__title) {
  color: #2d3748;
  font-weight: 600;
}

:deep(.el-alert__content) {
  color: #4a5568;
}
</style>