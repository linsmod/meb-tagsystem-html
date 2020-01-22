<template>
  <a-spin :spinning="detailSpinning">
    <div class="container">
      <a-form :form="form" @submit="handleSubmit">
        <div
          style="border-bottom:1px solid rgb(236, 236, 236);margin:0 0 20px 0;display:flex;flex-decoration:row;justify-content:space-between;"
        >
          <a-form-item
            label="规则名称"
            :label-col="{ span: 8 }"
            :wrapper-col="{ span: 14 }"
          >
            <a-input v-model="details.name" id="name" />
          </a-form-item>
          <div style="margin-right:20px;">
            <span>启用规则</span>
            <a-switch @change="onChange" :checked="details.enabled" />
          </div>
        </div>

        <p class="createNote">
          <span>规则创建时间 ： {{ details.createTime || "" }}</span>
          <span>规则更新时间 ： {{ details.updateTime || "" }}</span>
          <span
            >已分配用户 ：{{ details ? details.usersDelivered : "" }} 人</span
          >
        </p>

        <p class="formTitle">满足下列条件的流量</p>
        <div
          class="chooseBox chooseBox1"
          v-for="(item, index) in details.matches"
          :key="index"
        >
          <!-- 左侧下拉列表 -->
          <a-form-item :wrapper-col="{ span: 5 }" style="margin-left:30px;">
            <!-- 给select绑定value 即编辑时的表单返回的值 -->
            <a-select
              showSearch
              optionFilterProp="children"
              :value="item.typeId"
              @change="handleSelectChange('matchType', $event, index)"
              style="width:300px;"
            >
              <a-select-option
                v-for="(item_1, index_1) in matchTypes"
                :key="index_1"
                :value="item_1.id"
                >{{ item_1.name }}</a-select-option
              >
            </a-select>
          </a-form-item>
          <!-- 右侧下拉列表 -->
          <a-form-item :wrapper-col="{ span: 5 }" style="margin-left:30px;">
            <a-select
              mode="multiple"
              optionFilterProp="children"
              style="width: 300px"
              :value="JSON.parse(item.values)"
              @change="handleSelectChange('matchValue', $event, index)"
            >
              <a-select-option
                v-for="x in getMatchValues(item.typeId)"
                :key="x.key.toString()"
                >{{ x.val }}</a-select-option
              >
            </a-select>
          </a-form-item>
          <a-button
            type="link"
            style="color:red;"
            @click="deletes('matcher', index)"
            >删除</a-button
          >
        </div>
        <a-button
          type="link"
          @click="addSort('matcher')"
          style="margin-bottom:20px"
          :disabled="condition_btn"
          >添加条件</a-button
        >

        <p class="formTitle">按以下分组分配</p>
        <div
          class="chooseBox chooseBox2"
          v-for="(item, index_total) in details.delivers"
          :key="item.id"
        >
          <span class="sort-span sortNum">{{ index_total + 1 }}</span>
          <a-form-item :wrapper-col="{ span: 4 }" style="margin-left:10px;">
            <a-select
              style="width: 80px"
              :value="item.rate"
              @change="handleSelectChange('deliverRate', $event, index_total)"
            >
              <a-select-option
                v-for="_item in flows"
                :key="_item"
                :value="_item"
                >{{ _item }}%</a-select-option
              >
            </a-select>
          </a-form-item>
          <span class="sort-span sortTxt">流量</span>
          <span class="sort-span sortTxt">依据</span>
          <!-- 分组分配数组 -->
          <div class="chooseBox chooseBox1">
            <a-form-item :wrapper-col="{ span: 12 }" style="margin-left:15px;">
              <a-select
                showSearch
                optionFilterProp="children"
                :value="item.typeId"
                @change="handleSelectChange('deliverType', $event, index_total)"
                style="width:200px;"
              >
                <a-select-option
                  v-for="item_1 in deliverTypes"
                  :key="item_1.id"
                  :value="item_1.id || item_1.name"
                  >{{ item_1.name }}</a-select-option
                >
              </a-select>
            </a-form-item>
            <span class="sort-span sortTxt">分配</span>
            <a-button
              type="link"
              style="color:red;margin-top:2px;"
              @click="deletes('deliver', index_total)"
              >删除</a-button
            >
          </div>
        </div>

        <a-button
          type="link"
          @click="addSort('deliver')"
          style="margin-bottom:20px"
          >添加分组</a-button
        >
        <p>
          <a-alert
            v-if="!checking"
            :type="alertType"
            :message="alertMsg"
            banner
          />
        </p>
        <div class="popup" v-show="details.enabled && isConflict">
          <div class="conflictTip">
            <ul>
              <li v-for="(item, index) in conflictedRules" :key="index">
                <span>{{ index + 1 }}</span>
                <span style="width:60px;margin-right:0px;">
                  <span style="width:20px;display:inline-block;">
                    <a-icon
                      class="arrow arrup"
                      type="arrow-up"
                      v-if="index != 0"
                      @click="arrowClick('up', index)"
                  /></span>
                  <span style="width:20px;display:inline-block;">
                    <a-icon
                      class="arrow arrdw"
                      type="arrow-down"
                      v-if="index != conflictedRules.length - 1"
                      @click="arrowClick('down', index)"
                  /></span>
                </span>
                <span
                  style="width:180px;display:inline-block;"
                  :class="item.id == details.id ? 'conflict-current' : ''"
                  >{{ item.name }}</span
                >
              </li>
            </ul>
          </div>
        </div>
        <p v-if="checking">
          <a-spin style="padding-right:5px;">
            <a-icon
              slot="indicator"
              type="loading"
              style="font-size: 24px"
              spin
              size="small"
            />
          </a-spin>
          <span>检测冲突...</span>
        </p>
        <a-form-item :wrapper-col="{ span: 12 }">
          <a-button
            :loading="submitting"
            ref="submitButton"
            :disabled="checking"
            type="primary"
            html-type="submit"
            >保存</a-button
          >
          <span style="padding:5px;"></span>
          <a-button
            v-show="this.details.id == 0"
            type="default"
            @click="cancelAdd"
            >取消</a-button
          >
        </a-form-item>
      </a-form>
    </div>
  </a-spin>
