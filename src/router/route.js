
const modules = import.meta.glob('./module/*.js', { eager: true })

const asyncRoutes = []
for (const path in modules) {
  const moduleRoutes = modules[path].default || []
  if (Array.isArray(moduleRoutes)) {
    asyncRoutes.push(...moduleRoutes)
  }
}

for (let j = 0; j < asyncRoutes.length - 1; j++) {
  for (let i = 0; i < asyncRoutes.length - 1; i++) {
    if (asyncRoutes[i].meta.index > asyncRoutes[i + 1].meta.index) {
      const temp = asyncRoutes[i]
      asyncRoutes[i] = asyncRoutes[i + 1]
      asyncRoutes[i + 1] = temp
    }
  }
}

const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index.vue'),
    name: 'login',
    meta: {
      title: '登录',
      hidden: true,
    },
  },
  {
    path: '/404',
    component: () => import('@/views/404.vue'),
    name: '404',
    meta: {
      title: '404',
      hidden: true,
    },
  },
  {
    path: '/',
    name: 'layout',
    redirect: '/template/list',
    meta: {
      title: 'layout',
    },
  },
]

export { constantRoutes, asyncRoutes }
