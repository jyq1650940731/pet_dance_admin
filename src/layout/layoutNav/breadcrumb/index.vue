<template>
  <div>
    <el-breadcrumb separator-icon="ArrowRightBold">
      <template v-for="(item, index) in menuList">
        <el-breadcrumb-item v-if="item.meta?.icon" :key="item.path || index">
          <el-icon>
            <component :is="item.meta.icon"></component>
          </el-icon>
          {{ item.meta.title }}
        </el-breadcrumb-item>
      </template>
    </el-breadcrumb>
  </div>
</template>
<script setup>
defineProps(["menuList"]);
</script>
<style lang="scss" scoped>
:deep() {
  .el-breadcrumb__inner {
    display: flex;

    .el-icon {
      margin-right: 2px;
    }
  }
}
</style>
