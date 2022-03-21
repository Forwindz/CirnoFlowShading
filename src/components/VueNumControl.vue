<template>
  <input
    type="number"
    :readonly="readonly"
    :value="value"
    @input="change($event)"
    @dblclick.stop=""
    @pointerdown.stop=""
    @pointermove.stop=""
  />
</template>
<script>
import {Variable} from "./../node/utility/DataDefine.js"
export default {
  name: "VueNumControl",
  props: ["readonly", "emitter", "ikey", "getData", "putData"],
  data() {
    return {
      value: 0,
    };
  },
  methods: {
    change(e) {
      this.value = e.target.value;
      this.update();
    },
    update() {
      let n = parseFloat(this.value);
      if(!n){
        n=0;
      }
      if (this.ikey) this.putData(this.ikey, new Variable('float',n));
      this.emitter.trigger("process");
    },
  },
  mounted() {
    this.value = this.getData(this.ikey);
  },
};
</script>

