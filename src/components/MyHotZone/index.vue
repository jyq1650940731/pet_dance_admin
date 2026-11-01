<template>
  <div class="hotspot-editor">
    <!-- 图片容器 -->
    <div
      ref="containerRef"
      class="image-container"
      :class="{ 'draw-mode': isDrawingMode }"
      @mousedown="handleContainerMouseDown"
      @mousemove="handleContainerMouseMove"
      @mouseup="handleContainerMouseUp"
      @mouseleave="handleContainerMouseLeave"
    >
      <img
        :src="url"
        alt="Hotspot image"
        ref="imageRef"
        @load="handleImageLoad"
        draggable="false"
      />

      <!-- 热区图层 - 所有已创建的热区 -->
      <div
        v-for="(hotspot, index) in modelValue"
        :key="index"
        class="hotspot"
        :class="{
          selected: selectedIndex === index,
          resizing: resizingIndex === index,
        }"
        :style="getHotspotStyle(hotspot)"
        @mousedown.stop="handleHotspotMouseDown($event, index)"
        @click.stop="handleHotspotClick(index)"
      >
        <!-- 热区序号 -->
        <span class="hotspot-index">{{ index + 1 }}</span>

        <!-- 调整大小的手柄（仅在选中时显示） -->
        <template v-if="selectedIndex === index && !isDrawingMode">
          <div
            v-for="direction in resizeHandles"
            :key="direction"
            class="resize-handle"
            :class="`handle-${direction}`"
            @mousedown.stop="handleResizeStart($event, index, direction)"
          ></div>
        </template>

        <!-- ✨ 删除按钮 - 每个热区右上角都有，独立显示 -->
        <button
          class="delete-btn"
          @click.stop="handleDeleteHotspot(index)"
          title="删除热区"
        >
          <svg viewBox="0 0 24 24" width="14" height="14">
            <path
              fill="currentColor"
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
            />
          </svg>
        </button>

        <!-- 显示热区尺寸（调试用，可删除） -->
        <span class="hotspot-size" v-if="selectedIndex === index">
          {{ Math.round(hotspot.width) }}×{{ Math.round(hotspot.height) }}
        </span>
      </div>

      <!-- 正在绘制的新热区 -->
      <div
        v-if="isDrawingMode && drawingHotspot"
        class="hotspot drawing"
        :style="getDrawingHotspotStyle()"
      ></div>
    </div>

    <!-- 控制面板 -->
    <div class="control-panel">
      <button
        @click="toggleDrawMode"
        :class="{ active: isDrawingMode }"
        :disabled="readonly"
      >
        <span v-if="!isDrawingMode">✏️ 绘制热区</span>
        <span v-else>✅ 完成绘制</span>
      </button>

      <button @click="handleClearAll" :disabled="modelValue.length === 0 || readonly">
        🗑️ 清空所有
      </button>

      <!-- <button
        v-if="selectedIndex !== -1"
        @click="handleDeleteSelected"
        class="danger-btn"
        :disabled="readonly"
      >
        ❌ 删除选中
      </button> -->

      <span class="info">
        共 {{ modelValue.length }} 个热区
        <!-- <span v-if="selectedIndex !== -1" class="selected-info">
          (选中第 {{ selectedIndex + 1 }} 号)
        </span> -->
      </span>
    </div>
  </div>
</template>

<script setup>
import { cloneDeep } from "lodash";
import { ref, watch, onMounted, onUnmounted } from "vue";

const props = defineProps({
  // 双向绑定的热区数据（纯px值）
  modelValue: {
    type: Array,
    default: () => [],
  },
  // 图片URL
  url: {
    type: String,
    required: true,
  },
  height: {
    type: String,
    default: "auto",
  },
  // 是否只读模式
  readonly: {
    type: Boolean,
    default: false,
  },
  // 最小热区尺寸（px）
  minSize: {
    type: Number,
    default: 10,
  },
});

const emit = defineEmits(["update:modelValue", "add", "select", "update", "delete"]);

// DOM 引用
const containerRef = ref(null);
const imageRef = ref(null);

