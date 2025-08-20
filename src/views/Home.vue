<template>
  <div class="home-container min-h-screen flex items-center justify-center p-4">
    <div class="glass rounded-2xl p-8 max-w-md w-full soft-shadow animate-fade-in">
      <div class="text-center">
        <!-- Logo 区域 -->
        <div class="mb-6">
          <div class="w-16 h-16 mx-auto bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center glow">
            <el-icon class="text-2xl text-white">
              <Star />
            </el-icon>
          </div>
        </div>
        
        <!-- 标题 -->
        <h1 class="text-3xl font-bold text-gray-800 mb-2">BitGain</h1>
        <p class="text-gray-600 mb-8">现代化前端应用框架</p>
        

        
        <!-- 操作按钮 -->
        <div class="mt-8 space-y-3">
          <el-button 
            type="primary" 
            size="large" 
            class="w-full bg-green-500 hover:bg-green-600 border-green-500 hover:border-green-600"
            @click="handleLogin"
          >
            <el-icon class="mr-2">
              <User />
            </el-icon>
            登录
          </el-button>
          
          <el-button 
            size="large" 
            class="w-full border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400"
            @click="handleRegister"
          >
            <el-icon class="mr-2">
              <UserFilled />
            </el-icon>
            注册
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage, ElCard } from 'element-plus'
import { Star, Check, User, UserFilled } from '@element-plus/icons-vue'

const router = useRouter()

// 方法定义
const handleLogin = () => {
  router.push('/login')
}

const handleRegister = () => {
  router.push('/register')
}


</script>

<style scoped>
.home-container {
  background: linear-gradient(135deg, #f7fafc 0%, #e6fffa 50%, #c6f6d5 100%);
}

/* 自定义动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

/* Element Plus 卡片样式覆盖 */
:deep(.el-card) {
  background: rgba(72, 187, 120, 0.1) !important;
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(72, 187, 120, 0.3) !important;
}

:deep(.el-card__body) {
  padding: 16px !important;
}
</style>