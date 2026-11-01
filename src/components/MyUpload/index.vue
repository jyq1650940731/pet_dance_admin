<template>
  <div>
    <div class="media-uploader">
      <!-- 预览图片/占位图标 -->
      <template v-if="modelValue && mediaType === 'image'">
        <img :src="uploadValue" class="avatar" alt="封面预览" />
        <div
          class="delete-btn"
          @click.stop="handleDelete"
          :disabled="disabled || loading"
        >
          <el-icon class="delete-icon"><Close /></el-icon>
        </div>
      </template>

      <!-- 视频预览 + 删除按钮 -->
      <template v-else-if="modelValue && mediaType === 'video'">
        <video :src="uploadValue" class="media-preview video-preview" alt="视频预览" />
        <div
          class="delete-btn"
          @click.stop="handleDelete"
          :disabled="disabled || loading"
        >
          <el-icon class="delete-icon"><Close /></el-icon>
        </div>
      </template>

      <!-- 音频预览 + 删除按钮 -->
      <template v-else-if="modelValue && mediaType === 'audio'">
        <div class="audio_avatar">
          <img alt="音频预览" src="@/assets/images/audio.png" />
          <div>myAudio</div>
        </div>
        <div
          class="delete-btn"
          @click.stop="handleDelete"
          :disabled="disabled || loading"
        >
          <el-icon class="delete-icon"><Close /></el-icon>
        </div>
      </template>

      <!-- 占位图标 -->
      <el-icon v-else class="upload-icon">
        <component :is="iconComponent" />
      </el-icon>

      <!-- 上传中 loading 遮罩层 -->
      <div v-if="loading" class="upload-loading">
        <el-icon class="loading-icon"><Loading /></el-icon>
      </div>

      <!-- 核心修复：上传按钮（确保覆盖整个容器，可点击） -->
      <el-upload
        class="upload-input"
        :action="baseURL + uploadUrl"
        :show-file-list="false"
        :before-upload="handleBeforeUpload"
        :on-success="handleUploadSuccess"
        :with-credentials="true"
        :on-error="handleUploadError"
        :headers="uploadHeaders"
        :disabled="disabled || loading"
        :accept="finalAccept.join(',')"
      >
        <!-- 必须添加空的<template>：el-upload需要插槽承载上传按钮 -->
        <template v-slot:default>
          <div class="upload-trigger"></div>
        </template>
      </el-upload>
    </div>
    <div v-if="tips" style="color: #999">{{ tips }}</div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import config from "@/config";
import { getToken } from "@/utils/token";
import { Loading, Headset, VideoCamera, Picture, Close } from "@element-plus/icons-vue";
const baseURL = import.meta.env.VITE_APP_BASE_API;

const props = defineProps({
  viewMode: {
    type: Boolean,
    default: false,
  },
  tips: { type: String, default: "" },
  modelValue: { type: String, default: "" },
  uploadUrl: {
    type: String,
    default: "/common/upload_img",
  },
  mediaType: {
    type: String,
    required: true,
    validator: (v) => ["image", "video", "audio"].includes(v),
  },
  headers: {
    type: Object,
    default: () => ({}),
  },
  accept: { type: Array, default: () => [] },
  maxSize: {
    type: Number,
    default: 0,
  },
  size: { type: Number, default: 120 },
  disabled: { type: Boolean, default: false },
  // 新增：是否需要调用远程删除接口
  needRemoteDelete: {
    type: Boolean,
    default: false,
  },
  // 新增：远程删除接口地址
  deleteUrl: {
    type: String,
    default: "/common/delete_file",
  },
  // 新增：删除接口的参数名（默认传url）
  deleteParamKey: {
    type: String,
    default: "url",
  },
});

const emit = defineEmits([
  "update:modelValue",
  "upload-success",
  "upload-error",
  "before-upload",
  // 新增：删除成功/失败的事件透传
  "delete-success",
  "delete-error",
]);

const loading = ref(false);
const uploadHeaders = computed(() => ({
  ...props.headers,
  ...(getToken() ? { [config.tokenName]: getToken() } : {}),
}));

// 根据媒体类型匹配图标
const iconComponent = computed(() => {
  switch (props.mediaType) {
    case "image":
      return Picture;
    case "video":
      return VideoCamera;
    case "audio":
      return Headset;
    default:
      return Picture;
  }
});

// 默认支持的文件格式
const defaultAccept = computed(() => {
  switch (props.mediaType) {
    case "image":
      return ["image/jpeg", "image/png", "image/webp"];
    case "video":
      return ["video/mp4", "video/mov", "video/avi"];
    case "audio":
      return ["audio/mp3", "audio/wav", "audio/m4a", "audio/mpeg"];
    default:
      return [];
  }
});

// 处理预览地址
const uploadValue = computed(() => {
  let value = props.modelValue;
  return value;
  // if (!value || !config.baseStaticURL) return value;
  // console.log(value, config.baseStaticURL);

  // return value.includes(config.baseStaticURL) ? value : `${config.baseStaticURL}${value}`; // 补全静态资源前缀
});

// 最终支持的文件格式
const finalAccept = computed(() => {
  return props.accept.length > 0 ? props.accept : defaultAccept.value;
});

// 默认大小限制
const defaultMaxSize = computed(() => {
  switch (props.mediaType) {
    case "image":
      return 5;
    case "video":
      return 100;
    case "audio":
      return 20;
    default:
      return 5;
  }
});

// 最终大小限制
const finalMaxSize = computed(() => {
  return props.maxSize > 0 ? props.maxSize : defaultMaxSize.value;
});