// 组件状态
const imageRect = ref({ width: 0, height: 0, left: 0, top: 0 });
const selectedIndex = ref(-1);
const isDrawingMode = ref(false);
const drawingHotspot = ref(null);
const drawStart = ref(null);

// 拖拽调整状态
const isDragging = ref(false);
const dragStart = ref(null);
const dragIndex = ref(-1);

// 调整大小状态
const isResizing = ref(false);
const resizingIndex = ref(-1);
const resizeDirection = ref("");
const resizeStart = ref(null);
const resizeInitialHotspot = ref(null);

const resizeHandles = ["nw", "ne", "sw", "se"];

// 更新图片尺寸信息
const updateImageRect = () => {
  if (imageRef.value) {
    const rect = imageRef.value.getBoundingClientRect();
    imageRect.value = {
      width: rect.width,
      height: rect.height,
      left: rect.left,
      top: rect.top,
    };
  }
};

// 图片加载完成
const handleImageLoad = () => {
  updateImageRect();
};

// 获取相对于图片的坐标（返回px坐标）
const getAbsoluteCoordinates = (event) => {
  const rect = imageRef.value.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(rect.width, event.clientX - rect.left)),
    y: Math.max(0, Math.min(rect.height, event.clientY - rect.top)),
  };
};

// 检查坐标是否在热区内
const isPointInHotspot = (x, y, hotspot) => {
  return (
    x >= hotspot.x &&
    x <= hotspot.x + hotspot.width &&
    y >= hotspot.y &&
    y <= hotspot.y + hotspot.height
  );
};

// 处理容器鼠标按下（开始绘制）
const handleContainerMouseDown = (event) => {
  if (props.readonly) return;
  if (!isDrawingMode.value) return;
  if (event.button !== 0) return;

  const coord = getAbsoluteCoordinates(event);
  drawStart.value = coord;
  drawingHotspot.value = {
    x: coord.x,
    y: coord.y,
    width: 0,
    height: 0,
  };
};

// 处理容器鼠标移动（绘制中）
const handleContainerMouseMove = (event) => {
  if (!isDrawingMode.value || !drawStart.value || !drawingHotspot.value) return;

  const coord = getAbsoluteCoordinates(event);

  // 计算宽高（允许反向绘制）
  const x = Math.min(drawStart.value.x, coord.x);
  const y = Math.min(drawStart.value.y, coord.y);
  const width = Math.abs(coord.x - drawStart.value.x);
  const height = Math.abs(coord.y - drawStart.value.y);
  console.log("鼠标移动");
  drawingHotspot.value = { x, y, width, height };
};

// 处理容器鼠标松开（完成绘制）
const handleContainerMouseUp = () => {
  if (!isDrawingMode.value || !drawingHotspot.value) return;

  // 忽略太小的热区
  if (
    drawingHotspot.value.width >= props.minSize &&
    drawingHotspot.value.height >= props.minSize
  ) {
    // 创建新热区
    const newHotspot = { ...drawingHotspot.value };

    // 更新 v-model
    const newList = [...props.modelValue, newHotspot];
    emit("update:modelValue", newList);

    // 返回新增的热区数据
    emit("add", newHotspot);
    console.log(123456);

    // 自动选中新添加的热区
    selectedIndex.value = newList.length - 1;
    emit("select", { index: selectedIndex.value, hotspot: newHotspot });
  }

  // 重置绘制状态
  drawStart.value = null;
  drawingHotspot.value = null;
};

// 处理容器鼠标离开
const handleContainerMouseLeave = () => {
  if (isDrawingMode.value) {
    drawStart.value = null;
    drawingHotspot.value = null;
  }
};

// 处理热区点击
const handleHotspotClick = (index) => {
  if (props.readonly) return;

  selectedIndex.value = index;
  console.log("松开");

  emit("select", {
    index,
    hotspot: { ...props.modelValue[index] },
  });
};

