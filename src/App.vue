<template>
  <a-locale-provider :locale="zh_CN">
    <a-spin :spinning="spinning">
      <a-layout id="components-layout-demo-top-side">
        <a-layout-header class="header">
          <div class="logo">
            <a>MEB - 标签中心</a>
          </div>
          <a-menu
            theme="dark"
            mode="horizontal"
            :defaultSelectedKeys="['1']"
            :style="{ lineHeight: '64px' }"
          >
            <a-menu-item key="1" v-on:click="route('index')">标签中心</a-menu-item>
            <a-menu-item key="2" v-on:click="route('rules')">规则引擎</a-menu-item>
          </a-menu>
        </a-layout-header>
        <a-layout-content style="padding: 0 50px">
          <a-breadcrumb v-if="$route.meta.breadcrumb" style="margin: 16px 0">
            <a-breadcrumb-item :key="x" v-for="x in $route.meta.breadcrumb">{{x}}</a-breadcrumb-item>
          </a-breadcrumb>
          <a-layout style="padding: 24px 0; background: #fff">
            <a-layout-sider width="200" style="background: #fff">
              <v-sidebar :dataSource="menu()" v-on:menu-click="onMenuClick"></v-sidebar>
            </a-layout-sider>
            <a-layout-content :style="{ padding: '0 24px', minHeight: '600px' }">
              <keep-alive>
                <router-view></router-view>
              </keep-alive>
            </a-layout-content>
          </a-layout>
        </a-layout-content>
        <a-layout-footer
          style="text-align: center"
        >TAG CENTER OF MEB ©2020 | BY MEB DRIVE TEAM | antd version: {{ version }}</a-layout-footer>
      </a-layout>
    </a-spin>
  </a-locale-provider>
</template>



<script>
import zh_CN from "ant-design-vue/lib/locale-provider/zh_CN";
import index from "@/views/index";
import sidebar from "@/components/sidebar.vue";
import moment from "moment";
import { version } from "ant-design-vue";
moment.locale("zh-cn");
export default {
  name: "App",
  data() {
    return {
      moment,
      version,
      zh_CN,
      spinning: true,
      updateTime: "N/A"
    };
  },
  methods: {
    getUpdateTime() {
      this.$doRequest("GetUpdateTime", {}, d => {
        this.updateTime = moment(d, "YYYYMMDD").format("YYYY-MM-DD");
        this.spinning = false;
        this.route("tags");
      });
    },
    menu() {
      return this.$getSidebarRoutes(this.$route);
    },
    onMenuClick(item) {
      // console.log("onMenuClick" + item);
      // this.$router.push({
      //   name: item.key,
      //   params: { updateTime: this.updateTime }
      // });
      this.route(item.key);
    },
    route: function(name) {
      this.$router.push({
        name: name,
        query: { updateTime: this.updateTime }
      });
    }
  },
  components: { index, "v-sidebar": sidebar },
  mounted() {
    this.getUpdateTime();
  }
};
</script>

<style>
.ant-table td {
  white-space: nowrap;
}
#components-layout-demo-top-side .ant-layout {
  background-color: white;
}
#components-layout-demo-top-side .logo {
  width: 160px;
  height: 31px;
  color: white;
  background: rgba(162, 216, 13, 0.767);
  margin: 16px 28px 16px 0;
  float: left;
}
#components-layout-demo-top-side .logo a {
  color: white;
  margin-bottom: 30px;
  display: block;
  position: relative;
  font-size: 18px;
  line-height: 25px;
  padding: 3px 15px;
}
</style>
