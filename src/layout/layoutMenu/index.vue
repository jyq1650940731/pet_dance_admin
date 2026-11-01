<template>
  <component :is="menuComponent" :index="currentPath" @click="onClick">
    <template #title>
      <el-icon>
        <component :is="item.meta?.icon"></component>
      </el-icon>
      <span :title="item.meta?.title">{{ item.meta?.title }}</span>
    </template>
    <template v-if="!isLeaf" #default>
      <layout-menu
        v-for="child in children"
        :key="child.name || child.path"
        :item="child"
        :base-path="currentPath"
      />
    </template>
  </component>
</template>
<script>
export default {
  name: "layoutMenu",
};
</script>
<script setup>
import { ElMenuItem, ElSubMenu } from "element-plus";
import router from "@/router";

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  basePath: {
    type: String,
    default: "",
  },
});

const resolvePath = (routePath = "") => {
  if (!routePath) return props.basePath || "/";
  if (routePath.startsWith("/")) return routePath;
  const base = props.basePath.endsWith("/")
    ? props.basePath.slice(0, -1)
    : props.basePath;
  return `${base}/${routePath}`.replace(/\/+/g, "/");
};

const children = computed(() =>
  (props.item.children || []).filter((child) => !child.meta?.hidden),
);
const isLeaf = computed(() => children.value.length <= 1);
const menuComponent = computed(() => (isLeaf.value ? ElMenuItem : ElSubMenu));
const currentPath = computed(() => {
  if (children.value.length === 1) {
    const childPath = children.value[0].path || '';
    const parentPath = resolvePath(props.item.path);
    if (!childPath) return parentPath;
    if (childPath.startsWith('/')) return childPath;
    return `${parentPath}/${childPath}`.replace(/\/+/g, '/');
  }
  return resolvePath(props.item.path);
});

const onClick = () => {
  if (!isLeaf.value) return;
  if (!currentPath.value || currentPath.value === router.currentRoute.value.path) return;
  router.push(currentPath.value);
};
</script>

<style lang="scss" scoped></style>
