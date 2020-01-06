<template>
	<a-locale-provider :locale="zh_CN">
		<a-layout id="components-layout-demo-fixed-sider">
			<a-layout-sider :style="{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0 }">
				<div class="logo">
					<!-- <a><router-link to="/">MEB - 标签中心</router-link></a> -->
					<a>MEB - 标签中心</a>
				</div>
				<a-menu mode="inline" theme="dark">
					<a-sub-menu v-for="item in routes" :key="item.meta.key">
						<span slot="title"><span><a-icon :type="item.meta.icon"/>{{item.meta.title}}</span></span>
						<a-menu-item v-for="item_ in item.children" :key="item_.meta.key" v-show="item_.meta.sidebar==1" @click="route(item_.name)"><a-icon :type="item_.meta.icon"/>{{item_.meta.title}}</a-menu-item>
					</a-sub-menu>
				</a-menu>
			</a-layout-sider>
			<a-layout :style="{ marginLeft: '200px' }">
				<a-layout-header :style="{ background: '#fff' }">
					<a-breadcrumb v-if="$route.meta.breadcrumb" style="margin: 16px 0">
						<a-breadcrumb-item :key="x" v-for="x in $route.meta.breadcrumb">{{x}}</a-breadcrumb-item>
					</a-breadcrumb>
				</a-layout-header>
				<a-layout-content :style="{ margin: '16px 16px 0', overflow: 'initial' }">
					<div :style="{ padding: '24px', background: '#fff' }">
					<keep-alive>
						<router-view></router-view>
					</keep-alive>
					</div>
				</a-layout-content>
				<a-layout-footer :style="{ textAlign: 'center' }">
					TAG CENTER OF MEB ©2020 | BY MEB DRIVE TEAM | antd version: {{ version }}
				</a-layout-footer>
			</a-layout>
		</a-layout>
		<a-spin size="large" :spinning='spinning'/>
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
	  updateTime: "N/A",
	  routes:window.routes
    };
  },
	mounted() {
		// this.getUpdateTime();
	},
	methods: {
		getUpdateTime() {
			this.$doRequest("UserLabel/GetUpdateTime", {},'get', d => {
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
};
</script>

<style>
.ant-table td {
  white-space: nowrap;
}
#components-layout-demo-fixed-sider .logo {
  width: 160px;
  height: 31px;
  color: white;
  margin: 20px auto 20px auto;
  /* border-bottom: 1px solid gray; */
}
#components-layout-demo-fixed-sider .logo a {
  color: white;
  margin-bottom: 30px;
  display: block;
  position: relative;
  font-size: 18px;
  line-height: 25px;
  padding: 3px 10px;
}
</style>
