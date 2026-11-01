import config from '@/config';
import axios from 'axios';
import { getRefreshToken, getToken, removeRefreshToken, removeToken, setRefreshToken, setToken } from './token';
import router from '@/router';

const request = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API || config.baseURL || '',
  timeout: config.requestTimeout,
});

function errorMessage(error) {
  const data = error.response?.data;
  if (data && typeof data === 'object') {
    return data.error?.message || data.message || data.msg || '';
  }
  return '';
}

function redirectToLogin() {
  const current = router.currentRoute.value;
  if (current.name === 'login') return;
  router.push({
    name: 'login',
    query: config.recordRoute ? { redirect: current.fullPath } : {},
  });
}

async function clearSession() {
  removeToken();
  removeRefreshToken();
  const { useUserStore } = await import('@/stores/modules/user');
  useUserStore().resetSession();
  redirectToLogin();
}

let refreshing = null;

function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return Promise.reject(new Error('登录已失效'));
  if (!refreshing) {
    refreshing = axios
      .post(`${request.defaults.baseURL}/admin-api/v1/auth/refresh`, { refresh_token: refreshToken })
      .then(async ({ data }) => {
        setToken(data.access_token);
        setRefreshToken(data.refresh_token);
        const { useUserStore } = await import('@/stores/modules/user');
        useUserStore().setToken(data.access_token);
        return data.access_token;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

request.interceptors.request.use(
  (req) => {
    const token = getToken();
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  },
  (error) => Promise.reject(error),
);

request.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const status = error.response?.status;
    const message = errorMessage(error) || (error.response ? '请求失败' : '网络异常');
    const original = error.config || {};
    const isAuthRequest = String(original.url || '').includes('/auth/');

    if (status === 401 && !original._retry && !isAuthRequest && getRefreshToken()) {
      original._retry = true;
      try {
        const token = await refreshAccessToken();
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${token}`;
        return request(original);
      } catch (refreshError) {
        await clearSession();
        return Promise.reject(refreshError);
      }
    }

    if (status === 401 && !isAuthRequest) {
      await clearSession();
    }

    const skipMessage = original.skipErrorMessage;
    if (!skipMessage && message && (status !== 401 || isAuthRequest)) {
      ElMessage({ message, type: 'error' });
    }

    return Promise.reject(error);
  },
);

export default request;
