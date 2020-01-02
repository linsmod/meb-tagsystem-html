<template>
  <a-layout style="padding:0 24px;">
    <a-layout-sider width="240" theme="light">
      <a-card hoverable style="width: 240px">
        <a-card-meta>
          <template slot="title">
            <a-icon type="user" slot="cover"/>
            <span style="padding-left:10px;">{{$route.query.user}}</span>
          </template>
          <template slot="description">
            <p style="border-bottom:1px solid #ccc"></p>
            <p v-for="item in baseLabelValues" :key="item.name">
              <strong>{{item.name}}:</strong>
              <span style="padding-left:10px;">{{item.value}}</span>
            </p>
          </template>
        </a-card-meta>
      </a-card>
    </a-layout-sider>
    <a-layout-content :style="{ padding: '0 24px', minHeight: '600px' }">
      <a-card title="标签历史详情">
        <a-select
          slot="extra"
          :loading="loading"
          :options="options"
          :labelInValue="true"
          defaultValue="a1"
          style="width: 200px"
          :value="selectedLabel"
          @change="handleChange"
        ></a-select>
        <div v-resize:debounce="onResize">
          <div id="myCharts" ref="myCharts" style="height:450px"></div>
          <br>
          <a-table
            :loading="loading"
            :rowKey="x => x.date+'_'+x.id"
            :columns="columns()"
            :dataSource="tableData"
          ></a-table>
        </div>
      </a-card>
    </a-layout-content>
  </a-layout>
</template>
<script>
import resize from "vue-resize-directive";
import moment from "moment";
export default {
  directives: {
    resize
  },
  data() {
    return {
      loading: false,
      baseLabels: [],
      baseLabelValues: [],
      selectedLabel: {},
      tableData: [],
      chartData: [],
      labelDefs: [],
      moment
    };
  },
  computed: {
    labelString() {
      return this.baseLabels
        .map(x => x.field)
        .concat([this.selectedLabel.key])
        .join(",");
    },
    //array<{value, label, [disabled, key, title]}>
    options() {
      return this.labelDefs
        .filter(x => x.category !== "基本信息")
        .map(x => {
          //debugger;
          return {
            key: x.field,
            label: x.name,
            title: x.name
          };
        });
    }
  },
  methods: {
    columns() {
      return [
        {
          dataIndex: "date",
          title: "采集日期"
        },
        {
          title: this.selectedLabel.label,
          dataIndex: this.selectedLabel.key
        }
      ];
    },
    handleChange(val) {
      //debugger;
      this.selectedLabel = val;
      this.getUserDetails();
    },
    onResize() {
      window.detailChart && window.detailChart.resize();
    },
    renderChart(d) {
      window.detailChart &&
        window.detailChart.dispose() &&
        delete window.detailChart;
      window.detailChart = this.$echarts.init(this.$refs.myCharts);

      var sorted = d.sort((a, b) => a.date.localeCompare(b.date));
      var dateArray = this.distinct(
        d.map(x => this.moment(x.date, "YYYYMMDD").format("YYYY-MM-DD"))
      );
      var series = [];
      for (var i = 0; i < sorted.length; i++) {
        var label = this.selectedLabel.label;
        var field = this.selectedLabel.key;
        var value = sorted[i][field];
        series[label] ||
          (series[label] = {
            name: label,
            type: "line",
            //stack: "d",
            data: []
          });
        series[label].data.push(parseFloat(value) || 0);
      }
      //debugger;
      for (var x in series) {
        series.push(series[x]);
        delete series[x];
      }
      window.series = series;
      var options = {
        //title: { text: this.title },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: "shadow" // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        legend: {
          //data: d.legend,
          top: 30
        },
        // grid: {
        //   top: 70 + (d.legend.length / 6) * 10
        // },
        xAxis: {
          type: "category",
          data: dateArray //.sort((a, b) => a.localeCompare(b)),
        },
        yAxis: {
          type: "value"
        },
        series: series
        // series: [
        //   {
        //     data: [120, 200, 150, 80, 70, 110, 130],
        //     type: "bar"
        //   }
        // ]
      };
      window.dateArray = dateArray;
      window.options = options;
      window.chartData = d;
      window.detailChart.setOption(options);
      window.detailChart.resize();
    },
    getUserDetails() {
      this.loading = true;
      window.detailChart &&
        window.detailChart.showLoading({
          text: "loading",
          color: "#CCCCCC",
          textColor: "#4cbbff",
          maskColor: "rgba(255, 255, 255, 0.9"
        });
      this.$doRequest(
        "GetUserDetail",
        {
          dayOffset: -30,
          user: this.$route.query.user,
          labels: this.labelString
        },
        'get',
        d => {
          this.loading = false;
          window.detailChart && window.detailChart.hideLoading();

          //debugger;
          this.baseLabelValues = [];
          for (var j = 0; j < this.baseLabels.length; j++) {
            for (var i = 0; i < d.length; i++) {
              var name = this.baseLabels[j].name;
              var field = this.baseLabels[j].field;
              var value = d[i][field];

              if (name === "入职时间") {
                value = this.moment()
                  .subtract(parseInt(value, 10), "months")
                  .format("YYYY-MM-DD");
              }
              this.baseLabelValues.push({
                name: name,
                value: value
              });
              break;
            }
          }
          this.chartData = d;
          this.tableData = d;
          this.renderChart(d);
        }
      );
    }
  },

  beforeRouteEnter(to, from, next) {
    to.query.user &&
      to.meta.breadcrumb &&
      (to.meta.breadcrumb = to.meta.breadcrumb.slice(0, 2)).push(to.query.user);
    if (from && from.name && to.name === "details") {
      next(vm => {
        vm.labelDefs = to.params.labelDefs;
        vm.selectedLabel = vm.options[0];
        vm.baseLabels = to.params.labelDefs
          .filter(x => x.category === "基本信息")
          .map(x => {
            return { name: x.name, field: x.field };
          });
        vm.getUserDetails();
      });
    }
  }
};
</script>