// 核心：完善的删除功能
const handleDelete = async () => {
  if (props.disabled || loading.value) return;

  try {
    // 1. 删除确认提示

    loading.value = true;

    // 2. 如果需要远程删除，先调用接口
    if (props.needRemoteDelete && props.modelValue) {
      const deleteParams = {
        [props.deleteParamKey]: props.modelValue,
      };

      const response = await fetch(baseURL + props.deleteUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...uploadHeaders.value,
        },
        body: JSON.stringify(deleteParams),
      });

      const resData = await response.json();
      const code = resData[config.statusName];

      // 远程删除失败
      if (!config.successCode.includes(code)) {
        ElMessage.error(resData.msg || `${props.mediaType}删除失败`);
        emit("delete-error", resData.msg || "删除失败");
        loading.value = false;
        return;
      }
    }

    // 3. 清空绑定值（核心）
    emit("update:modelValue", "");
    ElMessage.success(
      `${
        props.mediaType === "image"
          ? "图片"
          : props.mediaType === "video"
          ? "视频"
          : "音频"
      }删除成功`
    );
    emit("delete-success", props.modelValue);
  } catch (error) {
    // 捕获取消弹窗/接口异常
    if (error !== "cancel") {
      ElMessage.error(`删除失败：${error.message || "网络异常"}`);
      emit("delete-error", error);
    }
  } finally {
    loading.value = false;
  }
};

// 上传前校验
const handleBeforeUpload = (file) => {
  const beforeResult = emit("before-upload", file);
  if (beforeResult === false) return false;

  // 格式校验
  if (!finalAccept.value.includes(file.type)) {
    const typeText = finalAccept.value.map((type) => type.split("/")[1]).join("、");
    ElMessage.error(
      `${
        props.mediaType === "image"
          ? "图片"
          : props.mediaType === "video"
          ? "视频"
          : "音频"
      }仅支持${typeText}格式`
    );
    return false;
  }

  // 大小校验
  const fileSize = file.size / 1024 / 1024;
  const maxSize = finalMaxSize.value;
  if (fileSize > maxSize) {
    ElMessage.error(
      `${
        props.mediaType === "image"
          ? "图片"
          : props.mediaType === "video"
          ? "视频"
          : "音频"
      }大小不能超过${maxSize}MB`
    );
    return false;
  }

  loading.value = true;
  return true;
};

// 上传成功处理
const handleUploadSuccess = (response) => {
  loading.value = false;
  const code = response[config.statusName];
  console.log(config.statusName, response);

  if (config.successCode.includes(code)) {
    const imgUrl = response.data.url;
    emit("update:modelValue", imgUrl);
    emit("upload-success", imgUrl);
    ElMessage.success(
      `${
        props.mediaType === "image"
          ? "图片"
          : props.mediaType === "video"
          ? "视频"
          : "音频"
      }上传成功`
    );
  } else {
    const errMsg = response.msg || "上传失败，请重试";
    ElMessage.error(errMsg);
    emit("upload-error", errMsg);
  }
};

// 上传失败处理
const handleUploadError = (error) => {
  loading.value = false;
  console.log(error);
  const msg = JSON.parse(error.message)?.msg || "上传失败，请重试";
  console.log({ msg });
  ElMessage.error(msg);
  emit("upload-error", error);
};

defineOptions({
  name: "myUpload",
});
</script>

<style scoped lang="scss">
.media-uploader {
  position: relative;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
  transition: border-color 0.2s;
  pointer-events: auto;
  width: 120px;
  height: 120px;
}

.media-uploader:hover {
  border-color: #409eff;
}

.media-uploader-video {
  width: 200px;
  height: 130px;
}

/* 占位图标 */
.upload-icon {
  font-size: 28px;
  color: #8c939d;
  z-index: 0;
}

/* 预览图片 */
.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0; /* 低于上传按钮 */
}

.audio_avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
.audio_avatar img {
  margin-top: 8px;
  width: 60%;
  height: 60%;
}

/* 核心修复：上传触发层（覆盖整个容器，可点击） */
.upload-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%; /* 铺满容器宽度 */
  height: 100%; /* 铺满容器高度 */
  opacity: 0; /* 透明隐藏 */
  cursor: pointer;
  z-index: 10; /* 高于预览/图标，确保能触发 */
  /* 关键：允许点击事件 */
  pointer-events: auto;
}

/* 删除按钮样式优化 */
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
  z-index: 20; /* 高于上传按钮，确保可点击 */
  opacity: 0;
  transition: opacity 0.2s, background-color 0.2s;
  /* 禁用状态样式 */
  &:disabled {
    cursor: not-allowed;
    background-color: #ccc;
  }
}

.media-uploader:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover:not(:disabled) {
  background-color: #ff7875;
}

.delete-icon {
  font-size: 12px;
}

/* 插槽容器：必须有，否则el-upload的上传按钮不生效 */
:deep() {
  .el-upload {
    width: 100%;
    height: 100%;
  }
}

.upload-trigger {
  width: 100%;
  height: 100%;
}

/* 媒体预览通用样式 */
.media-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

/* 视频/音频预览适配 */
.video-preview {
  object-fit: contain; /* 视频保持比例，不拉伸 */
  background-color: #000;
}
.audio-preview {
  height: 60px; /* 音频控件高度适配 */
}

.upload-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20; /* 高于所有元素 */
}

.loading-icon {
  font-size: 32px;
  color: var(--el-color-primary);
  animation: el-icon-rotate 2s linear infinite;
}

/* 禁用状态 */
.media-uploader:has(.upload-input[disabled]) {
  cursor: not-allowed;
  background-color: #f5f5f5;
  border-color: #e5e5e5;
}
.media-uploader:has(.upload-input[disabled]) .upload-icon {
  color: #ccc;
}
</style>
