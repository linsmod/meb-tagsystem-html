<template>
  <a-card>
    <strong slot="title">标签历史详情</strong>
    <a-range-picker slot="extra" @change="onChange" :value="dateRange"/>
    <p></p>
    <!-- <a href="#" slot="extra">more</a> -->
    <div v-resize:debounce="onResize">
      <div id="myCharts" ref="myCharts" :style="{height:chartHeight}"></div>
    </div>
    <p></p>
    <a-table
      :columns="columns()"
      :rowKey="x =>x.index"
      :dataSource="tableData"
      :pagination="pagination"
      :loading="loading"
      @change="handleTableChange"
    >
      <template slot="name" slot-scope="name">{{name.first}} {{name.last}}</template>
    </a-table>
  </a-card>
</template>
<script>
import resize from "vue-resize-directive";
import moment from "moment";
export default {
  name: "v-taghisotry",
  props: ["chartData", "dataSource", "title", "loading", "dateRange"],
  directives: {
    resize
  },
  data() {
    return {
      moment,
      pagination: {},
      data: [],
      tableData: [],
      chartHeight: "450px"
    };
  },
  methods: {
    columns: function() {
      if (!this.dataSource.data) {
        return [];
      }
      var dateArray = this.getDateArray(this.dataSource);
      return [{ title: this.title, dataIndex: "name" }].concat(
        dateArray.map(x => {
          return {
            title: x,
            dataIndex: x,
            sorter: (a, b) => this.valueSorter(a[x], b[x])
          };
        })
      );
    },
    onResize() {
      window.echarts && window.echarts.resize();
    },
    onChange(value) {
      //update ui
      this.date = value;
      this.$emit("date-range-change", value);
    },
    getDateArray(d) {
      return this.distinct(d.data.map(x => x.date)).sort((a, b) =>
        a.localeCompare(b)
      );
    },
    handleTableChange(pagination, filters, sorter) {
      console.log(pagination);
      const pager = { ...this.pagination };
      pager.current = pagination.current;
      this.pagination = pager;
      // this.$emit("pagenation", {
      //   size: pagination.pageSize,
      //   page: pagination.current,
      //   sortField: sorter.field,
      //   sortOrder: sorter.order,
      //   ...filters
      // });
    },
    renderChart(d) {
      this.chartHeight = (400 + (d.legend.length / 6) * 10).toString() + "px";
      window.echarts && window.echarts.dispose() && delete window.echarts;
      window.echarts = this.$echarts.init(this.$refs.myCharts);
      var sorted = d.data.sort((a, b) => a.date.localeCompare(b.date));
      var dateArray = this.distinct(d.data.map(x => x.date));
      var series = [];
      for (var i = 0; i < sorted.length; i++) {
        var field = sorted[i].field;
        var value = sorted[i].counts;
        series[field] ||
          (series[field] = {
            name: field,
            type: "bar",
            stack: "d",
            data: []
          });
        series[field].data.push(value);
      }
      //debugger;
      for (var x in series) {
        series.push(series[x]);
        delete series[x];
      }
      window.series = series;
      var _this = this;
      var options = {
        title: { text: this.title },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            // 坐标轴指示器，坐标轴触发有效
            type: "shadow" // 默认为直线，可选为：'line' | 'shadow'
          }
        },
        legend: {
          data: d.legend,
          top: 30
        },
        grid: {
          top: 90 + (d.legend.length / 6) * 10
        },
        xAxis: {
          type: "category",
          data: dateArray.sort((a, b) => a.localeCompare(b)),
          axisLabel: {
            formatter: x => _this.moment(x, "YYYYMMDD").format("YYYY-MM-DD")
          }
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
      window.echarts.setOption(options);
      window.echarts.resize();
    },
    distinct(arr) {
      let result = [];
      let obj = {};

      for (let i of arr) {
        if (!obj[i]) {
          result.push(i);
          obj[i] = 1;
        }
      }
      return result;
    }
  },
  watch: {
    dataSource(val) {
      if (val.data) {
        this.tableData = this.transform(
          val.data,
          x => x.field,
          x => x.date,
          x => x.counts
        );
        debugger;
      } else {
        this.tableData = [];
      }
    },
    loading(val) {
      val &&
        window.detailChart &&
        window.detailChart.showLoading({
          text: "loading",
          color: "#CCCCCC",
          textColor: "#4cbbff",
          maskColor: "rgba(255, 255, 255, 0.9"
        });
    },
    chartData(val) {
      // this.date = val.dateRange;
      // if (this.date[0].format("YYYYMMDD") === "20191118") {
      //   debugger;
      // }
      this.renderChart(val);
    }
  }
};
</script>
