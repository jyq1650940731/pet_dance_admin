<template>
  <MyDialog
    :model-value="visible"
    @update:model-value="handleVisibleChange"
    :loading="loading"
    :title="title"
    @confirm="handleConfirm"
    @cancel="handleCancel"
    :width="width"
    :height="height"
    :isLangs="isLangs"
    @langsSwitch="onLangsSwitch"
  >
    <el-form
      ref="formRef"
      :model="innerFormData"
      :rules="rules"
      :label-width="labelWidth"
      style="padding-right: 20px"
      :style="formStyle"
    >
      <!-- 动态渲染表单项 -->
      <template
        v-for="(item, index) in formConfig"
        :key="`form-item-${item.prop || index}`"
      >
        <template v-if="!item.isEnLangs && !['input'].includes(item.type)">
          <el-form-item
            :label="item.label + '：'"
            :prop="item.prop"
            :rules="item.rules || rules[item.prop]"
            :disabled="item.disabled"
          >
            <!-- 标签输入框 -->
            <el-input-tag
              v-if="item.type === 'input-tag'"
              v-model="innerFormData[item.prop]"
              :placeholder="item.placeholder || '请输入标签，回车添加'"
              :disabled="item.disabled || item.disabledCondition?.(innerFormData)"
              :max="item.max"
              :style="[item.style, { width: '300px' }]"
            />

            <!-- 下拉选择器（优化：增加key确保重新渲染） -->
            <el-select
              v-else-if="item.type === 'select'"
              v-model="innerFormData[item.prop]"
              :placeholder="'请选择' + item.label"
              :disabled="item.disabled || item.disabledCondition?.(innerFormData)"
              :style="item.style"
              style="width: 300px"
              filterable
              clearable
              :key="`select-${item.prop}-${JSON.stringify(item.options)}`"
            >
              <!-- 空数据提示 -->
              <template v-if="!item.options || item.options.length === 0">
                <el-option label="暂无可选分类" value="" disabled />
              </template>
              <el-option
                v-for="option in item.options || []"
                :key="option.value || option.id || option.label"
                :label="option.label || option.name"
                :value="option.value || option.id"
              />
            </el-select>

            <!-- 数字输入框 -->
            <el-input-number
              v-else-if="item.type === 'number'"
              v-model="innerFormData[item.prop]"
              :placeholder="item.placeholder"
              :disabled="item.disabled || item.disabledCondition?.(innerFormData)"
              :min="item.min"
              :max="item.max"
              :style="item.style"
              :precision="item.precision"
              :value-formatter="(value) => (value === '' ? null : value)"
            />

            <!-- 开关 -->
            <el-switch
              v-else-if="item.type === 'switch'"
              v-model="innerFormData[item.prop]"
              :disabled="item.disabled || item.disabledCondition?.(innerFormData)"
              :active-text="item.activeText"
              :inactive-text="item.inactiveText"
            />

            <!-- 单选框组 -->
            <el-radio-group
              v-else-if="item.type === 'radio'"
              v-model="innerFormData[item.prop]"
              :disabled="item.disabled || item.disabledCondition?.(innerFormData)"
            >
              <el-radio
                v-for="option in item.options || []"
                :key="option.value"
                :label="option.value"
              >
                {{ option.label }}
              </el-radio>
            </el-radio-group>

            <!-- 自定义插槽 -->
            <slot
              v-else
              :name="`item-${item.prop}`"
              :formData="innerFormData"
              :config="item"
              @update:field="(value) => (innerFormData[item.prop] = value)"
            />
          </el-form-item>
        </template>
        <template v-else-if="!item.isEnLangs && langsMode.ZH === langsType">
          <el-form-item
            :label="item.label + '：'"
            :prop="item.prop"
            :rules="item.rules || rules[item.prop]"
            :disabled="item.disabled"
          >
            <!-- 普通输入框 -->
            <el-input
              v-if="item.type === 'input'"
              v-model="innerFormData[item.prop]"
              :placeholder="item.placeholder || '请输入' + item.label"
              :disabled="item.disabled || item.disabledCondition?.(innerFormData)"
              :maxlength="item.maxlength"
              style="width: 300px"
              :style="item.style"
              clearable
            />
          </el-form-item>
        </template>
        <template v-else-if="item.isEnLangs && langsMode.EN === langsType">
          <el-form-item
            :label="item.label + '：'"
            :prop="item.prop"
            :rules="item.rules || rules[item.prop]"
            :disabled="item.disabled"
          >
            <el-input
              v-if="item.type === 'input'"
              v-model="innerFormData[item.prop]"
              :placeholder="item.placeholder || '请输入' + item.label"
              :disabled="item.disabled || item.disabledCondition?.(innerFormData)"
              :maxlength="item.maxlength"
              style="width: 300px"
              :style="item.style"
              clearable
            />
          </el-form-item>
        </template>
      </template>
      <!-- 额外自定义内容插槽 -->
      <slot name="extra" :formData="innerFormData" :langs="langsType" />
    </el-form>
  </MyDialog>
