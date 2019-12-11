// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import App from "./App";
import Antd from "ant-design-vue";
import router from "@/router/index.js";
import "ant-design-vue/dist/antd.css";
import echarts from "echarts";
import reqwest from "reqwest";
import moment from "moment";
Vue.use(Antd);
Vue.config.productionTip = true;
Vue.prototype.$baseURI = "https://dh.meb.com:8055/api/userlabel";
//Vue.prototype.$baseURI = "http://127.0.0.1:8056/api/userlabel";
Vue.prototype.valueSorter = function(a, b) {
  // var l = a || "";
  // var r = a || "";
  // if (
  //   (typeof l === "string" || typeof r === "string") &&
  //   !((l + r).indexOf("[") !== -1 || (l + r).indexOf("[") !== -1)
  // ) {
  //   return l.localeCompare(r, "zh");
  // }
  debugger;
  return this.asNum(a) - this.asNum(b);
};
Vue.prototype.asNum = function(a) {
  if (a == null || a === "") a = 0;
  var m1 = /,(\d+)/.exec(a) || /(\d+)/.exec(a);
  if (!m1) m1 = 0;
  m1 = parseInt(m1[1], 10);
  if (!m1) m1 = 0;
  else if (a.indexOf("以上") !== -1) m1 += 1;
  return m1;
};
Vue.prototype.groupBy = function groupBy(array, f) {
  let groups = {};
  array.forEach(function(o) {
    let group = f(o);
    groups[group] = groups[group] || [];
    groups[group].push(o);
  });
  //return groups;
  return Object.keys(groups).map(function(group) {
    return groups[group];
  });
};
Vue.prototype.$echarts = echarts;
Vue.prototype.$fixDate = function(val) {
  return val.replace("-", "").replace("-", "");
};

Vue.prototype.transform = function(array = [], fnName, fnDate, fnValue) {
  var names = this.distinct(array.map(fnName));
  var dates = this.distinct(array.map(fnDate));
  var output = [];
  names.forEach(name => {
    var item = { name: name };
    dates.forEach(date => {
      item[date] = fnValue(
        array.filter(x => fnName(x) === name && fnDate(x) === date)[0]
      );
    });
    output.push(item);
  });
  return output;
};

Vue.prototype.distinct = function(arr) {
  let result = [];
  let obj = {};

  for (let i of arr) {
    if (!obj[i]) {
      result.push(i);
      obj[i] = 1;
    }
  }
  return result;
};
Vue.prototype.$getUpdateTime = function(cb) {
  if (this.$updateTime) {
    cb.call(this, this.$updateTime);
  } else {
    this.$doRequest("GetUpdateTime", {}, d => {
      this.$updateTime = moment(d, "YYYYMMDD").format("YYYY-MM-DD");
      cb.call(this, this.$updateTime);
    });
  }
};
Vue.prototype.$doRequest = function(path, param = {}, cb) {
  reqwest({
    url: this.$baseURI + "/" + path,
    method: "get",
    data: param,
    type: "json"
  }).then(data => {
    cb && cb.call(this, data);
  });
};
/* eslint-disable no-new */
new Vue({
  router,
  el: "#app",
  components: { App },
  template: "<App/>"
});
