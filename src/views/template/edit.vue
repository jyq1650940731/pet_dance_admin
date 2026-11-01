<template>
  <div class="edit-page" v-loading="loading">
    <el-button link type="primary" @click="goBack">返回模板</el-button>
    <h2>{{ isCreate ? "新建模板" : "编辑模板" }}</h2>
    <p class="hint">提示词只保存在服务端，App 接口不返回。</p>

    <div class="split">
      <div class="media">
        <div class="shot">
          <img v-if="coverPreview" :src="coverPreview" alt="封面" />
          <span v-else>封面</span>
        </div>
        <el-upload
          :show-file-list="false"
          accept="image/jpeg,image/png,image/webp"
          :http-request="uploadCover"
        >
          <el-button :loading="uploadingCover">上传封面</el-button>
        </el-upload>
        <div class="shot video">
          <video v-if="previewUrl" :src="previewUrl" controls />
          <span v-else>预览片</span>
        </div>
        <el-upload :show-file-list="false" accept="video/mp4" :http-request="uploadPreview">
          <el-button :loading="uploadingPreview">上传预览片</el-button>
        </el-upload>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" maxlength="40" />
        </el-form-item>
        <el-form-item label="副标题" prop="subtitle">
          <el-input v-model="form.subtitle" maxlength="200" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category">
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="时长" prop="duration_sec">
          <el-select v-model="form.duration_sec">
            <el-option
              v-for="item in durationOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="点数" prop="credit_cost">
          <el-input-number v-model="form.credit_cost" :min="1" :max="10000" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
        <el-form-item label="模型" prop="model">
          <el-select v-model="form.model" filterable allow-create>
            <el-option
              v-for="item in modelOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="供应商" prop="provider">
          <el-input v-model="form.provider" maxlength="32" />
        </el-form-item>
        <el-form-item label="音轨 ID" prop="audio_asset_id">
          <el-input v-model="form.audio_asset_id" placeholder="音轨库接口尚未提供，可填 UUID" />
        </el-form-item>
        <el-form-item label="适用" prop="pet_scope">
          <el-select v-model="form.pet_scope">
            <el-option
              v-for="item in petScopeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="提示词" prop="prompt">
          <el-input v-model="form.prompt" type="textarea" :rows="4" maxlength="4000" />
        </el-form-item>
        <el-form-item label="负向提示词" prop="negative_prompt">
          <el-input v-model="form.negative_prompt" type="textarea" :rows="3" maxlength="2000" />
        </el-form-item>
        <el-form-item>
          <el-button @click="submit('draft')">保存草稿</el-button>
          <el-button type="primary" @click="submit('published')">上架</el-button>
          <el-button v-if="!isCreate && form.status === 'published'" @click="submit('unpublished')">
            下架
          </el-button>
          <el-button v-if="!isCreate" link type="primary" @click="copyCurrent">复制为草稿</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import {
  createTemplate,
  duplicateTemplate,
  getTemplate,
  updateTemplate,
  uploadAdminFile,
} from "@/api/template";
import {
  categoryOptions,
  durationOptions,
  modelOptions,
  petScopeOptions,
} from "@/constant/template";

const route = useRoute();
const router = useRouter();
const formRef = ref();
const loading = ref(false);
const uploadingCover = ref(false);
const uploadingPreview = ref(false);
const coverPreview = ref("");
const previewUrl = ref("");

const isCreate = computed(() => route.name === "template/create");

const emptyForm = () => ({
  title: "",
  subtitle: "",
  category: "dance",
  duration_sec: 5,
  credit_cost: 10,
  sort: 0,
  provider: "kling",
  model: "kling-v2.5-turbo",
  prompt: "",
  negative_prompt: "",
  audio_asset_id: "",
  pet_scope: "any",
  cover_key: "",
  preview_key: "",
  status: "draft",
});

const form = reactive(emptyForm());