// 处理热区鼠标按下（开始拖拽）
const handleHotspotMouseDown = (event, index) => {
  if (props.readonly || isDrawingMode.value) return;
  if (event.button !== 0) return;

  event.stopPropagation();

  console.log("按下");
  // 如果不是当前选中的，先选中
  if (selectedIndex.value !== index) {
    selectedIndex.value = index;
    emit("select", { index, hotspot: { ...props.modelValue[index] } });
  }

  // 记录拖拽开始
  const coord = getAbsoluteCoordinates(event);
  isDragging.value = true;
  dragIndex.value = index;
  dragStart.value = {
    x: coord.x - props.modelValue[index].x,
    y: coord.y - props.modelValue[index].y,
  };
};

// 处理开始调整大小
const handleResizeStart = (event, index, direction) => {
  if (props.readonly || isDrawingMode.value) return;

  event.stopPropagation();
  console.log("调整大小");
  isResizing.value = true;
  resizingIndex.value = index;
  resizeDirection.value = direction;
  resizeStart.value = getAbsoluteCoordinates(event);
  resizeInitialHotspot.value = { ...props.modelValue[index] };
};

// 全局鼠标移动事件（处理拖拽和调整大小）
const handleGlobalMouseMove = (event) => {
  // 处理拖拽移动
  if (isDragging.value && dragIndex.value !== -1 && dragStart.value) {
    const coord = getAbsoluteCoordinates(event);
    const hotspot = props.modelValue[dragIndex.value];
    const imgWidth = imageRect.value.width;
    const imgHeight = imageRect.value.height;

    // 计算新位置（保持鼠标在热区上的相对位置不变）
    let newX = coord.x - dragStart.value.x;
    let newY = coord.y - dragStart.value.y;

    // 边界限制 - 不能移出图片
    newX = Math.max(0, Math.min(imgWidth - hotspot.width, newX));
    newY = Math.max(0, Math.min(imgHeight - hotspot.height, newY));

    // 更新热区
    const updatedList = [...props.modelValue];
    updatedList[dragIndex.value] = {
      ...hotspot,
      x: Math.round(newX),
      y: Math.round(newY),
    };

    emit("update:modelValue", updatedList);
    emit("update", {
      index: dragIndex.value,
      hotspot: { ...updatedList[dragIndex.value] },
    });
  }

  // 处理调整大小
  if (
    isResizing.value &&
    resizingIndex.value !== -1 &&
    resizeStart.value &&
    resizeInitialHotspot.value
  ) {
    console.log("移动拖拽");
    const coord = getAbsoluteCoordinates(event);
    const hotspot = resizeInitialHotspot.value;
    const imgWidth = imageRect.value.width;
    const imgHeight = imageRect.value.height;

    let newX = hotspot.x;
    let newY = hotspot.y;
    let newWidth = hotspot.width;
    let newHeight = hotspot.height;

    // 根据方向计算新尺寸
    const dx = coord.x - resizeStart.value.x;
    const dy = coord.y - resizeStart.value.y;

    switch (resizeDirection.value) {
      case "nw":
        newX = Math.max(
          0,
          Math.min(hotspot.x + hotspot.width - props.minSize, hotspot.x + dx)
        );
        newY = Math.max(
          0,
          Math.min(hotspot.y + hotspot.height - props.minSize, hotspot.y + dy)
        );
        newWidth = hotspot.width + (hotspot.x - newX);
        newHeight = hotspot.height + (hotspot.y - newY);
        break;
      case "ne":
        newY = Math.max(
          0,
          Math.min(hotspot.y + hotspot.height - props.minSize, hotspot.y + dy)
        );
        newWidth = Math.max(props.minSize, Math.min(imgWidth - newX, hotspot.width + dx));
        newHeight = hotspot.height + (hotspot.y - newY);
        break;
      case "sw":
        newX = Math.max(
          0,
          Math.min(hotspot.x + hotspot.width - props.minSize, hotspot.x + dx)
        );
        newWidth = hotspot.width + (hotspot.x - newX);
        newHeight = Math.max(
          props.minSize,
          Math.min(imgHeight - newY, hotspot.height + dy)
        );
        break;
      case "se":
        newWidth = Math.max(props.minSize, Math.min(imgWidth - newX, hotspot.width + dx));
        newHeight = Math.max(
          props.minSize,
          Math.min(imgHeight - newY, hotspot.height + dy)
        );
        break;
    }

    // 确保宽高有效
    newWidth = Math.max(props.minSize, Math.min(imgWidth - newX, newWidth));
    newHeight = Math.max(props.minSize, Math.min(imgHeight - newY, newHeight));

    const updatedList = [...props.modelValue];
    const oldHotSpot = cloneDeep(props.modelValue);
    // console.log(oldHotSpot[resizingIndex.value]);
    const { x, y, width, height, ...rest } = oldHotSpot[resizingIndex.value];
    updatedList[resizingIndex.value] = {
      ...rest,
      x: Math.round(newX),
      y: Math.round(newY),
      width: Math.round(newWidth),
      height: Math.round(newHeight),
    };

    emit("update:modelValue", updatedList);
    emit("update", {
      index: resizingIndex.value,
      hotspot: { ...updatedList[resizingIndex.value] },
    });
  }
};

