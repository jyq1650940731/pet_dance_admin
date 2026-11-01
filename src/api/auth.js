import request from '@/utils/request';

export const login = (data) =>
  request({
    url: '/admin-api/v1/auth/login',
    method: 'post',
    data,
  });

export const refreshToken = (refresh_token) =>
  request({
    url: '/admin-api/v1/auth/refresh',
    method: 'post',
    data: { refresh_token },
  });

export const logout = (refresh_token) =>
  request({
    url: '/admin-api/v1/auth/logout',
    method: 'post',
    data: { refresh_token },
    skipErrorMessage: true,
  });
