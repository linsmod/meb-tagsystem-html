<template>
	<a-layout style="padding: 6px 0; background: #fff">
		<a-layout-sider style="background: #fff">
			<v-tagtree :loading="loading" :dataSource="tags" @search="onSearch" @select="onSelect"></v-tagtree>
		</a-layout-sider>
		<a-layout-content style="margin-left :12px;padding: 0 24px; border-left:1px solid #ccc;">
			<a-empty v-if="!anySelected" description="请选择标签" style="margin:200px auto;"/>
			<div v-show="anySelected">
				<v-taginfo :info="current"></v-taginfo>
				<br>
				<br>
				<v-taghistory
				:loading="loading"
				:title="title"
				:dataSource="data"
				:chartData="chartData"
				:dateRange="dateRange"
				@date-range-change="onDateRangeChange"
				@pagenation="onPagenation"
				></v-taghistory>
				<br>
			</div>
		</a-layout-content>
	</a-layout>
</template>
<script>
import tagtree from "@/components/tagtree";
import taginfo from "@/components/taginfo";
import taghistory from "@/components/taghistory";
import moment from "moment";
export default {
  name: "TAG",
  computed: {
    title: function() {
      return this.current.name;
    }
  },
  data() {
    return {
      current: {
        name: "",
        type: "",
        description: "",
        rule: "",
        numberOfUsers: "N/A",
        updateTime: "N/A"
      },
      data: {},
      chartData: {},
      updateTime: "N/A",
      anySelected: false,
      tags: [],
      loading: false,
      dateRange: []
    };
  },
  methods: {
    GetUserLabelData(
      dtFrom,
      dtTo,
      name,
      exclude,
      props = ["chartData", "data"],
      page = false
    ) {
      this.loading = true;
      var p = {
        dtFrom: dtFrom,
        dtTo: dtTo,
        name: name,
        exclude: exclude
      };
      if (page) {
        p.page = this.pagenation.page;
        p.size = this.pagenation.size;
      }
      this.$doRequest("UserLabels/GetUserLabelData", p,'get', d => {
        this.loading = false;
        //debugger;
        d.dateRange = this.dateRange;
        props.forEach(x => (this[x] = d));
      });
    },

    getNumberOfUsers(param = {},method, cb) {
      this.$doRequest("UserLabels/GetNumberOfUsers", param,method, cb);
    },
    fetch(params = {}) {
      this.loading = true;
      this.$doRequest("UserLabels/GetLabels", params,method, data => {
        this.loading = false;
        var d = {};
        data.forEach(function(x) {
          var item=d[x.category] || (d[x.category] = { name: x.category, items: [] });
          if(x.field!=="id" && x.field!=="realname")
          item.items.push(x);
        });
        this.tags = d;
        window.d = d;
      });
    },
    showModal() {
      this.visible = true;
    },

    route: function(name) {
      this.$router.push({
        name: name
      });
    },
    alert: function(name) {
      alert(1);
    },
    onChange(date, dateString) {
      console.log(date, dateString);
    },
    onSearch(value) {
      this.fetch({ name: value });
    },
    onSelect(keys) {
      var item = null;
      for (var tag in this.tags) {
        var items = this.tags[tag].items;
        for (var x = 0; x < items.length; x++) {
          if (items[x].id === keys[0]) {
            item = items[x];
            break;
          }
        }
      }
      if (item) {
        this.getNumberOfUsers(
          { field: item.field, date: this.$fixDate(this.updateTime) },
          'get',
          d => {
            var x = this.current.updateTime;
            this.current = item;
            this.current.updateTime = x;
            this.current.numberOfUsers = d;
            this.anySelected = true;
          }
        );
        var dtFrom = this.dateRange[0].format("YYYY-MM-DD");
        var dtTo = this.dateRange[1].format("YYYY-MM-DD");
        this.GetUserLabelData(dtFrom, dtTo, item.name, true);
      }
    },
    onDateRangeChange(value) {
      this.dateRange = value;
      var dtFrom = value[0].format("YYYY-MM-DD");
      var dtTo = value[1].format("YYYY-MM-DD");
      this.GetUserLabelData(dtFrom, dtTo, this.current.name, true);
    },
    onPagenation(d) {
      this.pagenation = d;
      //客户端翻页，无需发送请求
      //this.onDateRangeChange(this.dateRange, ["data"], 1); //表格翻页
    }
  },
  mounted() {
    //debugger;
    this.$getUpdateTime(d => {
      this.updateTime = d;
      this.current.updateTime = "更新于" + d;
      this.fetch();
      this.dateRange = [
        moment().subtract(15, "days"),
        moment().subtract(1, "days")
      ];
    });
  },
  components: {
    "v-tagtree": tagtree,
    "v-taginfo": taginfo,
    "v-taghistory": taghistory
  }
};
</script>
<style>
.ant-badge-status {
  padding-bottom: 4px;
}
</style>
