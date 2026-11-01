<template>
  <div class="logo-container logo-container-vertical">
    <router-link to="/">
      <span class="logo"><img src="@/assets/images/common/logo.jpg" /></span>
      <span class="title">{{ title }}</span>
    </router-link>
  </div>
</template>
<script setup>
import config from "@/config";
const { title } = config;
</script>
<style lang="scss" scoped>
@mixin container {
  position: relative;
  height: $base-header-height;
  overflow: hidden;
  line-height: $base-header-height;
  background: transparent;
}

@mixin logo {
  display: inline-block;
  width: 32px;
  height: 32px;
  color: $base-title-color;
  vertical-align: middle;
  fill: currentColor;
}

@mixin title {
  display: inline-block;
  margin-left: 8px;
  overflow: hidden;
  font-size: 20px;
  line-height: 55px;
  color: $base-title-color;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}

.logo-container {
  &-horizontal {
    @include container;

    .logo {
      svg,
      img {
        @include logo;
      }
    }

    .title {
      @include title;
    }
  }

  &-vertical {
    @include container;

    height: $base-logo-height;
    line-height: $base-logo-height;
    text-align: center;

    .logo {
      svg,
      img {
        @include logo;
      }
    }

    .title {
      @include title;
      max-width: calc(var(--el-left-menu-width) - 60px);
    }
  }

  &-column {
    background: $base-column-second-menu-background !important;

    .logo {
      position: fixed;
      top: 0;
      display: block;
      width: $base-left-menu-width-min;
      height: $base-logo-height;
      margin: 0;
      background: $base-column-first-menu-background;
    }

    .title {
      padding-right: 15px;
      padding-left: 15px;
      margin-left: $base-left-menu-width-min !important;
      color: var(--el-color-black) !important;
      background: $base-column-second-menu-background !important;
      @include title;
    }
  }
}
</style>
