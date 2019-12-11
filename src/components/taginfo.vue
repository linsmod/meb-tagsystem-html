<template>
  <div>
    <a-modal title="标签规则" v-model="visible" @ok="handleOk">
      <p>标签名称：{{info.name}}</p>
      <p>数据类型：{{info.type}}</p>
      <p>标签取值：{{info.description}}</p>
      <p>加工逻辑：{{info.rule}}</p>
    </a-modal>
    <a-card>
      <strong slot="title">{{info.name}}</strong>
      <a href="#" slot="extra" @click="showModal">查看标签规则</a>
      <div
        style="display:table-cell;verticle-align:middle; padding:10px 15px ;border-radius:20px;background-color:#eee"
      >该标签覆盖
        <strong style="padding-right:20px;line-height:21px;">{{info.numberOfUsers}}人</strong>
        <a-badge status="processing" :text="info.updateTime"/>
      </div>
    </a-card>
  </div>
</template>
<script>
export default {
  name: "v-taginfo",
  props: ["info"],
  data() {
    return {
      visible: false
    };
  },
  methods: {
    showModal() {
      this.visible = true;
    },
    handleOk(e) {
      console.log(e);
      this.visible = false;
    }
  }
};
</script>

