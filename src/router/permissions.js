import router from '.'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useUserStore } from '@/stores/modules/user'
import { useRouterStore } from '@/stores/modules/router'
import config from '@/config'

NProgress.configure({ showSpinner: false })

const whiteList = config.routesWhiteList
let routesReady = config.permissionMode === 'intelligence'

router.beforeEach((to, from, next) => {
  NProgress.start()

  if (!routesReady) {
    try {
      useRouterStore().getRouteList()
    } catch (error) {
      console.error('动态路由加载失败：', error)
    }
    routesReady = true
    next({ ...to, replace: true })
    return
  }

  if (!config.loginInterception) {
    next()
    return
  }

  const { token } = useUserStore()
  if (token) {
    if (to.path === '/login') {
      next({ path: '/' })
      return
    }
    next()
    return
  }

  if (whiteList.includes(to.path)) {
    next()
    return
  }

  next({
    path: '/login',
    query: config.recordRoute ? { redirect: to.fullPath } : {},
  })
})

router.afterEach((to) => {
  const pageTitle = to.meta?.title
  document.title = pageTitle ? `${pageTitle} - ${config.title}` : config.title
  NProgress.done()
})

router.onError(() => {
  NProgress.done()
})
