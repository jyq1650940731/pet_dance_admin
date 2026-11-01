<template>
  <div class="template-page">
    <div class="toolbar">
      <el-select v-model="category" clearable placeholder="全部分类" style="width: 140px">
        <el-option
          v-for="item in categoryOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-select v-model="status" clearable placeholder="全部状态" style="width: 140px">
        <el-option
          v-for="item in statusOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
      <el-button type="primary" @click="goCreate">新建</el-button>
    </div>

    <el-table v-loading="loading" :data="items" border>
      <el-table-column label="封面" width="88">
        <template #default="{ row }">
          <el-image
            v-if="row.cover_url"
            :src="row.cover_url"
            fit="cover"
            class="cover"
          />
          <span v-else class="muted">无</span>
        </template>
      </el-table-column>
      <el-table-column label="标题" min-width="160">
        <template #default="{ row }">
          <el-button link type="primary" @click="goEdit(row.id)">{{ row.title }}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="分类" width="90">
        <template #default="{ row }">{{ labelOf(categoryOptions, row.category) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="statusTag(row.status)">{{ labelOf(statusOptions, row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column prop="credit_cost" label="点数" width="80" />
      <el-table-column prop="today_count" label="今日" width="80" />
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="goEdit(row.id)">编辑</el-button>
          <el-button link type="primary" @click="copyTemplate(row)">复制</el-button>
          <el-button
            v-if="row.status !== 'published'"
            link
            type="primary"
            @click="changeStatus(row, 'published')"
          >
            上架
          </el-button>
          <el-button
            v-else
            link
            type="primary"
            @click="changeStatus(row, 'unpublished')"
          >
            下架
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pager">
      <el-pagination
        background
        layout="total, prev, pager, next"
        :current-page="page"
        :page-size="PAGE_SIZE"
        :total="total"
        @current-change="onPageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { duplicateTemplate, listTemplates, updateTemplate } from "@/api/template";
import {
  PAGE_SIZE,
  categoryOptions,
  labelOf,
  statusOptions,
} from "@/constant/template";

const router = useRouter();
const category = ref("");
const status = ref("");
const page = ref(1);
const total = ref(0);
const items = ref([]);
const loading = ref(false);

const statusTag = (value) => {
  if (value === "published") return "success";
  if (value === "unpublished") return "info";
  return "warning";
};

const load = async () => {
  loading.value = true;
  try {
    const params = { page: page.value };
    if (category.value) params.category = category.value;
    if (status.value) params.status = status.value;
    const data = await listTemplates(params);
    items.value = data.items || [];
    total.value = data.total || 0;
  } finally {
    loading.value = false;
  }
};

const onPageChange = (value) => {
  page.value = value;
  load();
};

watch([category, status], () => {
  page.value = 1;
  load();
});

const goCreate = () => router.push({ name: "template/create" });
const goEdit = (id) => router.push({ name: "template/edit", params: { id } });

const copyTemplate = async (row) => {
  const created = await duplicateTemplate(row.id);
  ElMessage.success("已复制为新草稿");
  router.push({ name: "template/edit", params: { id: created.id } });
};

const changeStatus = async (row, nextStatus) => {
  await updateTemplate(row.id, { status: nextStatus });
  ElMessage.success(nextStatus === "published" ? "已上架" : "已下架");
  load();
};

onMounted(load);
</script>

<style scoped lang="scss">
.template-page {
  padding: 16px;
}

.toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.cover {
  width: 48px;
  height: 64px;
  border-radius: 6px;
}

.muted {
  color: var(--el-text-color-secondary);
}

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
</style>
