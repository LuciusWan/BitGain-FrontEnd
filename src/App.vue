<template>
  <div id="app" class="min-h-screen">
    <!-- 全局加载状态 -->
    <div v-if="loading" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="glass rounded-lg p-6">
        <el-icon class="animate-spin text-2xl text-white">
          <Loading />
        </el-icon>
        <p class="mt-2 text-white">加载中...</p>
      </div>
    </div>
    
    <!-- 路由视图 -->
    <router-view />
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { Loading } from '@element-plus/icons-vue'
import { getDeviceType } from '@/utils'

const store = useStore()

// 计算属性
const loading = computed(() => store.getters['app/loading'])

// 响应式设计 - 监听窗口大小变化
const handleResize = () => {
  const deviceType = getDeviceType()
  store.dispatch('app/setDeviceType', deviceType)
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  handleResize() // 初始化设备类型
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style>
/* 全局样式已在 assets/styles/index.css 中定义 */
</style>