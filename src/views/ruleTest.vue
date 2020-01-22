<template>
  <div>
    <a-card>
      <div slot="title"><a-icon type="bulb" /> 分单规则测试</div>
      <p><strong>1、选择用于测试的历史数据</strong></p>
      <a-select :options="requests" style="width: 400px" @change="handleChange">
      </a-select>
      <p></p>
      <p><strong>2、确认待测数据</strong></p>
      <a-list size="small" bordered :dataSource="properties">
        <a-list-item slot="renderItem" slot-scope="item, index">
          <span style="width:200px;"> {{ item.name }}：</span
          ><span> {{ item.value }}</span></a-list-item
        >
      </a-list>
      <p></p>
      <p><strong>3、开始测试</strong></p>
      <a-button
        type="primary"
        icon="coffee"
        @click="executTest"
        :disabled="!requestId || executing"
        >开始测试</a-button
      >
      <p></p>
      <p><strong>4、核对测试结果</strong></p>
      <div v-show="!executing">
        <div v-show="appliedReducers.length > 0 && !anyRuleMatched">
          <a-alert message="未能匹配上任何规则" banner />
          <p></p>
        </div>
        <div v-show="appliedReducers.length > 0 && anyRuleMatched">
          <a-alert type="success" banner>
            <span slot="message">
              匹配成功！ {{ matchedRule && matchedRule.name }} 。
            </span>
          </a-alert>
          <p></p>
        </div>
        <div v-if="deliverSuccess">
          <a-alert type="success" banner>
            <span slot="message">
              分配成功！ 【{{ deliverResult.deliverType.name }}】 , 分配结果为
              ID={{ deliverResult.selectedItem }}。
            </span>
          </a-alert>
          <p></p>
        </div>
        <div v-show="error">
          <a-alert
            :message="errorType"
            :description="error"
            type="error"
            showIcon
          />
          <p></p>
        </div>
        <a-list
          v-show="appliedReducers.length > 0"
          size="small"
          bordered
          :dataSource="appliedReducers"
        >
          <a-list-item slot="renderItem" slot-scope="item">
            <a-tag color="blue">{{ item.order + 1 }}</a-tag>
            <a-tag style="width:150px;">筛选器: {{ item.reducer.name }}</a-tag>
            <a-tag style="width:100px;">输入: {{ item.input.length }}</a-tag>
            <a-tag style="width:100px;">输出：{{ item.output.length }}</a-tag>
            <a-tag style="width:150px;">耗时：{{ item.elapsed }}</a-tag>
          </a-list-item>
          <div slot="header">4.1 咨询师筛选过程</div>
          <div slot="footer">筛选结果： {{ reduced }}</div>
        </a-list>
        <p></p>
        <a-list
          v-show="rules.length > 0"
          size="small"
          bordered
          :dataSource="rules"
        >
          <a-list-item slot="renderItem" slot-scope="item">
            <a-tag color="blue">{{ item.Order + 1 }}</a-tag>
            <a-tag style="width:150px;">{{ item.Name }}</a-tag>
            <a-tag :color="item.Enabled ? '' : 'red'">{{
              item.Enabled ? "启用" : "未启用"
            }}</a-tag>
            <a-tag
              :color="x.isMatch ? 'green' : 'red'"
              v-for="(x, i) in item.matchResults"
              :key="x.id"
            >
              条件{{ i + 1 }}: {{ JSON.parse(x.compareValues) }}
            </a-tag>
          </a-list-item>
          <div slot="header">4.2 规则匹配情况</div>
          <div slot="footer">
            匹配条件着色：
            <a-tag color="green">匹配成功</a-tag>
            <a-tag color="red">匹配失败</a-tag>
          </div>
        </a-list>
        <p></p>
        <a-list
          v-if="matchedRule != null"
          size="small"
          bordered
          :dataSource="deliverResults"
        >
          <a-list-item slot="renderItem" slot-scope="item, index">
            <a-tag color="blue">{{ index + 1 }}</a-tag>
            <a-tag :color="item.isHit ? 'purple' : ''" style="width:150px;">{{ item.deliverType.name }}</a-tag>
            <a-tag>设计命中概率={{ item.deliver.Rate }}%</a-tag>
          </a-list-item>
          <div slot="header">4.2 分配指标</div>
        </a-list>
        <p></p>
        <a-list
          v-if="deliverResult != null"
          size="small"
          bordered
          :dataSource="deliverResult.context['PerfData.Ranges']"
        >
          <a-list-item slot="renderItem" slot-scope="item">
            <a-tag
              :color="
                deliverResult.context['PerfData.RndResult'].Data.Id ==
                item.Data.Id
                  ? 'purple'
                  : ''
              "
              >咨询师ID={{ item.Data.Id }}</a-tag
            >
            <a-tag style="width:150px;">指标数据={{ item.Data.Value }}</a-tag>
            <a-tag style="width:150px;"
              >区间={{ item.Min }}-{{ item.Max }}</a-tag
            >
            <a-progress
              :title="
                '命中概率=' +
                  (
                    (item.Data.Value * 100) /
                    sum(deliverResult.context.PerfData.map(x => x.Value))
                  ).toFixed(2) +
                  '%'
              "
              :percent="
                parseInt(
                  (item.Data.Value * 100) /
                    sum(deliverResult.context.PerfData.map(x => x.Value))
                )
              "
              :showInfo="false"
            />
          </a-list-item>
          <div slot="header">
            4.3 咨询师选择
            <p>
              随机数区间=[0-{{
                sum(deliverResult.context.PerfData.map(x => x.Value))
              }}], 随机数={{ deliverResult.context["PerfData.Rnd"] }}, 结果={{
                deliverResult.context["PerfData.RndResult"].Data.Id
              }}
            </p>
          </div>
          <div slot="footer">
            <p>数据预处理过程</p>
            <ol>
              <li>读取对应指标值</li>
              <li>空值归0</li>
              <li>计算总和，将0值置为总和的10%</li>
            </ol>
          </div>
        </a-list>
      </div>
    </a-card>
    <br />
  </div>
