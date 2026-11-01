<template>
  <div class="pagination-table-container">
    <!-- 表格主体 -->
    <el-table
      v-loading="loading"
      border
      :data="tableData"
      :max-height="maxHeight"
      style="width: 100%"
      v-bind="$attrs"
    >
      <!-- 动态列 -->
      <template v-for="(column, index) in columns" :key="index">
        <!-- 自定义模板列 -->
        <el-table-column v-if="column.slotName" v-bind="column">
          <template #default="scope">
            <slot :name="column.slotName" :row="scope.row" :index="scope.index" />
          </template>
        </el-table-column>
        <!-- 普通列 -->
        <el-table-column v-else v-bind="column" />
      </template>

      <!-- 固定操作列（可选） -->
      <el-table-column
        v-if="showActionColumn"
        fixed="right"
        label="操作"
        :width="actionColumnWidth"
      >
        <template #default="scope">
          <slot name="action" :row="scope.row" :index="scope.index" />
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页控件 -->
    <div class="pagination-container" v-if="showPagination">
      <el-pagination
        :current-page="currentPage"
        :page-sizes="pageSizes"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup>
// 定义Props
const props = defineProps({
  // 表格数据
  tableData: {
    type: Array,
    required: true,
    default: () => [],
  },
  // 列配置
  columns: {
    type: Array,
    required: true,
    default: () => [],
  },
  // 总数
  total: {
    type: Number,
    required: true,
    default: 0,
  },
  // 加载状态
  loading: {
    type: Boolean,
    default: false,
  },
  // 当前页
  currentPage: {
    type: Number,
    default: 1,
  },
  // 页大小
  pageSize: {
    type: Number,
    default: 10,
  },
  // 页大小选项
  pageSizes: {
    type: Array,
    default: () => [10, 20, 50, 100, 200],
  },
  // 表格最大高度
  maxHeight: {
    type: [Number, String],
    default: "62vh",
  },
  // 是否显示分页
  showPagination: {
    type: Boolean,
    default: true,
  },
  // 是否显示操作列
  showActionColumn: {
    type: Boolean,
    default: true,
  },
  // 操作列宽度
  actionColumnWidth: {
    type: Number,
    default: 220,
  },
});

// 定义事件
const emit = defineEmits([
  "size-change", // 页大小改变
  "current-change", // 当前页改变
  "update:currentPage", // 更新当前页（v-model）
  "update:pageSize", // 更新页大小（v-model）
]);

// 处理页大小改变
const handleSizeChange = (val) => {
  emit("update:pageSize", val);
  emit("size-change", val);
};

// 处理当前页改变
const handleCurrentChange = (val) => {
  emit("update:currentPage", val);
  emit("current-change", val);
};

// 监听props变化，同步更新（兼容v-model）
watch(
  () => props.currentPage,
  (val) => {
    emit("update:currentPage", val);
  },
  { immediate: true }
);

watch(
  () => props.pageSize,
  (val) => {
    emit("update:pageSize", val);
  },
  { immediate: true }
);

defineOptions({
  name: "myPaginationTable",
});
</script>

<style lang="scss" scoped>
.pagination-table-container {
  width: 100%;
  padding-bottom: 15px;
  .pagination-container {
    margin-top: 16px;
    text-align: right;
  }
}
</style>
