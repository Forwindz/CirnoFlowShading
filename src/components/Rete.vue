<template>
  <div id="rete" ref="rete"></div>
</template>
<script>
import ReteManager from "./../node/utility/ReteManager"

export default {
  data() {
    return {
      result: "",
    };
  },
  async mounted() {
    let container = this.$refs.rete; //document.querySelector('#rete');
    let rete = new ReteManager(container);
    this.rete=rete;
  },
  watch: {
    result: {
      handler(val, oldVal) {
        console.log("emit!");
        this.$emit("change-result", this.result);
      },
      deep: true,
    },
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