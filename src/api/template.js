import axios from 'axios';
import request from '@/utils/request';

export const listTemplates = (params) =>
  request({
    url: '/admin-api/v1/templates',
    method: 'get',
    params,
  });

export const getTemplate = (id) =>
  request({
    url: `/admin-api/v1/templates/${id}`,
    method: 'get',
  });

export const createTemplate = (data) =>
  request({
    url: '/admin-api/v1/templates',
    method: 'post',
    data,
  });

export const updateTemplate = (id, data) =>
  request({
    url: `/admin-api/v1/templates/${id}`,
    method: 'patch',
    data,
  });

export const duplicateTemplate = (id) =>
  request({
    url: `/admin-api/v1/templates/${id}/duplicate`,
    method: 'post',
  });

export async function uploadAdminFile(kind, file) {
  const ticket = await request({
    url: '/admin-api/v1/uploads',
    method: 'post',
    data: {
      kind,
      content_type: file.type,
      content_length: file.size,
    },
  });
  await axios.put(ticket.upload_url, file, {
    headers: ticket.headers,
  });
  return ticket.key;
}
