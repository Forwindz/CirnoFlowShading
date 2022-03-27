<template>
  <div id="rete" ref="rete"></div>
</template>
<script>
import ReteManager from "./../node/utility/ReteManager";
import {toRaw} from "vue"
export default {
  data() {
    return {
    };
  },
  props: ["modelStore"],
  async mounted() {
    let container = this.$refs.rete;
    let rete = new ReteManager(container, this.modelStore);
    this.$options.rawData.rete = rete;
  },
  rawData:{
    rete:null
  },
  watch: {
    modelStore: function (newv, oldv) {
      console.log("Update Mesh in Scene3D");
      this.$options.rawData.rete.modelStore = toRaw(newv);
    }
  },
};
</script>

<style>
#rete {
  background: "#eeeeee";
  width: 100%;
  height: 100%;
}
</style>