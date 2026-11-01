import '@/styles/index.scss';

import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import pinia from './stores';
import '@/router/permissions';
import GlobalComponents from '@/components/index';
import config from '@/config';

import 'virtual:svg-icons-register'

const app = createApp(App)
app.use(pinia)
if (router) {
  app.use(router);
}
app.use(GlobalComponents);

document.title = config.title
app.mount('#app')
