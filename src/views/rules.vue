<template>
  <div class="container">
    <a-spin :spinning="spinning">
      <a-row class="row-box">
        <a-col :span="5" class="col-left">
          <ul>
            <li>
              规则
              <a-button type="primary" class="button" @click="addRule"
                >添加规则</a-button
              >
            </li>
            <li
              v-for="(item, index) in sortedRules"
              :key="index"
              @click="changeTab(index)"
              :class="id == item.id ? 'active' : ''"
            >
              {{ item.name }}
              <a-icon type="right" class="icon" />
            </li>
          </ul>
        </a-col>
        <a-col :span="19" class="col-right">
          <RulesDetail
            :id="id"
            :rules="rules"
            @cancelAdd="onCancelAdd"
            @itemUpdated="onItemUpdated"
            @itemCreated="onItemCreated"
            v-if="this.anyRules()"
          ></RulesDetail>
          <div v-else class="noRule">暂无规则，请先添加规则！</div>
        </a-col>
      </a-row>
    </a-spin>
  </div>
</template>

<script>
import RulesDetail from "./rulesDetail";
export default {
  components: {
    RulesDetail
  },
  data() {
    return {
      id: 0,
      spinning: true, //loading
      detailSpinning: true,
      rules: [], //规则列表
      details: {} //规则详情
    };
  },
  computed: {
    sortedRules() {
      return this.rules.slice().sort((a, b) => a.order - b.order);
    }
  },
  mounted() {
    Promise.all([
      this.$getRuleMatchTypes(),
      this.$getRuleDeliverTypes(),
      this.getList()
    ]).catch(e => {
      console.log(e);
      this.$message.error("网络错误");
    });
  },
  methods: {
    onCancelAdd() {
      this.rules = this.rules.filter(x => x.id != 0);
      if (this.anyRules()) this.id = this.id || this.rules[0].id;
    },
    anyRules() {
      return this.rules.length > 0;
    },
    getList() {
      return new Promise((resolve, reject) => {
        this.$doRequest("Rules/GetRules", {}, "get", res => {
          if (res.code == 0) {
            this.spinning = false;
            if (res.data != [] && res.data.length != 0) {
              this.rules = res.data;
              this.$nextTick(function() {
                if (this.anyRules()) {
                  this.id = this.id || this.rules[0].id;
                }
              });
            }
            resolve(this.rules);
          }
        });
      });
    },
    /** 添加规则 */
    addRule() {
      if (this.rules.filter(x => x.id == 0).length > 0) {
        this.$message.info("请先保存或取消正在新增的规则");
        return;
      }
      this.rules.push({
        createTime: "",
        enabled: false,
        id: 0,
        name: "规则" + (this.rules.length + 1),
        order: -1,
        index: -1,
        updateTime: ""
      });
      this.id = 0;
    },
    /** 切换规则 */
    changeTab(index) {
      var id = this.rules[index].id;
      if (id != this.id) {
        this.id = id;
      }
    },

    /** 每次请求接口后刷新页面要做的事 */
    onItemUpdated() {
      //resort
      this.rules.forEach(x => {
        x.order = typeof x.index == "number" ? x.index : x.order;
      });
    },
    onItemCreated() {
      this.getList();
    }
  }
};
</script>

<style>
.container .row-box .col-left {
  overflow: auto;
}
.container .row-box .col-left ul {
  padding: 0;
  height: 800px;
  background-color: rgba(236, 236, 236, 0.514);
  border-left: 1px solid rgba(179, 176, 176, 0.459);
  border-right: 1px solid rgba(179, 176, 176, 0.459);
}
.container .row-box .col-left ul li {
  padding: 0 0 0 15px;
  border-bottom: 1px solid rgba(179, 176, 176, 0.459);
  list-style: none;
  height: 50px;
  line-height: 50px;
}
.active {
  background-color: rgb(223, 219, 219);
}
.container .row-box .col-left ul li .button {
  float: right;
  margin: 10px 10px 0 0;
}
.container .row-box .col-left ul li .icon {
  float: right;
  margin: 20px 10px 0 0;
}
.container .row-box .col-left ul li:first-child {
  background-color: rgb(223, 219, 219);
}
.container .row-box .col-left ul li:hover {
  cursor: pointer;
  background-color: rgb(218, 218, 218);
}
.container .row-box .col-right {
  padding: 0 0 0 30px;
}
.container .row-box .col-right .noRule {
  height: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}
</style>
