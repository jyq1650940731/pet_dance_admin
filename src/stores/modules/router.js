import router from '@/router';
import { asyncRoutes } from '@/router/route';
import { useUserStore } from './user';
import config from '@/config';

export const useRouterStore = defineStore('router', () => {
  const userStore = useUserStore();
  const routeList = reactive(
    config.permissionMode === 'intelligence' ? [...asyncRoutes] : [],
  );

  const getRouteList = () => {
    const convertRoutes = convertRouter();
    addRouter(convertRoutes);
  };

  const convertRouter = () => {
    const menuPathSet = extractAllMenuPaths(userStore.menu);
    return filterRoutesByMenuPaths(asyncRoutes, menuPathSet);
  };

  const setRouteList = (routers = []) => {
    routeList.splice(0, routeList.length, ...routers);
  };

  const addRouter = (routers = []) => {
    setRouteList(routers);
    routers.forEach((route) => {
      if (route.name && router.hasRoute(route.name)) return;
      router.addRoute(route);
    });
  };

  function extractAllMenuPaths(menuList) {
    const pathSet = new Set();
    if (!Array.isArray(menuList)) return pathSet;

    const extractPath = (menuItem) => {
      if (!menuItem) return;
      if (menuItem.path) pathSet.add(menuItem.path);
      if (Array.isArray(menuItem.children) && menuItem.children.length > 0) {
        menuItem.children.forEach((child) => extractPath(child));
      }
    };

    menuList.forEach((item) => extractPath(item));
    return pathSet;
  }

  function filterRoutesByMenuPaths(routes, menuPathSet) {
    const filterRoute = (route, parentFullPath = '') => {
      const fullPath = parentFullPath
        ? `${parentFullPath}/${route.path}`.replace(/\/+/g, '/')
        : route.path.startsWith('/')
          ? route.path
          : `/${route.path}`;
      const matchPath = fullPath.replace(/^\//, '');

      if (!menuPathSet.has(matchPath)) return null;

      const filteredChildren = [];
      if (route.children?.length) {
        route.children.forEach((childRoute) => {
          const filteredChild = filterRoute(childRoute, fullPath);
          if (filteredChild) filteredChildren.push(filteredChild);
        });
      }

      return {
        ...route,
        children: filteredChildren.length > 0 ? filteredChildren : undefined,
      };
    };

    return routes
      .map((route) => filterRoute(route))
      .filter(Boolean);
  }

  return {
    routeList,
    getRouteList,
    setRouteList,
    addRouter,
  };
});
