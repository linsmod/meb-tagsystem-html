import Vue from "vue";
import Router from "vue-router";
import index from "@/views/index";
import tags from "@/views/tags";
import query from "@/views/query";
import details from "@/views/details";
import rules from "@/views/rules";
Vue.use(Router);
const originalPush = Router.prototype.push;
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err);
};
window.routes = [
  {
    path: "/",
    name: "index",
    component: index,
    redirect: "/index/tags",
    meta: {
      title: "标签中心"
    },
    children: [
      {
        path: "/index/tags",
        name: "tags",
        component: tags,
        meta: {
          title: "标签中心",
          breadcrumb: ["标签中心", "标签中心"],
          selectedKey: "tags", //标记侧边栏的哪个菜单是选中状态
          icon: "home",
          sidebar: 1 //是否显示在侧边栏
        }
      },
      {
        path: "/index/query",
        name: "query",
        component: query,
        meta: {
          title: "咨询师列表",
          breadcrumb: ["标签中心", "咨询师列表"],
          selectedKey: "query",
          icon: "search",
          sidebar: 1 //是否显示在侧边栏
        }
      },
      {
        path: "/index/query/details",
        name: "details",
        component: details,
        meta: {
          title: "用户详情",
          breadcrumb: ["标签中心", "咨询师列表"],
          selectedKey: "query",
          icon: "search",
          sidebar: 0 //是否显示在侧边栏
        }
      }
    ]
  },
  {
    path: "/rules",
    name: "rules",
    component: rules,
    meta: {
      title: "规则引擎",
      breadcrumb: ["标签中心", "规则引擎"]
    },
    children: []
  }
];
Vue.prototype.$getSidebarRoutes = route => {
  var parent = route.path.split("/").filter(x => x)[0];
  for (let index = 0; index < window.routes.length; index++) {
    const element = window.routes[index];
    if (element.name === parent) {
      return element.children.filter(x => x.meta.sidebar) || [];
    }
  }
  return [];
};
export default new Router({ routes: window.routes });
