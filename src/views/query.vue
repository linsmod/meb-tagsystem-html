<template>
  <div>
    <a-card :loading="loading">
      <strong slot="title">咨询师标签查询</strong>
      <a href="#" slot="extra">更新于{{ $route.query.updateTime }}</a>
      <div>
        <a-select
        class="enhancedSelect"
        mode="multiple"
        style="width: 200px;"
        @change="handleChange"
        :labelInValue="true"
        :placeholder="tipText"
        :value="selectedLabels"
        :options="options"
      >
      </a-select>
        <a-input-search
        placeholder="输入ID、用户名搜索"
        style="width: 200px"
        @search="onSearch"
      /></div>
      <p></p>
      <a-table
        :pagination="{ pageSize: 50 }"
        :columns="columns()"
        rowKey="realname"
        :scroll="{ x: 1500 }"
        :dataSource="tableData"
        :loading="tableLoading"
      >
        <div slot="action" slot-scope="item">
          <router-link
            :to="{
              name: 'details',
              query: { user: item.realname },
              params: { labelDefs: labelDefs }
            }"
            >查看详情</router-link
          >
        </div>
        <!-- <a slot="action" slot-scope="item" :href="'#/index/details?user='+item.realname">查看详情</a> -->
      </a-table>
    </a-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      tipText: "选择标签",
      labelDefs: [],
      loading: true,
      tableLoading: true,
      fixedLabels: [
        { key: "id", label: "ID" },
        { key: "realname", label: "姓名" }
      ],
      selectedLabels: [], //搜索参数2
      user: "", //搜索参数1
      options: [], //array<{value, label, [disabled, key, title]}>
      tableData: [],
      updateTime: "N/A"
    };
  },
  methods: {
    labelString() {
      return this.fixedLabels
        .concat(this.selectedLabels)
        .map(x => x.key.split("|")[0])
        .join(",");
    },
    columns() {
      var vals = this.fixedLabels.concat(this.selectedLabels).map((x, i) => {
        return {
          fixed: x.fixed,
          title: x.label,
          dataIndex: x.key.split("|")[0],
          sorter: x.fixed
            ? false
            : (a, b) => this.valueSorter(a[x.key], b[x.key]),
          width: i !== this.selectedLabels.length - 1 ? 200 : 100
        };
      });
      vals.push({
        title: "操作",
        key: "operation",
        width: 100,
        scopedSlots: { customRender: "action" }
      });
      return vals;
    },
    getLabels(cb) {
      //1、下载标签的定义信息
      this.$doRequest("UserLabel/GetLabels", {}, "get", d => {
        this.labelDefs = d;
        window.labelDefs = d;
        this.options = d
          .filter(x => x.field !== "id" && x.field !== "realname")
          //.sort((a, b) => (a.field || "").localeCompare(b.field || ""))
          .map(x => {
            return {
              value: x.field + "|" + x.name,
              label: x.name,
              key: x.field + "|" + x.name
            };
          });

        cb && cb.call(this, this.options);
      });
    },
    onSearch(value) {
      this.user = value;
      this.doSearch();
    },
    handleChange(value) {
      debugger;
      this.selectedLabels = value;
      this.doSearch();
    },
    // handleSelect(value) {
    //   var option = this.options.filter(x=>x.label==value);
    //   if(option.length>0){
    //     this.selectedLabels.push(value);
    //     this.doSearch();
    //   }
    // },
    // handleUnselect(value) {
    //   //debugger;
    //   for (var i = 0; i < this.selectedLabels.length; i++) {
    //     if (this.selectedLabels[i].key === value.key) {
    //       this.selectedLabels.splice(i, 1);
    //       break;
    //     }
    //   }
    //   // if (this.selectedLabels.length > 0) {
    //   //   this.doSearch();
    //   // } else {
    //   //   this.tableData = [];
    //   //   window.tableData = [];
    //   //   this.tableLoading = false;
    //   // }
    // },
    doSearch() {
      this.tableLoading = true;
      this.$doRequest(
        "UserLabel/SearchUserLabel",
        {
          user: this.user,
          labels: this.labelString(),
          date: this.$fixDate(this.updateTime)
        },
        "get",
        d => {
          this.tableData = d;
          window.tableData = d;
          this.tableLoading = false;
        }
      );
    }
  },
  watch: {
    selectedLabels(value) {
      this.tipText =
        value.length == 0 ? "选择标签" : "已选中" + value.length + "个标签";
    }
  },
  mounted() {
    this.$getUpdateTime(updateTime => {
      this.updateTime = updateTime;
      this.getLabels(d => {
        this.selectedLabels = d.slice(0, 5);
        this.doSearch();
        this.loading = false;
      });
    });
  }
};
</script>
<style>
.enhancedSelect .ant-select-selection__choice {
  display: none !important;
}
.enhancedSelect .ant-select-selection__placeholder {
  display: inline-block !important;
}
</style>
