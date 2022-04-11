<template>
  <div id="rete" ref="rete" class="node-editor"></div>
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

<style scoped lang="sass">
@import "@/assets/css/nodeEditor.sass"
#rete
  height: 100%
  width: 100%
</style>