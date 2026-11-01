import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import { constantRoutes, asyncRoutes } from './route';

import config from '@/config'
const { isHashRouterMode } = config

const routes = [
  ...constantRoutes,
  ...(config.permissionMode === 'intelligence' ? asyncRoutes : []),
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    name: 'any',
    meta: {
      title: '404',
      hidden: true,
    },
  },
]

const router = createRouter({
  history: isHashRouterMode
    ? createWebHashHistory(import.meta.env.BASE_URL)
    : createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