// 全局鼠标松开事件
const handleGlobalMouseUp = () => {
  isDragging.value = false;
  dragIndex.value = -1;
  dragStart.value = null;

  isResizing.value = false;
  resizingIndex.value = -1;
  resizeDirection.value = "";
  resizeStart.value = null;
  resizeInitialHotspot.value = null;
};

// 删除单个热区
const handleDeleteHotspot = (index) => {
  if (props.readonly) return;

  const deletedHotspot = { ...props.modelValue[index] };
  const newList = props.modelValue.filter((_, i) => i !== index);

  emit("update:modelValue", newList);
  emit("delete", { index, hotspot: deletedHotspot });

  if (selectedIndex.value === index) {
    selectedIndex.value = -1;
  } else if (selectedIndex.value > index) {
    selectedIndex.value--;
  }
};

// 删除选中的热区
const handleDeleteSelected = () => {
  if (selectedIndex.value !== -1) {
    handleDeleteHotspot(selectedIndex.value);
  }
};

// 清空所有热区
const handleClearAll = () => {
  if (props.readonly) return;

  emit("update:modelValue", []);
  selectedIndex.value = -1;
};

// 切换绘制模式
const toggleDrawMode = () => {
  if (props.readonly) return;
  isDrawingMode.value = !isDrawingMode.value;
  if (isDrawingMode.value) {
    selectedIndex.value = -1;
  }
};

// 获取热区样式
const getHotspotStyle = (hotspot) => {
  return {
    left: `${hotspot.x}px`,
    top: `${hotspot.y}px`,
    width: `${hotspot.width}px`,
    height: `${hotspot.height}px`,
    position: "absolute",
    border: "2px solid #409eff",
    backgroundColor: "rgba(64, 158, 255, 0.1)",
    cursor: isDrawingMode.value ? "crosshair" : "move",
    boxSizing: "border-box",
  };
};

// 获取绘制中的热区样式
const getDrawingHotspotStyle = () => {
  if (!drawingHotspot.value) return {};

  return {
    left: `${drawingHotspot.value.x}px`,
    top: `${drawingHotspot.value.y}px`,
    width: `${drawingHotspot.value.width}px`,
    height: `${drawingHotspot.value.height}px`,
    position: "absolute",
    border: "2px dashed #ff6b6b",
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    pointerEvents: "none",
    boxSizing: "border-box",
  };
};

// 监听窗口大小变化，更新图片尺寸
const handleResize = () => {
  updateImageRect();
};

// 监听模型变化
watch(
  () => props.modelValue.length,
  (newLen) => {
    if (selectedIndex.value >= newLen) {
      selectedIndex.value = -1;
    }
  }
);

// 生命周期
onMounted(() => {
  window.addEventListener("mousemove", handleGlobalMouseMove);
  window.addEventListener("mouseup", handleGlobalMouseUp);
  window.addEventListener("resize", handleResize);

  // 使用 ResizeObserver 监听图片尺寸变化
  if (imageRef.value) {
    const observer = new ResizeObserver(handleResize);
    observer.observe(imageRef.value);
  }
});