</template>
<script>
const data = [
  "Racing car sprays burning fuel into crowd.",
  "Japanese princess to wed commoner.",
  "Australian walks 100km after outback crash.",
  "Man charged over missing wedding girl.",
  "Los Angeles battles huge wildfires."
];

export default {
  data() {
    return {
      reduced: [],
      requests: [],
      executing: false,
      requestId: "",
      result: {},
      appliedReducers: {},
      rules: [],
      errorType: "",
      error: "",
      matchedRule: null,
      anyRuleMatched: false,
      properties: [],
      deliverResults: [],
      deliverResult: null,
      deliverSuccess: false
    };
  },
  methods: {
    sum(arr) {
      return arr.reduce(function(prev, curr, idx, arr) {
        return prev + curr;
      });
    },
    executTest() {
      this.executing = true;
      this.$doRequest(
        "Rules/ExecuteTest?requestId=" + this.requestId,
        {},
        "POST",
        d => {
          this.executing = false;
          this.result = d.data;
          this.appliedReducers = d.data.reduceResult.source.appliedReducers;
          this.rules = JSON.parse(d.data.handleResult.rules);
          this.reduced = d.data.reduceResult.source.reduced;
          this.matchedRule = d.data.handleResult.matchedRule;
          this.anyRuleMatched = d.data.handleResult.matchedRule != null;
          if (d.data.handleResult.deliverResult) {
            d.data.handleResult.deliverResult.forEach(element => {
              element.deliver = JSON.parse(element.deliver);
              element.context = JSON.parse(element.context);
              if (element.isHit && element.isSuccess) {
                this.deliverResult = element;
                this.deliverSuccess = true;
              }
            });
          }
          this.deliverResults = d.data.handleResult.deliverResult;
          if (d.data.handleResult.error) {
            this.errorType = d.data.handleResult.error.Source;
            this.error = d.data.handleResult.error.Message;
          } else {
            this.errorType = "";
            this.error = "";
          }
          if (d.data.handleResult.matchResults) {
            for (let index = 0; index < this.rules.length; index++) {
              var rule = this.rules[index];
              for (
                let j = 0;
                j < d.data.handleResult.matchResults.length;
                j++
              ) {
                const matchResult = d.data.handleResult.matchResults[j];
                if (matchResult.ruleId == rule.Id) {
                  rule.matchResults = rule.matchResults || [];
                  rule.matchResults.push(matchResult);
                }
              }
            }
          }
          debugger;
        }
      );
    },
    expandObject(value) {
      var array = [];
      var keys = Object.getOwnPropertyNames(value);
      for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        array.push({ name: key, value: value[key] });
      }
      return array;
    },
    handleChange(value) {
      this.requestId = value;
      this.properties = [];
      const item = this.requests.filter(x => x.d().id == value)[0].d();
      var keys = Object.getOwnPropertyNames(item);
      for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        this.properties.push({ name: key, value: item[key] });
      }
      this.result = {};
      this.appliedReducers = [];
      this.rules = [];
      this.reduced = [];
      this.matchedRule = null;
      this.errorType = "";
      this.error = "";
      this.deliverResults = [];
      this.deliverResult = null;
      this.deliverSuccess = false;
    },
    getRequests() {
      this.$doRequest("Rules/GetRequests", {}, "GET", d => {
        this.requests = d.data.map(x => {
          return {
            label:
              x.id.toString().substring(0, 8) +
              " " +
              x.userarea +
              " " +
              x.projectname,
            value: x.id,
            d: (function(x) {
              return function() {
                return x;
              };
            })(x)
          };
        });
      });
    }
  },
  mounted() {
    var that = this;
    this.$nextTick(function() {
      that.getRequests();
    });
  }
};
</script>
<style></style>

dlyaw666-_
