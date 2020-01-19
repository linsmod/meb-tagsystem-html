<template>
  <a-card>
    <strong slot="title">分配记录查询</strong>
    <div class="query" slot="extra">
      <a-select
        showSearch
        placeholder="选择渠道"
        optionFilterProp="children"
        @change="handleChange"
        :filterOption="filterOption"
        :value="spreadtypeId"
        :defaultValue="spreadtypeId"
        :options="ways"
      >
      </a-select>
      <a-select
        placeholder="显示级别"
        @change="onLevelChange"
        :options="levels"
        :value="level"
        :defautValue="level"
      >
      </a-select>
      <a-range-picker
        slot="extra"
        @change="onDateRangeChange"
        format="YYYY-MM-DD"
        :value="dateRange"
      />
      <a-button type="primary" @click="search">搜索</a-button>
    </div>
    <p></p>
    <!-- <a href="#" slot="extra">more</a> -->
    <div>
      <div
        v-show="this.prev != null && ready"
        style="cursor:pointer"
        @click="goBack"
      >
        [&lt;&lt;返回]
      </div>
      <div v-show="!empty" id="sankey" style="width: 100%;height: 650px;"></div>
      <a-empty v-show="empty" />
      <p v-show="!empty && spreadtypeId == '-1' && ready">
        <a-alert
          message="点击图中的 [渠道色块] 查看对应渠道分配情况"
          type="info"
        />
      </p>
      <!-- <div id="myCharts" ref="myCharts" :style="{height:chartHeight}"></div> -->
    </div>
    <p></p>
  </a-card>
</template>

<script>
import moment from "moment";
export default {
  data() {
    return {
      empty: false,
      ready: false,
      dateRange: [moment().subtract(15, "days"), moment()],
      ways: [], //推广渠道 下拉框数组
      spreadtypeId: "-1", //推广类别
      endOpen: false,
      levels: [
        { label: "展示到部门级别", value: "3" },
        { label: "展示到小组级别", value: "4" },
        { label: "展示到咨询师级别", value: "5" }
      ],
      level: "4",
      prev: null
    };
  },
  mounted() {
    this.getWays();
  },
  methods: {
    onDateRangeChange(value) {
      debugger;
      this.dateRange = value;
    },
    goBack() {
      this.handleChange(this.prev.spreadtypeId);
      this.prev = null;
      this.init_sankey();
    },
    onLevelChange(value) {
      this.level = value;
    },
    /** 获取推广渠道 */
    getWays() {
      this.$doRequest("/rules/GetSpreadTypes", {}, "get", res => {
        if (res.code == 0) {
          this.ways = res.data.map(x => {
            return { label: x.name, value: x.id, disabled: false };
          });
          this.ways.unshift({ value: "-1", label: "全部渠道" });
          this.handleChange(this.spreadtypeId);
        }
      });
    },
    /** 推广渠道 下拉框change事件 */
    handleChange(value) {
      this.spreadtypeId = value;
      this.levels.forEach(
        x => (x.disabled = this.spreadtypeId == -1 && x.value != 3)
      );
      this.level =
        this.spreadtypeId == -1 && this.level != 3 ? "3" : this.level;
    },
    /** 带筛选的下拉框 */
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text
          .toLowerCase()
          .indexOf(input.toLowerCase()) >= 0
      );
    },
    /** 搜索时判断 是否筛选项均有值 */
    search() {
      if (this.spreadtypeId == "") {
        this.$error({ title: "请选择渠道！" });
      }
      this.init_sankey();
    },
    /** 桑吉图 */
    init_sankey() {
      var dom = document.getElementById("sankey");
      var myChart = this.$echarts.init(dom);
      var app = {},
        option = null,
        that = this;
      myChart.showLoading();
      this.$doRequest(
        "/rules/GetDeliverSankey",
        {
          spreadtypeId: this.spreadtypeId == -1 ? null : this.spreadtypeId,
          dtFrom: this.dateRange[0].format("YYYY-MM-DD"),
          dtTo: this.dateRange[1].format("YYYY-MM-DD"),
          dimentionLevels: this.level
        },
        "get",
        res => {
          if (res.code == 0) {
            myChart.hideLoading();
            this.ready = true;
            this.empty = res.data.nodes.length == 0;
            option = {
              tooltip: {
                trigger: "item",
                triggerOn: "mousemove"
              },
              series: [
                {
                  type: "sankey",
                  data: res.data.nodes,
                  links: res.data.links,
                  // focusNodeAdjacency: true,
                  levels: [
                    {
                      depth: 0,
                      itemStyle: {
                        color: "#fbb4ae"
                      },
                      lineStyle: {
                        color: "source",
                        opacity: 0.6
                      }
                    },
                    {
                      depth: 1,
                      itemStyle: {
                        color: "#b3cde3"
                      },
                      lineStyle: {
                        color: "source",
                        opacity: 0.6
                      }
                    },
                    {
                      depth: 2,
                      itemStyle: {
                        color: "#ccebc5"
                      },
                      lineStyle: {
                        color: "source",
                        opacity: 0.6
                      }
                    },
                    {
                      depth: 3,
                      itemStyle: {
                        color: "#decbe4"
                      },
                      lineStyle: {
                        color: "source",
                        opacity: 0.6
                      }
                    }
                  ],
                  lineStyle: {
                    normal: {
                      curveness: 0.5
                    }
                  }
                }
              ]
            };
            that.$nextTick(function() {
              if (document.getElementById("sankey")) {
                var div = document.getElementById("sankey");
                div.removeAttribute("_echarts_instance_");
                var chart = that.$echarts.init(div, null, {
                  renderer: "canvas",
                  width: "auto"
                });
                chart.setOption(option, true);
              }
              window.addEventListener("resize", function() {
                chart.resize();
              });
              chart.on("click", function(params) {
                if (params.data && params.data.source) {
                  var sources = that.ways.filter(
                    x => x.label == params.data.source
                  );
                  if (
                    sources.length > 0 &&
                    that.spreadtypeId != sources[0].value
                  ) {
                    (that.prev = {
                      spreadtypeId: that.spreadtypeId,
                      level: that.level
                    }),
                      that.handleChange(sources[0].value);
                    that.init_sankey();
                  }
                }
              });
            });
          }
        }
      );
    }
  },
  watch: {
    startValue(val) {
      this.startValue = val;
    },
    endValue(val) {
      this.endValue = val;
    }
  }
};
</script>

<style>
.query .ant-select {
  min-width: 200px;
  margin: 0 8px 0px 0;
}
</style>
