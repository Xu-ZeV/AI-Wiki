import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
    meta: {
      title: 'UI 模板库画廊',
      badge: 'Overview'
    }
  },
  {
    path: '/glass-board',
    name: 'GlassBoard',
    component: () => import('../views/GlassBoardView.vue'),
    meta: {
      title: '玻璃倾斜画板',
      badge: '控件一 · 3D Parallax'
    }
  },
  {
    path: '/nav-capsule',
    name: 'NavCapsule',
    component: () => import('../views/NavCapsuleView.vue'),
    meta: {
      title: '胶囊导航栏与按钮',
      badge: '控件二 · Elastic Glider'
    }
  },
  {
    path: '/glass-search',
    name: 'GlassSearch',
    component: () => import('../views/GlassSearchView.vue'),
    meta: {
      title: '磨砂流光搜索框',
      badge: '控件三 · Ambient Beam'
    }
  },
  {
    path: '/card-hover-halo',
    name: 'CardHoverHalo',
    component: () => import('../views/CardHoverHaloView.vue'),
    meta: {
      title: '列表卡片悬停光晕',
      badge: '控件四 · Damped Lerp'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'),
    meta: {
      title: '页面未找到',
      badge: '404'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
