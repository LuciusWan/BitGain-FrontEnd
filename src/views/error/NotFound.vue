<template>
  <div class="not-found-container min-h-screen flex items-center justify-center p-6">
    <div class="text-center max-w-md mx-auto">
      <!-- 404 图标 -->
      <el-card class="icon-card mb-8" shadow="hover">
        <div class="w-32 h-32 mx-auto flex items-center justify-center bg-gradient-to-r from-green-400 to-green-600 rounded-full">
          <el-icon class="text-6xl text-white">
            <WarningFilled />
          </el-icon>
        </div>
      </el-card>
      
      <!-- 错误信息 -->
      <el-card class="error-card" shadow="hover">
        <h1 class="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 class="text-2xl font-bold text-gray-800 mb-4">页面未找到</h2>
        <p class="text-gray-600 mb-8 leading-relaxed">
          抱歉，您访问的页面不存在或已被移动。
          请检查URL是否正确，或返回首页继续浏览。
        </p>
        
        <!-- 操作按钮 -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <el-button 
            type="success" 
            size="large"
            @click="goHome"
            :icon="HomeFilled"
          >
            返回首页
          </el-button>
          
          <el-button 
            size="large"
            @click="goBack"
            :icon="ArrowLeft"
          >
            返回上页
          </el-button>
        </div>
      </el-card>
      
      <!-- 装饰元素 -->
      <div class="mt-8 text-gray-500 text-sm">
        <p>如果问题持续存在，请联系技术支持</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { WarningFilled, HomeFilled, ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()

// 方法定义
const goHome = () => {
  router.push('/')
}

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}

const handleContact = () => {
  ElMessage.info('联系我们功能开发中...')
}
</script>

<style scoped>
.not-found-container {
  background: linear-gradient(135deg, #f7fafc 0%, #e6fffa 50%, #c6f6d5 100%);
}

/* 卡片样式覆盖 */
:deep(.icon-card .el-card__body) {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 2rem;
}

:deep(.error-card .el-card__body) {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 2rem;
}

/* 按钮样式覆盖 */
:deep(.el-button--success) {
  background: linear-gradient(135deg, #48bb78, #38a169);
  border: none;
}

:deep(.el-button--success:hover) {
  background: linear-gradient(135deg, #38a169, #2f855a);
}

:deep(.el-button--default) {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(72, 187, 120, 0.2);
  color: #4a5568;
}

:deep(.el-button--default:hover) {
  background: rgba(72, 187, 120, 0.1);
  border-color: rgba(72, 187, 120, 0.4);
  color: #2f855a;
}

/* 装饰动画 */
.not-found-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="%2348bb78" opacity="0.1"><animate attributeName="opacity" values="0.1;0.3;0.1" dur="3s" repeatCount="indefinite"/></circle><circle cx="80" cy="30" r="1.5" fill="%2348bb78" opacity="0.1"><animate attributeName="opacity" values="0.1;0.4;0.1" dur="2s" repeatCount="indefinite"/></circle><circle cx="40" cy="70" r="1" fill="%2348bb78" opacity="0.1"><animate attributeName="opacity" values="0.1;0.5;0.1" dur="4s" repeatCount="indefinite"/></circle></svg>') repeat;
  pointer-events: none;
}
</style>