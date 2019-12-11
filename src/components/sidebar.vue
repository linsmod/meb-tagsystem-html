<template>
  <a-menu mode="vertical" :selectedKeys="selectedKeys()" @click="click" style="height: 100%">
    <a-menu-item v-for="x in dataSource" :key="x.name">
      <a-icon :type="x.meta.icon"/>
      <span>{{x.meta.title}}</span>
    </a-menu-item>
    <!-- <a-menu-item key="2" v-on:click="route('USER_QUERY')">
      <a-icon type="search"/>
      <span>用户细查</span>
    </a-menu-item>-->
  </a-menu>
</template>

<script>
export default {
  name: "v-sidebar",
  props: ["dataSource"],
  computed: {},
  methods: {
    selectedKeys() {
      return [this.$route.name || ""];
    },
    click(item, key, keyPath) {
      console.log(item);
      this.$emit("menu-click", item);
    }
  }
};
</script>