const rules = {
  title: [{ required: true, message: "请填写标题", trigger: "blur" }],
  category: [{ required: true, message: "请选择分类", trigger: "change" }],
  pet_scope: [{ required: true, message: "请选择适用宠物", trigger: "change" }],
  prompt: [{ required: true, message: "请填写提示词", trigger: "blur" }],
  negative_prompt: [{ required: true, message: "请填写负向提示词", trigger: "blur" }],
  audio_asset_id: [
    {
      validator: (_rule, value, callback) => {
        if (!value) {
          callback();
          return;
        }
        const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuid.test(value)) callback(new Error("请填写音轨 UUID"));
        else callback();
      },
      trigger: "blur",
    },
  ],
};

const goBack = () => router.push({ name: "template/list" });

const fillForm = (data) => {
  Object.assign(form, emptyForm(), {
    ...data,
    audio_asset_id: data.audio_asset_id || "",
    cover_key: data.cover_key || "",
    preview_key: data.preview_key || "",
  });
  coverPreview.value = data.cover_url || "";
  previewUrl.value = data.preview_url || "";
};

const load = async () => {
  if (isCreate.value) {
    Object.assign(form, emptyForm());
    coverPreview.value = "";
    previewUrl.value = "";
    return;
  }
  loading.value = true;
  try {
    fillForm(await getTemplate(route.params.id));
  } finally {
    loading.value = false;
  }
};

const uploadCover = async ({ file }) => {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    ElMessage.error("封面仅支持 jpg、png、webp");
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.error("封面不能超过 5MB");
    return;
  }
  uploadingCover.value = true;
  try {
    form.cover_key = await uploadAdminFile("cover", file);
    coverPreview.value = URL.createObjectURL(file);
    ElMessage.success("封面已上传");
  } finally {
    uploadingCover.value = false;
  }
};

const uploadPreview = async ({ file }) => {
  if (file.type !== "video/mp4") {
    ElMessage.error("预览片仅支持 mp4");
    return;
  }
  if (file.size > 30 * 1024 * 1024) {
    ElMessage.error("预览片不能超过 30MB");
    return;
  }
  uploadingPreview.value = true;
  try {
    form.preview_key = await uploadAdminFile("preview", file);
    previewUrl.value = URL.createObjectURL(file);
    ElMessage.success("预览片已上传");
  } finally {
    uploadingPreview.value = false;
  }
};

const payload = (status) => ({
  title: form.title,
  subtitle: form.subtitle,
  category: form.category,
  duration_sec: form.duration_sec,
  credit_cost: form.credit_cost,
  sort: form.sort,
  provider: form.provider,
  model: form.model,
  prompt: form.prompt,
  negative_prompt: form.negative_prompt,
  pet_scope: form.pet_scope,
  audio_asset_id: form.audio_asset_id || null,
  cover_key: form.cover_key || null,
  preview_key: form.preview_key || null,
  status,
});

const submit = async (status) => {
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;
  loading.value = true;
  try {
    const body = payload(status);
    if (isCreate.value) {
      const created = await createTemplate(body);
      ElMessage.success(status === "published" ? "已上架" : "已存为草稿");
      router.replace({ name: "template/edit", params: { id: created.id } });
      return;
    }
    fillForm(await updateTemplate(route.params.id, body));
    ElMessage.success(status === "published" ? "已上架" : status === "unpublished" ? "已下架" : "已保存");
  } finally {
    loading.value = false;
  }
};

const copyCurrent = async () => {
  const created = await duplicateTemplate(route.params.id);
  ElMessage.success("已复制为新草稿");
  router.push({ name: "template/edit", params: { id: created.id } });
};

watch(() => route.fullPath, load, { immediate: true });
</script>

<style scoped lang="scss">
.edit-page {
  padding: 16px;
}

h2 {
  margin: 8px 0;
}

.hint {
  margin: 0 0 16px;
  color: var(--el-text-color-secondary);
}

.split {
  display: grid;
  grid-template-columns: 220px minmax(0, 640px);
  gap: 24px;
}

.media {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.shot {
  aspect-ratio: 9 / 16;
  border-radius: 12px;
  background: #1c1917;
  color: #f6f2eb;
  display: grid;
  place-items: center;
  overflow: hidden;

  img,
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.video {
  max-height: 220px;
}
</style>
