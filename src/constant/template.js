export const categoryOptions = [
  { label: '推荐', value: 'recommend' },
  { label: '跳舞', value: 'dance' },
  { label: '搞怪', value: 'comedy' },
  { label: '日常', value: 'daily' },
]

export const statusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '上架', value: 'published' },
  { label: '下架', value: 'unpublished' },
]

export const petScopeOptions = [
  { label: '不限', value: 'any' },
  { label: '狗', value: 'dog' },
  { label: '猫', value: 'cat' },
]

export const durationOptions = [
  { label: '5 秒', value: 5 },
  { label: '10 秒', value: 10 },
]

export const modelOptions = [
  { label: 'kling-v2.5-turbo', value: 'kling-v2.5-turbo' },
  { label: 'kling-v3', value: 'kling-v3' },
]

export const labelOf = (options, value) =>
  options.find((item) => item.value === value)?.label || value || '—'

export const PAGE_SIZE = 20
