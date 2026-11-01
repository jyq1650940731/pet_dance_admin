<template>
  <el-dialog
    :z-index="99"
    v-model="visible"
    :title="title"
    :width="width"
    :top="top"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape"
    :destroy-on-close="destroyOnClose"
    @close="handleClose"
  >
    <div class="lang_bar" v-if="isLangs">
      <!-- 遍历语言 -->
      <div
        v-for="(value, index) in langs"
        :key="index"
        class="lang_item"
        :class="{ lang_active: index === langIndex }"
        @click="handleLangChange(index)"
      >
        {{ value }}
      </div>
    </div>
    <div
      class="my_el_dialog"
      :style="`height: ${height}; max-height: ${maxHeight}`"
      v-loading="loading"
    >
      <!-- 弹窗主体内容插槽 -->
      <slot />
    </div>

    <!-- 弹窗底部按钮插槽（默认/自定义） -->
    <template #footer>
      <div class="dialog-footer">
        <!-- 自定义底部内容插槽 -->
        <slot name="footer">
          <el-button @click="handleCancel">
            {{ cancelText || "取消" }}
          </el-button>
          <el-button type="primary" @click="handleConfirm" :loading="loading">
            {{ confirmText || "确认" }}
          </el-button>
        </slot>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { langs, langsMode } from "@/constant/langs";

const props = defineProps({
  // 弹窗可见性（v-model绑定）
  modelValue: {
    type: Boolean,
    required: true,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  isLangs: {
    type: Boolean,
    default: false,
  }, // 是否显示语言切换
  // 弹窗标题
  title: {
    type: String,
    default: "提示",
  },
  // 弹窗宽度
  width: {
    type: [String, Number],
    default: undefined,
  },
  // 弹窗宽度
  height: {
    type: [String, Number],
    default: "auto",
  },
  maxHeight: {
    type: [String, Number],
    default: "650px",
  },
  // 弹窗顶部距离
  top: {
    type: String,
    default: "5vh",
  },
  // 点击遮罩层是否关闭
  closeOnClickModal: {
    type: Boolean,
    default: false,
  },
  // 按ESC是否关闭
  closeOnPressEscape: {
    type: Boolean,
    default: true,
  },
  // 关闭时销毁弹窗内容
  destroyOnClose: {
    type: Boolean,
    default: true,
  },
  // 取消按钮文字
  cancelText: {
    type: String,
    default: "取消",
  },
  // 确认按钮文字
  confirmText: {
    type: String,
    default: "确认",
  },
  // 是否显示默认底部按钮（为true时才会渲染默认取消/确认按钮）
  showDefaultFooter: {
    type: Boolean,
    default: true,
  },
});

// 定义事件
const emit = defineEmits([
  "update:modelValue", // v-model双向绑定事件
  "confirm", // 确认按钮点击事件
  "cancel", // 取消按钮点击事件
  "close", // 弹窗关闭事件（含遮罩/ESC/关闭按钮）
  "langsSwitch", // 语言切换事件
]);

const langIndex = ref(langsMode.ZH);
// 计算属性：简化v-model处理
const visible = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit("update:modelValue", val);
  },
});

const handleLangChange = (index) => {
  langIndex.value = index;
  emit("langsSwitch", langIndex.value);
};

// 处理确认按钮点击
const handleConfirm = () => {
  emit("confirm");
  langIndex.value = langsMode.ZH;
};

// 处理取消按钮点击
const handleCancel = () => {
  emit("cancel");
  visible.value = false;
  handleLangChange(langsMode.ZH);
};

// 处理弹窗关闭
const handleClose = () => {
  emit("close");
  handleLangChange(langsMode.ZH);
  emit("update:modelValue", false);
};

defineOptions({
  name: "myDialog",
});
</script>

<style lang="scss" scoped>
.my_el_dialog {
  overflow: auto;
}
.lang_bar {
  position: absolute;
  bottom: 20px;
  display: flex;
  left: 20px;
}
.lang_item {
  margin-right: 10px;
  cursor: pointer;
}
.lang_active {
  color: var(--el-color-primary);
}
.dialog-footer {
  text-align: right;

  :deep(.el-button) {
    margin-left: 8px;
  }
}
</style>