onUnmounted(() => {
  window.removeEventListener("mousemove", handleGlobalMouseMove);
  window.removeEventListener("mouseup", handleGlobalMouseUp);
  window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
.hotspot-editor {
  gap: 16px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  height: 100%;
}

.image-container {
  position: relative;
  display: inline-block;
  border: 1px solid #ddd;
  cursor: default;
  user-select: none;
  align-self: flex-start;
  max-width: 100%;
  height: 100%;
}

.image-container.draw-mode {
  cursor: crosshair;
}

.image-container img {
  display: block;
  max-width: 100%;
  height: 100%;
  pointer-events: none; /* 让点击事件穿透到容器 */
}

.hotspot {
  position: absolute;
  border: 2px solid #409eff;
  background-color: rgba(64, 158, 255, 0.1);
  cursor: move;
  box-sizing: border-box;
  transition: box-shadow 0.2s;
}

.hotspot.selected {
  border-color: #ff6b6b;
  background-color: rgba(255, 107, 107, 0.1);
  box-shadow: 0 0 0 2px rgba(255, 107, 107, 0.3);
}

.hotspot.drawing {
  border: 2px dashed #ff6b6b;
  background-color: rgba(255, 107, 107, 0.1);
  pointer-events: none;
}

/* 热区序号 */
.hotspot-index {
  position: absolute;
  top: -20px;
  left: 0;
  background: #409eff;
  color: white;
  font-size: 12px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  line-height: 1.2;
  z-index: 15;
}

.selected .hotspot-index {
  background: #ff6b6b;
}

/* 删除按钮 - 始终显示在右上角 */
.delete-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background-color: #ff4d4f;
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  z-index: 30;
  opacity: 0;
  transition: opacity 0.2s, transform 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.hotspot:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background-color: #ff7875;
  transform: scale(1.1);
}

.delete-btn svg {
  width: 14px;
  height: 14px;
}

/* 热区尺寸标签 */
.hotspot-size {
  position: absolute;
  bottom: -20px;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 11px;
  padding: 2px 4px;
  border-radius: 2px;
  white-space: nowrap;
  z-index: 15;
}

/* 调整手柄 */
.resize-handle {
  position: absolute;
  width: 12px;
  height: 12px;
  background-color: white;
  border: 2px solid #409eff;
  border-radius: 50%;
  z-index: 20;
  transition: transform 0.2s;
}

.resize-handle:hover {
  transform: scale(1.2);
  background-color: #409eff;
}

.handle-nw {
  top: -6px;
  left: -6px;
  cursor: nw-resize;
}

.handle-ne {
  top: -6px;
  right: -6px;
  cursor: ne-resize;
}

.handle-sw {
  bottom: -6px;
  left: -6px;
  cursor: sw-resize;
}

.handle-se {
  bottom: -6px;
  right: -6px;
  cursor: se-resize;
}

/* 控制面板 */
.control-panel {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  flex-wrap: wrap;
}

.control-panel button {
  padding: 8px 16px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background-color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.control-panel button:hover:not(:disabled) {
  border-color: #409eff;
  color: #409eff;
  background-color: #f0f7ff;
}

.control-panel button.active {
  background-color: #409eff;
  border-color: #409eff;
  color: white;
}

.control-panel button.danger-btn:hover:not(:disabled) {
  border-color: #ff4d4f;
  color: #ff4d4f;
  background-color: #fff1f0;
}

.control-panel button:disabled {
  background-color: #f8f9fa;
  border-color: #dee2e6;
  color: #adb5bd;
  cursor: not-allowed;
}

.control-panel .info {
  margin-left: auto;
  font-size: 14px;
  color: #495057;
  background: white;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.control-panel .selected-info {
  color: #ff6b6b;
  font-weight: 500;
  margin-left: 8px;
  padding-left: 8px;
  border-left: 2px solid #dee2e6;
}
</style>
