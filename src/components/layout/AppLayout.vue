<template>
  <div class="app-layout min-h-screen">
    <!-- 主要内容区域 -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
// 布局组件 - 可以在这里添加全局的布局逻辑
</script>

<style scoped>
.app-layout {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.main-content {
  min-height: 100vh;
  padding: 1rem;
}

@media (min-width: 768px) {
  .main-content {
    padding: 2rem;
  }
}
</style>