</template>

<script>
export default {
  props: ["id", "rules"],
  data() {
    return {
      details: {
        enabled: true,
        createTime: "",
        updateTime: "",
        delivers: [],
        matches: [],
        name: "",
        id: 0
      },
      submitting: false,
      checking: false,
      formLayout: "inline",
      form: this.$form.createForm(this, { name: "rules" }),
      condition_btn: false, //添加条件 - 按钮权限
      matchTypes: [], //左侧下拉列表 - 匹配类型
      deliverTypes: [], // 分配类型
      cachedValues: [],
      matchers: [], //匹配条件
      num: 1, //分组 -- 排序
      flows: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100], //流量百分比
      tags: [],
      isConflict: false, //是否冲突
      visible: false, //弹窗
      manner: [], //弹窗规则数组
      arr: [], //暂存总的规则数组
      flowSetNum: "", //分组分配流量
      detailSpinning: false,
      conflicts: [],
      conflictedRules: [],
      alertMsg: "...",
      alertType: "info"
    };
  },
  computed: {},
  methods: {
    buildConflictedRules() {
      this.rules.forEach(x => {
        const idx = x.index;
        x.index = typeof x.index == "number" ? x.index : x.order;
        // console.log(
        //   "index changes from " +
        //     idx +
        //     " to " +
        //     x.index +
        //     " for " +
        //     x.name +
        //     " (order=" +
        //     x.order
        // );
      });
      if (this.conflicts.length > 1) {
        this.conflictedRules = [];
        this.rules
          .filter(x => this.conflicts.indexOf(x.id) != -1)
          .sort((a, b) => a.index - b.index)
          .forEach(element => {
            this.conflictedRules.push(element);
          });
      } else {
        return [];
      }
    },
    getMatchValues(typeId) {
      if (typeId == null) {
        return [];
      }
      var values = [];
      var items = this.cachedValues.filter(x => x.typeId == typeId);
      if (items && items.length > 0) {
        values = items[0].values;
      } else {
        values = [];
      }
      if (values.length == 0) debugger;
      return values;
    },
    initialize(details) {
      this.rules.map(x => {
        x.index = x.index || x.order;
      });
      var promises = [];
      promises.push(
        this.$getRuleDeliverTypes().then(x => (this.deliverTypes = x.data))
      );
      promises.push(
        this.$getRuleMatchTypes().then(x => (this.matchTypes = x.data))
      );
      for (let index = 0; index < details.matches.length; index++) {
        const typeId = details.matches[index].typeId;
        promises.push(
          this.$getRuleMatchValues(typeId).then(x => {
            return new Promise((resolve, reject) => {
              this.cachedValues = this.cachedValues.filter(
                x => x.typeId != typeId
              );
              this.cachedValues.push({ typeId: typeId, values: x.data });
              resolve();
            });
          })
        );
      }
      return Promise.all(promises).then(() => {
        this.details = details;
        this.detailSpinning = false;
      });
    },

    /** 停用按钮 - 只是个页面样式 */
    onChange(checked) {
      this.details.enabled = checked;
      this.checkConflict();
    },
    /** 添加条件 */
    addSort(type) {
      switch (type) {
        case "matcher": //添加满足条件的流量
          this.details.matches.push({
            typeId: null,
            values: "[]"
          });
          if (this.details.matches.length == 5) {
            this.$error({ title: "最多5个条件！" });
            this.condition_btn = true;
          }
          break;
        case "deliver":
          this.details.delivers.push({
            values: "[]",
            typeId: null,
            rate: 0
          });
          break;
        default:
          break;
      }
      this.checkConflict();
    },
    /** 切换下拉框 */
    handleSelectChange(type, value, index) {
      switch (type) {
        case "matchType": //匹配类型
          if (this.details.matches[index].typeId == value) {
            return;
          }
          if (
            this.details.matches
              .filter(x => x.typeId != null)
              .filter(x => x.typeId == value).length > 0
          ) {
            this.$error({ title: "不能重复选择！" });
            return;
          }
          var typeId = value;
          this.$getRuleMatchValues(typeId).then(x => {
            this.cachedValues = this.cachedValues.filter(
              x => x.typeId != typeId
            );
            this.cachedValues.push({ typeId: typeId, values: x.data });
            this.details.matches[index].typeId = typeId;
            this.details.matches[index].values = "[]";
            this.checkConflict();
          });
          break;
        case "matchValue": //匹配的值
          this.details.matches[index].values = JSON.stringify(value);
          this.checkConflict();
          break;
        case "deliverType": //分配类型
          this.details.delivers[index].typeId = value;
          break;
        case "deliverRate": //比例
          this.details.delivers[index].rate = value;
          break;
        default:
          break;
      }
    },

    /** 删除 */
    deletes(type, index) {
      if (type == "matcher") {
        this.details.matches.splice(index, 1);
      } else {
        this.details.delivers.splice(index, 1);
      }
      this.checkConflict();
    },
    handleSubmit(e) {
      e.preventDefault();
      this.submitForm(this.details.enabled ? this.hash : null);
    },

    buildFormData() {
      var matchers = this.details.matches.map((item, index) => {
        return {
          id: item.id,
          typeId: item.typeId,
          values: JSON.parse(item.values)
        };
      });
      var delivers = this.details.delivers.map((item, index) => {
        return {
          id: item.id,
          typeId: item.typeId,
          values: item.values,
          rate: item.rate
        };
      });
      return {
        id: this.details.id,
        name: this.details.name,
        enabled: this.details.enabled,
        matchers: matchers,
        delivers: delivers,
        sort: this.rules.sort((a, b) => a.index - b.index).map(x => x.id)
      };
    },
    cancelAdd() {
      this.$emit("cancelAdd");
    },
    /** 判断是否冲突 */
    checkConflict() {
      this.conflicts = [];
      this.isConflict = false;
      if (!this.details.enabled) {
        this.alertMsg = "规则未启用，冲突检测已关闭";
        this.alertType = "success";
        return;
      }
      this.hash = null;
      this.checking = true;
      this.$doHttpPost("Rules/CheckConflict", this.buildFormData())
        .then(d => {
          this.checking = false;
          this.hash = d.hash;
          this.conflicts = d.conflicts;
          if (this.conflicts.length > 1) {
            this.isConflict = true;
            this.alertMsg = "规则间覆盖流量有重叠，请确认或调整执行顺序。";
            this.alertType = "warning";
          } else {
            this.alertMsg = "没有冲突";
            this.alertType = "success";
          }
        })
        .catch(e => {
          this.checking = false;
          this.alertMsg = e.msg;
          this.alertType = "warning";
        });
    },
    /** 最后确认提交表单 */
    submitForm(hash) {
      var url_ = "";
      this.submitting = true;
      if (this.details.id == 0) {
        //新增
        url_ = "Rules/AddRule?hash=" + hash;
      } else {
        url_ = "Rules/UpdateRule?hash=" + hash;
      }
      this.$doRequest(url_, this.buildFormData(), "post", res => {
        this.submitting = false;
        if (res.code == 0) {
          if (this.details.id == 0) {
            //新增
            this.$message.success("添加成功！");
            this.$emit("itemCreated");
          } else {
            this.$message.success("修改成功！");
            this.$emit("itemUpdated", this.details);
          }
        }
      });
    },
    /** 启用规则按钮 接口 */
    startManner() {
      this.$doRequest(
        "Rules/EnableRule",
        {
          id: this.rules[this.index].id,
          enable: this.rules[this.index].enable
        },
        "post",
        res => {
          if (res.code == 0) {
            console.log(res.msg);
          }
        }
      );
    },
    /** 查看冲突规则 */
    viewManner() {
      //弹窗
      this.visible = true;
    },
    /** 箭头点击事件 */
    arrowClick(type, index) {
      var rules = this.conflictedRules;
      var rule = rules[index];
      const current_index = rule.index;
      switch (type) {
        case "up":
          var prev = rules[index - 1];
          rule.index = prev.index;
          prev.index = current_index;
          break;
        case "down":
          var next = rules[index + 1];
          rule.index = next.index;
          next.index = current_index;
          break;
      }
      this.buildConflictedRules();
      console.log("up/down result:");
      rules = this.conflictedRules;
      for (let index = 0; index < rules.length; index++) {
        const element = rules[index];
        console.log(element.name + " " + element.index);
      }
    },
    /** 弹窗确定事件 */
    handleOk(e) {
      this.manner.map((item, index) => {
        let i = this.arr.indexOf(null);
        if (i !== -1) {
          this.arr[i] = item.id;
        }
      });
      this.visible = false;
    },
    /** 获取规则详情 */
    getDetails(id) {
      return new Promise((resolve, reject) => {
        this.detailSpinning = true;
        this.$doRequest(
          "Rules/GetDetail",
          {
            id: id
          },
          "get",
          res => {
            if (res.code == 0) {
              resolve(res);
            }
          }
        );
      });
    }
  },
  watch: {
    id: function(value) {
      this.isConflict = false;
      if (value == 0) {
        this.details = {
          createTime: "",
          updateTime: "",
          enabled: true,
          delivers: [],
          matches: [],
          name: "新建规则" + this.rules.length,
          id: 0
        };
        this.detailSpinning = false;
        this.checkConflict();
      } else {
        this.detailSpinning = true;
        this.getDetails(value).then(x => {
          this.initialize(x.data).then(x => this.checkConflict());
        });
      }
    },
    // rules: function() {
    //   //restore rule index if rule list updated.
    //   for (let i = 0; i < this.rules.length; i++) {
    //     const rule = this.rules[i];
    //     for (let j = 0; j < this.conflictedRules.length; j++) {
    //       const conflictedRule = this.conflictedRules[j];
    //       if (rule.id == conflictedRule) {
    //         rule.index = conflictedRule.index;
    //         console.log("index restored to " + rule.index + " for " + rule.nam);
    //       }
    //     }
    //   }
    // },
    matchers: function() {
      if (this.matchers.length < 5) {
        this.condition_btn = false;
      }
    },
    conflicts: function(value) {
      console.log("buildConflictedRules excute.");
      this.buildConflictedRules();
    }
  }
};
</script>

