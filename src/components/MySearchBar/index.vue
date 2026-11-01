<template>
  <div class="search_bar">
    <!-- 动态渲染搜索项 -->
    <el-space wrap :size="14">
      <template v-for="(item, index) in searchConfig" :key="index || item.prop">
        <el-row v-if="!item.hidden">
          <el-col :span="item.labelCol || 7">
            <div class="grid-content">{{ item.label }}：</div>
          </el-col>
          <el-col :span="item.inputCol || 17">
            <!-- 选择器 -->
            <el-select
              v-if="item.type === 'select'"
              v-model="localForm[item.prop]"
              :filterable="item.filterable || false"
              :placeholder="item.placeholder"
              @change="handleInputChange(item.prop)"
              filterable
              clearable
            >
              <el-option
                v-for="option in item.options"
                :key="option.value || option.id"
                :label="option.label || option.name"
                :value="option.value || option.id || option.index?.toString()"
              />
            </el-select>

            <!-- 输入框 -->
            <el-input
              v-else-if="item.type === 'input'"
              v-model="localForm[item.prop]"
              :placeholder="item.placeholder"
              :maxlength="item.maxlength"
              @input="handleInputChange(item.prop)"
              clearable
            />

            <!-- 数字输入框 -->
            <el-input-number
              v-else-if="item.type === 'number'"
              v-model="localForm[item.prop]"
              :placeholder="item.placeholder"
              :min="item.min"
              :max="item.max"
              @change="handleInputChange(item.prop)"
            />

            <!-- 自定义插槽（兼容特殊场景） -->
            <slot
              v-else
              :name="`item-${item.prop}`"
              :value="localForm[item.prop]"
              @update:value="(val) => handleSlotChange(item.prop, val)"
            />
          </el-col>
        </el-row>
      </template>
    </el-space>

    <!-- 动态渲染操作按钮 -->
    <div class="search_bar_btn">
      <template v-for="(btn, index) in buttonConfig" :key="index || btn.key">
        <el-button
          v-if="!btn.hidden"
          :type="btn.type || 'default'"
          :icon="btn.icon"
          :size="btn.size || 'large'"
          @click="handleButtonClick(btn.key)"
        >
          {{ btn.text }}
        </el-button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { Search, Plus, RefreshRight } from "@element-plus/icons-vue";

// 接收父组件配置
const props = defineProps({
  // 搜索项配置（核心）
  searchConfig: {
    type: Array,
    default: () => [],
  },
  // 按钮配置
  buttonConfig: {
    type: Array,
    default: () => [
      {
        key: "search", // 按钮唯一标识（用于事件触发）
        text: "查询", // 按钮文案
        type: "primary", // 按钮类型
        icon: Search, // 按钮图标
        size: "large", // 按钮尺寸
      },
      {
        key: "reset", // 重置按钮
        text: "重置",
        type: "default",
        icon: RefreshRight,
        size: "large",
      },
      {
        key: "add", // 新增按钮
        text: "新增",
        type: "primary",
        icon: Plus,
        size: "large",
      },
    ],
  },
  // 初始表单值
  defaultValue: {
    type: Object,
    default: () => ({}),
  },
});

// 定义事件
const emit = defineEmits([
  "search", // 查询事件（返回当前表单值）
  "reset", // 重置事件
  "change", // 表单值变化事件（返回当前表单值）
  // 自定义按钮事件：btn.key 作为事件名，如 'add'/'export'
  "btn-click",
]);

// 组件内部维护表单值（避免直接修改prop）
const localForm = reactive({});

// 初始化：同步父组件默认值到本地
const initLocalForm = () => {
  // 先清空本地表单
  Object.keys(localForm).forEach((key) => delete localForm[key]);
  // 初始化搜索项的默认值
  props.searchConfig.forEach((item) => {
    localForm[item.prop] = props.defaultValue[item.prop] ?? "";
  });
};

// 监听父组件默认值变化，实时同步
watch(
  () => props.defaultValue,
  () => initLocalForm(),
  { immediate: true, deep: true }
);

// 监听搜索配置变化，重新初始化
watch(
  () => props.searchConfig,
  () => initLocalForm(),
  { immediate: true, deep: true }
);

// 表单项变化事件
const handleInputChange = (prop) => {
  emit("change", toRaw(localForm));
};

// 插槽值变化处理
const handleSlotChange = (prop, value) => {
  localForm[prop] = value;
  handleInputChange(prop);
};

// 按钮点击事件
const handleButtonClick = (key) => {
  switch (key) {
    case "search": // 查询按钮
      emit("search", toRaw(localForm));
      break;
    case "reset": // 重置按钮
      initLocalForm();
      emit("reset", toRaw(localForm));
      break;
    default:
      // 自定义按钮（如新增、导出）
      emit("btn-click", key, toRaw(localForm));
      break;
  }
};

// 暴露方法给父组件
defineExpose({
  // 手动重置表单
  resetForm: initLocalForm,
  // 获取当前表单值
  getFormValue: () => toRaw(localForm),
});
</script>

<style lang="scss" scoped>
.search_bar {
  padding: $base-padding;
  border-bottom: 1px solid #e6e6e6;
  margin-bottom: 16px;

  .search_bar_btn {
    margin-top: 16px;
    display: flex;
    gap: 12px;
  }
}
</style>