</template>

<script setup>
import { langsMode } from "@/constant/langs";
import { onMounted } from "vue";
// 接收外部配置
const props = defineProps({
  visible: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  title: { type: String, default: "" },
  width: { type: String, default: "auto" },
  height: { type: String, default: "auto" },
  formData: { type: Object, required: true },
  formConfig: { type: Array, default: () => [], required: true },
  rules: { type: Object, default: () => {} },
  labelWidth: { type: String, default: "130px" },
  formStyle: { type: String, default: "" },
  autoResetOnOpen: { type: Boolean, default: true },
  isLangs: { type: Boolean, default: false },
  initFormData: { type: Object, default: () => {} },
});

const emit = defineEmits([
  "update:visible",
  "confirm",
  "cancel",
  "validate-success",
  "update:formData",
  "tag-add",
  "tag-remove",
]);

// 核心：表单Ref
const formRef = ref(null);

// 内部表单数据
const innerFormData = reactive({});

// 存储表单空初始值
const emptyFormValue = ref({});
const langsType = ref(langsMode.ZH);

// 生成匹配类型的空值
const generateEmptyFormValue = () => {
  const emptyData = {};
  props.formConfig.forEach((item) => {
    switch (item.type) {
      case "input":
      case "select":
      case "radio":
        emptyData[item.prop] = undefined;
        break;
      case "number":
        emptyData[item.prop] = undefined;
        break;
      case "input-tag":
        emptyData[item.prop] = [];
        break;
      case "switch":
        emptyData[item.prop] = false;
        break;
      default:
        emptyData[item.prop] = undefined;
    }
  });
  emptyData.status = true;
  emptyFormValue.value = emptyData;
  return emptyData;
};

const onLangsSwitch = (langs) => {
  langsType.value = langs;
};

const setInitForm = () => {
  formRef.value.setInitialValues(props.initFormData);
};

// 监听formConfig变化（深度监听，确保options更新触发重新渲染）
watch(
  () => props.formConfig,
  (newConfig) => {
    generateEmptyFormValue();
    nextTick(() => {
      Object.assign(innerFormData, toRaw(props.formData));
      console.log({ innerFormData });
    });
  },
  { deep: true, immediate: true }
);

watch(
  () => props.formData,
  (newVal) => {
    if (newVal && Object.keys(newVal).length) {
      const newFormData = toRaw(newVal);
      // 处理select值类型匹配
      props.formConfig.forEach((item) => {
        if (item.type === "select" && newFormData[item.prop] !== undefined) {
          const firstOption = item.options?.[0];
          if (firstOption) {
            const optionValueType = typeof (firstOption.value || firstOption.id);
            if (typeof newFormData[item.prop] !== optionValueType) {
              if (optionValueType === "string") {
                newFormData[item.prop] = String(newFormData[item.prop]);
              } else if (optionValueType === "number") {
                newFormData[item.prop] = Number(newFormData[item.prop]);
              }
            }
          }
        }
      });
      Object.keys(innerFormData).forEach((key) => delete innerFormData[key]);
      Object.assign(innerFormData, newFormData);
    }
  },
  { immediate: true, deep: true }
);

// 表单校验逻辑
const validateForm = async () => {
  if (!formRef.value) return Promise.reject(false);
  try {
    await formRef.value.validate();
    const submitData = toRaw(innerFormData);
    emit("validate-success", submitData); // 传递最新数据
    return Promise.resolve(true);
  } catch (err) {
    return Promise.reject(false);
  }
};

// 弹窗事件处理
const handleVisibleChange = (newVisible) => {
  emit("update:visible", newVisible);
};

// 重写确认逻辑 - 核心：确保数据正确传递
const handleConfirm = async () => {
  try {
    const isValid = await validateForm();
    if (isValid) {
      const submitData = toRaw(innerFormData);
      emit("confirm", submitData); // 触发confirm事件
      formRef.value.resetFields();
      emit("update:visible", false); // 关闭弹窗
    }
  } catch (error) {
    console.error("表单校验失败:", error);
  }
};

// 取消逻辑
const handleCancel = async () => {
  console.log("取消");
  setInitForm();
  formRef.value.resetFields();
  emit("update:visible", false);
  emit("cancel");
};

// 初始化空值
generateEmptyFormValue();

onMounted(() => {
  // setInitForm();
});
// 暴露方法
defineExpose({
  validate: validateForm,
  clearValidate: () => formRef.value?.clearValidate(),
});
</script>

<style scoped>
:deep(.el-input-tag.is-disabled) {
  background-color: #f5f7fa;
  cursor: not-allowed;
}
:deep(.el-input-tag.is-disabled .el-tag) {
  background-color: #e4e7ed;
  border-color: #dcdfe6;
}
</style>