<style>
.container .createNote span {
  margin-right: 20px;
  color: rgb(138, 136, 136);
}
.container .chooseBox {
  display: flex;
  flex-direction: row;
}
.container .chooseBox .ant-form-item {
  margin-bottom: 16px;
}
.container .formTitle {
  color: rgb(59, 59, 59);
}
.container .chooseBox2 {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  padding-left: 2.5%;
}
.container .chooseBox2 .sort-span {
  margin-top: 8px;
}
.container .chooseBox2 .sortNum {
  display: block;
  width: 20px;
  height: 20px;
  background-color: #1890ff;
  text-align: center;
  line-height: 20px;
  color: #fff;
}
.container .chooseBox2 .sortTxt {
  color: rgb(150, 146, 146);
  margin-left: 10px;
}
.container .conflictTip {
  position: relative;
  margin-bottom: 20px;
}
.container .conflictTip .view {
  color: #1890ff;
  position: absolute;
  right: 42%;
  top: 20%;
  cursor: pointer;
}
.gray {
  color: gray;
}
.popup ul li {
  list-style: none;
  margin-bottom: 10px;
}
.popup ul li > span:first-child {
  width: 20px;
  height: 20px;
  background-color: #1890ff;
  text-align: center;
  line-height: 20px;
  color: #fff;
  display: inline-block;
}
.popup ul li .arrow {
  cursor: pointer;
  margin-right: 10px;
}
</style>
