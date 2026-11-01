export default [{
  path: '/template',
  component: () => import('@/layout/index.vue'),
  name: 'template',
  meta: {
    title: '模板',
    auth: true,
    icon: 'Document',
    index: 1,
  },
  children: [
    {
      name: 'template/list',
      path: 'list',
      component: () => import('@/views/template/index.vue'),
      meta: {
        title: '模板',
        auth: true,
        icon: 'Document',
      },
    },
    {
      name: 'template/create',
      path: 'create',
      component: () => import('@/views/template/edit.vue'),
      meta: {
        title: '新建模板',
        auth: true,
        hidden: true,
        activeMenu: '/template/list',
      },
    },
    {
      name: 'template/edit',
      path: 'edit/:id',
      component: () => import('@/views/template/edit.vue'),
      meta: {
        title: '编辑模板',
        auth: true,
        hidden: true,
        activeMenu: '/template/list',
      },
    },
  ],
}]
