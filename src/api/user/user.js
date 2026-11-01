import request from '@/utils/request';

const API = {
  LOGIN_URL: 'common/login',
  LOGOUT_URL: 'common/logout',
  UPDATE_PASSWORD: 'common/update_password',
  CAPTCHA: 'common/captcha',
}

export const captcha = () =>
  request({
    url: API.CAPTCHA,
    method: 'get',
  });

export const login = data =>
  request({
    url: API.LOGIN_URL,
    method: 'post',
    data,
  });

export const logout = () =>
  request({
    url: API.LOGOUT_URL,
    method: 'get',
  });

export const updatePassword = data =>
  request({
    url: API.UPDATE_PASSWORD,
    method: 'post',
    data,
  });
