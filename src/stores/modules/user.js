import { login as loginApi, logout } from '@/api/auth';
import config from '@/config'
import {
  getRefreshToken,
  getToken as getTokenApi,
  removeRefreshToken,
  removeToken,
  setRefreshToken,
  setToken as setTokenApi,
} from '@/utils/token';

import router from '@/router';

const readStorage = (key) => localStorage.getItem(key) || '';

export const useUserStore = defineStore('user', () => {
  const token = ref(getTokenApi() || '');
  const isLogin = ref(!!token.value);
  const avatar = ref(readStorage('avatar'));
  const nickname = ref(readStorage('nickname'));
  const account = ref(readStorage('account'));
  const menu = ref(JSON.parse(localStorage.getItem('menu') || 'null') || []);
  const role = ref(readStorage('staffRole'));
  const isAdmin = computed(() => role.value === 'admin');
  const isCollapse = ref(false);

  const getIsLogin = computed(() => isLogin.value);
  const getToken = computed(() => token.value);
  const getnickname = computed(() => nickname.value);
  const getAvatar = computed(() => avatar.value);
  const getAccount = computed(() => account.value);
  const getMenu = computed(() => menu.value);
  const getIsAdmin = computed(() => isAdmin.value);

  const collapseChange = () => {
    isCollapse.value = !isCollapse.value;
  };

  const setIsLogin = (value) => {
    isLogin.value = value;
  };

  const setToken = (value) => {
    token.value = value || '';
    isLogin.value = !!token.value;
    if (token.value) setTokenApi(token.value);
    else removeToken();
  };

  const setnickname = (value) => {
    nickname.value = value || '';
    if (nickname.value) localStorage.setItem('nickname', nickname.value);
    else localStorage.removeItem('nickname');
  };

  const setAccount = (value) => {
    account.value = value || '';
    if (account.value) localStorage.setItem('account', account.value);
    else localStorage.removeItem('account');
  };

  const setRole = (value) => {
    role.value = value || '';
    if (role.value) localStorage.setItem('staffRole', role.value);
    else localStorage.removeItem('staffRole');
  };

  const resetSession = () => {
    token.value = '';
    isLogin.value = false;
    nickname.value = '';
    avatar.value = '';
    account.value = '';
    role.value = '';
    menu.value = [];
    isCollapse.value = false;
    removeToken();
    removeRefreshToken();
    localStorage.removeItem('nickname');
    localStorage.removeItem('account');
    localStorage.removeItem('avatar');
    localStorage.removeItem('staffRole');
    localStorage.removeItem('menu');
  };

  const afterLogin = (value) => {
    if (value) setToken(value);
    const hour = new Date().getHours();
    const thisTime =
      hour < 8
        ? '早上好'
        : hour <= 11
          ? '上午好'
          : hour <= 13
            ? '中午好'
            : hour < 18
              ? '下午好'
              : '晚上好';
    ElNotification({
      title: `${thisTime}！`,
      message: `欢迎登录${config.title}`,
      type: 'success',
    });
  };

  const login = async (userInfo) => {
    const data = await loginApi(userInfo);
    setToken(data.access_token);
    setRefreshToken(data.refresh_token);
    setnickname(data.username);
    setAccount(data.username);
    setRole(data.role);
    afterLogin(data.access_token);
    return 'ok';
  };

  const userLogout = async () => {
    const redirect = router.currentRoute.value.fullPath;
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) await logout(refreshToken);
    } catch (error) {
      console.warn('退出登录请求失败：', error);
    }
    resetSession();
    router.push({
      name: 'login',
      query: config.recordRoute ? { redirect } : {},
    });
  };

  return {
    isLogin,
    token,
    nickname,
    avatar,
    account,
    menu,
    role,
    isAdmin,
    isCollapse,
    getToken,
    getIsLogin,
    getnickname,
    getAvatar,
    getAccount,
    getMenu,
    getIsAdmin,
    setIsLogin,
    setRole,
    login,
    userLogout,
    resetSession,
    collapseChange,
  };
});
