<template>
  <div class="layout_container">
    <div class="layout_slider" :class="{ 'is-collapse': userStore.isCollapse }">
      <logo></logo>
      <el-scrollbar class="vab-side-bar">
        <el-menu :default-active="activePath" :collapse="userStore.isCollapse">
          <layout-menu
            v-for="item in visibleRouteList"
            :key="item.name || item.path"
            :item="item"
          />
        </el-menu>
      </el-scrollbar>
    </div>
    <div class="layout_tabbar" :class="{ 'is-collapse': userStore.isCollapse }">
      <layout-nav></layout-nav>
    </div>
    <div class="layout_main" :class="{ 'is-collapse': userStore.isCollapse }">
      <div class="vab-app-main">
        <section>
          <router-view v-slot="{ Component }">
            <component :is="Component" v-if="isflag"></component>
          </router-view>
        </section>
        <foot></foot>
      </div>
    </div>
  </div>
</template>

<script setup name="Layout">
import foot from "./layoutFoot/index.vue";
import logo from "./logo/index.vue";
import layoutMenu from "./layoutMenu/index.vue";
import layoutNav from "./layoutNav/index.vue";
import { useRouterStore } from "@/stores/modules/router";
import { useLayoutStore } from "@/stores/modules/layout";
import { useUserStore } from "@/stores/modules/user";
import { useRoute } from "vue-router";
const route = useRoute();

const { routeList } = useRouterStore();
const visibleRouteList = computed(() =>
  (routeList || []).filter((item) => !item.meta?.hidden),
);
const useLayout = useLayoutStore();
const userStore = useUserStore();
const isflag = ref(true);

watch(
  () => useLayout.refsh,
  () => {
    isflag.value = false;
    nextTick(() => {
      isflag.value = true;
    });
  }
);
const activePath = computed(() => route.meta?.activeMenu || route.path);
</script>
<style lang="scss" scoped>
@mixin active {
  &:hover {
    color: var(--el-color-white);
    background-color: $base-menu-active;
  }

  &.is-active {
    color: var(--el-color-white);
    background-color: $base-menu-active;
  }
}

.layout_slider {
  z-index: $base-z-index + 1;
  width: $base-left-menu-width;
  height: 100vh;
  overflow: hidden;
  background: $base-menu-background;
  box-shadow: $base-box-shadow;
  transition: $base-transition;

  &.side-bar-common {
    top: $base-header-height;
    height: calc(100vh - #{$base-header-height});
  }

  &.is-collapse {
    width: $base-left-menu-width-min;
    border-right: 0;

    :deep() {
      .el-menu--collapse.el-menu {
        > .el-menu-item,
        > .el-sub-menu {
          text-align: center;

          .el-tag {
            display: none;
          }
        }
      }

      .el-menu-item,
      .el-sub-menu {
        text-align: left;
      }

      .el-menu--collapse {
        border-right: 0;

        .el-sub-menu__icon-arrow {
          right: 10px;
          margin-top: -3px;
        }
      }
    }
  }

  :deep() {
    .el-scrollbar__wrap {
      overflow-x: hidden;
    }

    .el-menu-item,
    .el-sub-menu__title {
      height: $base-menu-item-height;
      overflow: hidden;
      line-height: $base-menu-item-height;
      text-overflow: ellipsis;
      white-space: nowrap;
      vertical-align: middle;

      i {
        color: inherit;
      }
    }

    .el-menu-item {
      @include active;
    }
  }
}

.layout_tabbar {
  position: fixed;
  width: calc(100% - $base-left-menu-width);
  background-color: $base-color-white;
  top: 0;
  left: $base-left-menu-width;
  height: $base-nav-height;
  padding-right: 20px;
  padding-left: 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  color: var(--el-text-color-regular);
  transition: $base-transition;
  z-index: 99;

  &.is-collapse {
    width: calc(100% - $base-left-menu-width-min);
    left: $base-left-menu-width-min;
  }
}

.layout_main {
  position: absolute;
  width: calc(100% - $base-left-menu-width);
  height: calc(100% - $base-nav-height);
  left: $base-left-menu-width;
  top: $base-nav-height;
  transition: $base-transition;
  overflow: auto;

  &.is-collapse {
    width: calc(100% - $base-left-menu-width-min);
    left: $base-left-menu-width-min;
  }
}
</style>
