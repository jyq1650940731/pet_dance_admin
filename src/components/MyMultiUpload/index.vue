<template>
  <div class="multi-image-uploader">
    <!-- 多图片预览列表 -->
    <div class="image-list">
      <!-- 已上传图片项 -->
      <div
        v-for="(imgUrl, index) in imageList"
        :key="index"
        class="image-item"
        :style="{ width: `${size}px`, height: `${size}px` }"
      >
        <!-- 图片预览 -->
        <el-image
          class="image-preview"
          :src="imgUrl"
          :preview-src-list="imageList"
          :initial-index="index"
          preview-teleported="true"
        />
        <!-- 删除按钮 -->
        <div class="delete-btn" @click.stop="handleDelete(index)">
          <el-icon class="delete-icon"><Close /></el-icon>
        </div>
      </div>

      <!-- 上传按钮项 -->
      <div
        class="upload-btn"
        :style="{ width: `${size}px`, height: `${size}px` }"
        :class="{
          disabled: disabled || loading || (maxCount > 0 && imageList.length >= maxCount),
        }"
      >
        <!-- 占位图标 -->
        <el-icon v-if="!loading" class="upload-icon"><Picture /></el-icon>
        <!-- 上传中loading -->
        <div v-if="loading" class="loading-mask">
          <el-icon class="loading-icon"><Loading /></el-icon>
        </div>
        <!-- 上传核心组件 -->
        <el-upload
          class="upload-input"
          :action="baseURL + uploadUrl"
          :show-file-list="false"
          :before-upload="handleBeforeUpload"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :headers="uploadHeaders"
          :disabled="
            disabled || loading || (maxCount > 0 && imageList.length >= maxCount)
          "
          :accept="accept.join(',')"
          multiple
        >
          <template #default>
            <div class="upload-trigger"></div>
          </template>
        </el-upload>
      </div>
    </div>
  </div>
</template>

<script setup>
import { isEqual } from "@/utils/validate";
import config from "@/config";
import { getToken } from "@/utils/token";
import { Loading, Picture, Close } from "@element-plus/icons-vue";

// 基础配置
const baseURL = import.meta.env.VITE_APP_BASE_API;

// Props定义
const props = defineProps({
  // 双向绑定：多图片路径数组
  modelValue: {
    type: Array,
    default: () => [],
  },
  // 上传接口地址
  uploadUrl: {
    type: String,
    default: "/common/upload_img",
  },
  // 请求头（如token）
  headers: {
    type: Object,
    default: () => ({}),
  },
  // 支持的图片格式
  accept: {
    type: Array,
    default: () => ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },
  // 单张图片最大体积（MB）
  maxSize: {
    type: Number,
    default: 5,
  },
  // 单个图片预览尺寸（宽高一致）
  size: {
    type: Number,
    default: 120,
  },
  // 是否禁用上传
  disabled: {
    type: Boolean,
    default: false,
  },
  // 最大上传数量（0表示无限制）
  maxCount: {
    type: Number,
    default: 0,
  },
});

const uploadHeaders = computed(() => ({
  ...props.headers,
  ...(getToken() ? { [config.tokenName]: getToken() } : {}),
}));

// 事件派发
const emit = defineEmits([
  "update:modelValue",
  "upload-success", // 单张上传成功
  "upload-error", // 上传失败
  "delete-file", // 删除图片
  "preview-file", // 预览图片
]);

// 内部状态
const loading = ref(false); // 上传中loading
const imageList = ref([...props.modelValue]); // 图片列表
const previewVisible = ref(false); // 预览弹窗显示状态
const previewUrl = ref(""); // 预览图片地址

// 双向绑定：监听父组件值变化
watch(
  () => props.modelValue,
  (newVal) => {
    imageList.value = Array.isArray(newVal) ? [...newVal] : [];
  },
  { immediate: true }
);

// 监听内部列表变化，同步到父组件
watch(
  () => imageList.value,
  (newVal) => {
    // 关键：对比新值与父组件原值，仅不同时才同步（使用 isEqual 做深度对比）
    const oldVal = props.modelValue;
    const normalizedOldVal = Array.isArray(oldVal) ? oldVal : [];

    // 避免空数组/相同值重复 emit
    if (!isEqual(newVal, normalizedOldVal)) {
      emit("update:modelValue", [...newVal]);
    }
  },
  { deep: true, flush: "post" } // 新增：flush: "post" 延迟执行，避免即时循环
);

