import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'

// 路由配置
const routes = [
  {
    path: '/',
    name: 'layout',
    component: AppLayout,
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'home',
        component: () => import('@/views/Home.vue'),
        meta: {
          title: '首页',
          requiresAuth: false
        }
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: {
          title: '控制台',
          requiresAuth: true
        }
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/views/user/Profile.vue'),
        meta: {
          title: '个人资料',
          requiresAuth: true
        }
      },
      {
        path: 'today-goal',
        name: 'today-goal',
        component: () => import('@/views/TodayGoal.vue'),
        meta: {
          title: '今日目标',
          requiresAuth: true
        }
      },
      {
        path: 'ai-design',
        name: 'ai-design',
        component: () => import('@/views/AiDesign.vue'),
        meta: {
          title: 'AI智能设计',
          requiresAuth: true
        }
      },
      // 可以在这里添加更多路由
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/Login.vue'),
    meta: {
      title: '登录',
      requiresAuth: false
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/Register.vue'),
    meta: {
      title: '注册',
      requiresAuth: false
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/error/NotFound.vue'),
    meta: {
      title: '页面未找到'
    }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  
  console.log('路由守卫执行:', {
    to: to.path,
    from: from.path,
    token: !!token,
    requiresAuth: to.meta.requiresAuth
  })
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - BitGain`
  }

  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    if (!token) {
      // 没有token，跳转到登录页面
      console.log('没有token，重定向到登录页')
      next({
        path: '/login',
        query: { redirect: to.fullPath } // 保存原始路径，登录后可以跳转回来
      })
      return
    } else {
      console.log('有token，允许访问')
    }
  } else {
    console.log('不需要认证，直接通过')
  }

  // 允许用户随时访问登录和注册页面
  // 注释掉自动重定向逻辑，让用户可以主动访问登录页面
  // const currentToken = localStorage.getItem('token') || sessionStorage.getItem('token')
  // if ((to.path === '/login' || to.path === '/register') && currentToken) {
  //   next('/dashboard')
  //   return
  // }

  next()
})

export default router