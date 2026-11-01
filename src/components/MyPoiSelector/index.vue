<template>
  <!-- 仅保留核心交互树木，无el-form-item -->
  <div class="poi-selector-container">
    <!-- 经纬度输入框 + POI选点按钮 -->
    <div class="flex_base">
      <el-input
        v-model="innerLongitude"
        placeholder="请输入经度"
        clearable
        class="flex_input"
        @blur="handleLongitudeBlur"
      ></el-input>
      <el-input
        v-model="innerLatitude"
        placeholder="请输入纬度"
        clearable
        class="flex_input"
        @blur="handleLatitudeBlur"
      ></el-input>
      <el-button type="primary" @click="openPoiDialog">{{ buttonText }}</el-button>
    </div>

    <!-- POI选点弹窗 -->
    <MyDialog v-model="poiVisible" title="POI选点" @confirm="handlePoiConfirm">
      <!-- 传递唯一标识给iframe -->
      <iframe
        class="frame"
        title="POI选点页面"
        id="frame"
        name="frame"
        :src="iframeUrl"
      />
    </MyDialog>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed } from "vue";
import { ElMessage } from "element-plus";

const props = defineProps({
  longitude: {
    type: [String, Number],
    default: "",
  },
  latitude: {
    type: [String, Number],
    default: "",
  },
  buttonText: {
    type: String,
    default: "POI选点",
  },
  baseMapUrl: {
    type: String,
    default: `${window.location.origin}/iframe/poi.html`,
  },
});

const emit = defineEmits([
  "update:longitude",
  "update:latitude",
  "poi-address-change",
  "poi-select-success",
]);

// 生成组件唯一标识
const componentId = ref(`poi_${Date.now()}_${Math.floor(Math.random() * 10000)}`);

// 拼接iframe地址，传递唯一标识
const iframeUrl = computed(() => {
  const url = new URL(props.baseMapUrl);
  url.searchParams.set("componentId", componentId.value);
  return url.toString();
});

const poiVisible = ref(false);
const innerLongitude = ref(props.longitude + "");
const innerLatitude = ref(props.latitude + "");
const POI = ref({
  address: "",
  longitude: undefined,
  latitude: undefined,
});

// 同步外部props到内部输入框
watch(
  () => props.longitude,
  (val) => {
    innerLongitude.value = val + "";
  },
  { immediate: true }
);

watch(
  () => props.latitude,
  (val) => {
    innerLatitude.value = val + "";
  },
  { immediate: true }
);

const openPoiDialog = () => {
  poiVisible.value = true;
};

// 修改事件处理函数，只处理当前组件的事件
const setPoi = (e) => {
  // 验证事件是否属于当前组件
  if (!(e.detail && e.detail.componentId && e.detail.componentId === componentId.value)) {
    return;
  }

  if (!(e.detail && e.detail.lng && e.detail.lat)) return;

  POI.value.longitude = e.detail.lng;
  POI.value.latitude = e.detail.lat;
  POI.value.address = e.detail.address || "";

  innerLongitude.value = e.detail.lng + "";
  innerLatitude.value = e.detail.lat + "";
};

const handlePoiConfirm = () => {
  if (!POI.value.longitude || !POI.value.latitude) {
    ElMessage.error("请选择具体地址");
    return;
  }

  poiVisible.value = false;

  // 2. 更新经纬度 + 触发POI地址变更事件（携带地址信息）
  emit("update:longitude", POI.value.longitude);
  emit("update:latitude", POI.value.latitude);
  emit("poi-address-change", POI.value.address); // 仅POI选点时传递地址
  emit("poi-select-success");
  console.log(POI.value);
  ElMessage.success("POI地址选择成功");
};

// 3. 输入框失焦：仅更新经纬度，不再修改地址
const handleLongitudeBlur = () => {
  if (innerLongitude.value) {
    emit("update:longitude", innerLongitude.value);
  }
};

const handleLatitudeBlur = () => {
  if (innerLatitude.value) {
    emit("update:latitude", innerLatitude.value);
  }
};

onMounted(() => {
  // 监听全局amap事件
  document.addEventListener("amap", setPoi);
});

onBeforeUnmount(() => {
  // 移除事件监听，防止内存泄漏
  document.removeEventListener("amap", setPoi);
});

defineOptions({
  name: "myPoiSelector",
});
</script>

<style lang="scss" scoped>
.poi-selector-container {
  width: 100%;
}

.flex_base {
  display: flex;
  align-items: center;
  width: 100%;
}

.flex_input {
  width: 182px;
  margin-right: 10px;
}

.frame {
  display: block;
  width: 100%;
  height: 600px;
  margin: 0 auto;
  border: 0;
}

.my-modal-body {
  height: 70vh;
  overflow: auto;

  /* 自定义滚动条宽度 */
  &::-webkit-scrollbar {
    width: 8px; // 设置滚动条的宽度
  }

  /* 自定义滚动条的滑块 */
  &::-webkit-scrollbar-thumb {
    background-color: #666; // 滑块的颜色
    border-radius: 4px; // 滑块的圆角
    transition: background-color 0.3s; // 滑块颜色变化的过渡效果
  }

  /* 自定义滚动条的轨道 */
  &::-webkit-scrollbar-track {
    background-color: #f1f1f1; // 轨道的颜色
    border-radius: 4px; // 轨道的圆角
  }
}
</style>