// 最终单张图片大小限制
const finalMaxSize = computed(() => (props.maxSize > 0 ? props.maxSize : 5));

// 预览图片
const handlePreview = (imgUrl) => {
  previewUrl.value = imgUrl;
  previewVisible.value = true;
  emit("preview-file", imgUrl);
};

// 删除单张图片
const handleDelete = (index) => {
  const deletedUrl = imageList.value.splice(index, 1)[0];
  emit("delete-file", deletedUrl, index);
  ElMessage.success("图片已删除");
};

// 上传前校验
const handleBeforeUpload = (file) => {
  // 数量限制校验
  if (props.maxCount > 0 && imageList.value.length >= props.maxCount) {
    ElMessage.error(`最多只能上传${props.maxCount}张图片`);
    return false;
  }

  // 格式校验
  if (!props.accept.includes(file.type)) {
    const typeText = props.accept.map((type) => type.split("/")[1]).join("、");
    ElMessage.error(`仅支持上传${typeText}格式的图片`);
    return false;
  }

  // 大小校验
  const fileSize = file.size / 1024 / 1024;
  if (fileSize > finalMaxSize.value) {
    ElMessage.error(`单张图片大小不能超过${finalMaxSize.value}MB`);
    return false;
  }

  loading.value = true;
  return true;
};

// 上传成功回调
const handleUploadSuccess = (response) => {
  loading.value = false;
  const code = response[config.statusName];

  if (config.successCode.includes(code)) {
    console.log({ response });

    const imgUrl = response.data.url;
    if (imgUrl) {
      imageList.value.push(imgUrl);
      emit("upload-success", imgUrl, [...imageList.value]);
      ElMessage.success("图片上传成功");
    }
  } else {
    const errMsg = response.msg || "图片上传失败，请重试";
    ElMessage.error(errMsg);
    emit("upload-error", errMsg);
  }
};

// 上传失败回调
const handleUploadError = (error) => {
  loading.value = false;
  ElMessage.error("网络异常，图片上传失败");
  emit("upload-error", error);
};

defineOptions({
  name: "myMultiUpload",
});
</script>

<style scoped>
/* 组件容器 */
.multi-image-uploader {
  width: 100%;
  box-sizing: border-box;
}

/* 图片列表：流式布局，自动换行 */
.image-list {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: flex-start;
}

/* 单个图片项 */
.image-item {
  position: relative;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
}

/* 上传按钮项 */
.upload-btn {
  position: relative;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  background-color: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* 上传按钮hover效果 */
.upload-btn:hover:not(.disabled) {
  border-color: #409eff;
  background-color: #f0f8ff;
}

/* 禁用状态 */
.upload-btn.disabled {
  cursor: not-allowed;
  background-color: #f5f5f5;
  border-color: #e5e5e5;
}

/* 占位图标 */
.upload-icon {
  font-size: 28px;
  color: #8c939d;
  z-index: 1;
}

/* 禁用状态下的图标 */
.upload-btn.disabled .upload-icon {
  color: #ccc;
}

/* 图片预览样式 */
.image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: opacity 0.2s;
}

.image-item:hover .image-preview {
  opacity: 0.85;
}

/* 删除按钮 */
.delete-btn {
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: #ff4d4f;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-item:hover .delete-btn {
  opacity: 1;
}

.delete-icon {
  font-size: 12px;
}

/* 上传触发层：透明覆盖 */
.upload-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 5;
  pointer-events: auto;
}

:deep(.el-upload) {
  width: 100%;
  height: 100%;
}

.upload-trigger {
  width: 100%;
  height: 100%;
}

/* 上传中loading遮罩 */
.loading-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-icon {
  font-size: 24px;
  color: var(--el-color-primary);
  animation: el-icon-rotate 2s linear infinite;
}

/* 预览弹窗图片 */
.preview-modal-img {
  width: 100%;
  height: auto;
  max-height: 80vh;
  object-fit: contain;
}
</style>
