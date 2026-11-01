<template>
  <div class="tinymce_wrap">
    <editor
      license-key="gpl"
      v-model="myValue"
      :init="initOptions"
      :disabled="!enabled"
      :id="tinymceId"
    ></editor>
  </div>
</template>

<script setup>
import axios from "axios";
import config from "@/config";
import { getToken } from "@/utils/token";
import "tinymce/tinymce";
import "tinymce/models/dom";
import "tinymce/themes/silver";
import "tinymce/icons/default";
import "tinymce/skins/ui/oxide/skin.css";
import contentUiCss from "tinymce/skins/ui/oxide/content.css?inline";
import contentCss from "tinymce/skins/content/default/content.css?inline";
import "tinymce/plugins/advlist";
import "tinymce/plugins/anchor";
import "tinymce/plugins/autolink";
import "tinymce/plugins/autoresize";
import "tinymce/plugins/charmap";
import "tinymce/plugins/code";
import "tinymce/plugins/codesample";
import "tinymce/plugins/directionality";
import "tinymce/plugins/emoticons";
import "tinymce/plugins/emoticons/js/emojis";
import "tinymce/plugins/fullscreen";
import "tinymce/plugins/image";
import "tinymce/plugins/insertdatetime";
import "tinymce/plugins/link";
import "tinymce/plugins/lists";
import "tinymce/plugins/nonbreaking";
import "tinymce/plugins/quickbars";
import "tinymce/plugins/searchreplace";
import "tinymce/plugins/table";
import "tinymce/plugins/visualblocks";
import "tinymce/plugins/visualchars";
import "tinymce/plugins/wordcount";
import Editor from "@tinymce/tinymce-vue";

// 定义事件
const emits = defineEmits(["update:modelValue", "setHtml"]);

// Props配置
const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  minHeight: {
    type: Number,
    default: 630,
  },
});

const tinymceId = ref(`vue-tinymce-${Date.now()}-${Math.floor(Math.random() * 1000)}`);

const initOptions = reactive({
  selector: `#${tinymceId.value}`,
  license_key: "gpl",
  skin: false,
  content_css: false,
  language: "zh-CN",
  language_url: `${import.meta.env.BASE_URL}tinymce/langs/zh_CN.js`,
  // 基础配置
  height: 600,
  min_height: props.minHeight,
  branding: false, // 隐藏Powered by TinyMCE
  promotion: false, // 隐藏升级提示
  menubar: "edit view insert format tools table",
  toolbar_mode: "wrap",
  // 插件来自本地 tinymce 包
  plugins:
    "image table lists wordcount emoticons code link advlist codesample autoresize quickbars nonbreaking searchreplace autolink directionality visualblocks visualchars charmap insertdatetime anchor fullscreen",
  toolbar:
    "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough ltr rtl | align numlist bullist | link image | table | lineheight outdent indent | forecolor backcolor removeformat | charmap emoticons | anchor codesample | fullscreen",
  // 功能配置
  paste_data_images: true,
  image_dimensions: false,
  convert_urls: false,
  link_default_target: "_blank",
  quickbars_insert_toolbar: "image codesample table",
  quickbars_image_toolbar:
    "alignleft aligncenter alignright | rotateleft rotateright | imageoptions",
  quickbars_selection_toolbar:
    "bold italic | quicklink h2 h3 blockquote quickimage quicktable",
  // 样式自定义
  font_family_formats:
    "Arial=arial,helvetica,sans-serif; 宋体=SimSun; 微软雅黑=Microsoft Yahei;",
  font_size_formats: "11px 12px 14px 16px 18px 24px 36px",
  content_style: [
    contentUiCss,
    contentCss,
    "body { font-family:Helvetica,Arial,sans-serif; font-size:16px }p {margin:3px; line-height:24px;}",
  ].join("\n"),
  // 图片上传（保留你的逻辑）
  images_upload_handler: async (blobInfo, progress) => {
    try {
      const file = blobInfo.blob();
      if (file.size / 1024 / 1024 > 2) {
        throw new Error("上传失败，图片大小请控制在 2M 以内");
      }
      const formData = new FormData();
      formData.append("file", file);
      const token = getToken();
      const baseURL = import.meta.env.VITE_APP_BASE_API || "";
      const {
        data: { data, code },
      } = await axios.post(`${baseURL}/common/upload_img`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { [config.tokenName]: token } : {}),
        },
        onUploadProgress: (e) => progress(Math.round((e.loaded / e.total) * 100)),
      });
      if (code !== 0) throw new Error("上传失败，服务器返回错误");
      if (!data?.url) throw new Error("上传失败，未返回图片地址");
      return data.url;
    } catch (err) {
      throw new Error(err.message || "图片上传失败");
    }
  },
});

// 双向绑定
const myValue = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    console.log({ val });

    emits("update:modelValue", val);
  },
});

// 监听只读状态
watch(
  () => props.readonly,
  (newVal) => {
    nextTick(() => {
      const editor = window.tinymce?.get(tinymceId.value);
      if (editor) {
        editor.mode.set(newVal ? "readonly" : "design");
        const iframe = document.querySelector(
          `#${tinymceId.value} ~ .tox-editor-container iframe`
        );
        if (iframe) iframe.contentWindow.document.body.style.margin = newVal ? 0 : "16px";
      }
    });
  },
  { immediate: true }
);

// 监听内容变化
watch(
  () => myValue.value,
  (val) => {
    const editor = window.tinymce?.get(tinymceId.value);
    emits("setHtml", editor?.getContent({ format: "text" }) || "", val);
  },
  { deep: true, flush: "post" }
);

// 销毁编辑器（防止内存泄漏）
onUnmounted(() => {
  const editor = window.tinymce?.get(tinymceId.value);
  if (editor) {
    editor.destroy();
  }
});

// 暴露方法
const handleSetContent = (content) => {
  const editor = window.tinymce?.get(tinymceId.value);
  if (editor) editor.setContent(content);
};

const handleGetContent = () => {
  const editor = window.tinymce?.get(tinymceId.value);
  return editor ? editor.getContent() : "";
};

defineExpose({ handleSetContent, handleGetContent });
</script>

<style lang="scss" scoped>
.tinymce_wrap {
  width: 720px;
  min-height: 630px;
}
:deep(.tox-tinymce) {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  .tox-statusbar {
    display: none;
  }
}
</style>
