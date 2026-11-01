//全局组件注册
import SvgIcon from "./SvgIcon/index.vue";

import MyPaginationTable from "./MyPaginationTable/index.vue";
import MyDialog from "./MyDialog/index.vue";
import MyUpload from "./MyUpload/index.vue";
import MyPoiSelector from "./MyPoiSelector/index.vue";
import MyMultiUpload from "./MyMultiUpload/index.vue";
import MyFormDialog from "./MyFormDialog/index.vue";
import MySearchBar from "./MySearchBar/index.vue";
import MyHotZone from "./MyHotZone/index.vue";

import {
  Coordinate,
  Menu,
  Notification,
  ArrowRightBold,
  FullScreen,
  RefreshLeft,
  Setting,
  ArrowDown,
  Avatar,
  Lock,
  Remove,
  Fold,
  Expand,
  PieChart,
  LocationFilled,
  RefreshRight,
  Document,
  CircleClose,
  ArrowLeft
} from "@element-plus/icons-vue";

const allGlobalComponents = {
  SvgIcon,
  MyPaginationTable,
  MyDialog,
  MyUpload,
  MyPoiSelector,
  MyMultiUpload,
  MyFormDialog,
  MySearchBar,
  MyHotZone
};

export default {
  install(app) {
    Object.keys(allGlobalComponents).forEach((item) => {
      app.component(item, allGlobalComponents[item]); //全局组件注册
    });

    const useIcons = {
      Coordinate,
      Menu,
      Notification,
      ArrowRightBold,
      PieChart,
      LocationFilled,
      FullScreen,
      RefreshLeft,
      Setting,
      ArrowDown,
      Avatar,
      Lock,
      Remove,
      Fold,
      Expand,
      RefreshRight,
      Document,
      CircleClose,
      ArrowLeft
    };
    Object.entries(useIcons).forEach(([key, component]) => {
      app.component(key, component);
    });
  },
};
