<template>
  <div>
    <a-auto-complete
      :loading="loading"
      :dataSource="atc"
      style="width: 200px;"
      @select="handleSearch"
      @search="handleSearch"
      placeholder="搜索标签名称"
      :value="searchValue"
    >
      <a-input>
        <a-icon slot="suffix" type="search" class="certain-category-icon"/>
      </a-input>
    </a-auto-complete>
    <br>
    <a-directory-tree
      :loading="loading"
      class="mytree"
      multiple
      defaultExpandAll
      @select="onSelect"
      @expand="onExpand"
      style="min-height:600px"
    >
      <a-tree-node v-for="(item,index) in dataSource" v-bind:key="index" v-bind:title="item.name">
        <a-tree-node v-for="x in item.items" v-bind:key="x.id" v-bind:title="x.name" isLeaf/>
      </a-tree-node>
    </a-directory-tree>
  </div>
</template>
<script>
export default {
  props: ["dataSource", "loading"],
  data() {
    return {
      searchValue: "",
      minheight: "",
      atc: [
        "> 全部标签",
        "> 录单派单率",
        "> 派单面诊率",
        "> 面诊成交率",
        "> 成交客户数",
        "> 推荐客户数",
        "> 成交GMV"
      ]
    };
  },
  methods: {
    onSelect(keys) {
      console.log(keys);
      this.$emit("select", keys);
    },
    handleSearch(value) {
      this.searchValue = value.replace("> ", "");
      if (this.searchValue === "全部标签") {
        this.searchValue = "";
      }
      this.$emit("search", this.searchValue);
    },
    onExpand() {
      console.log("Trigger Expand");
    }
  }
};
</script>
<style>
.mytree {
  max-height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>