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
import {Variable} from "../node/compile/DataDefine.js"
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
      if (this.ikey) this.putData(this.ikey, new Variable('float',n)); // use putData to transfer data from ui to node graph
      this.emitter.trigger("process"); // let the program compute the result of node graph
    },
  },
  mounted() {
    this.value = this.getData(this.ikey);
    if(!this.value){
      this.value = 0;
      this.putData(this.ikey, new Variable('float',0));
    }else{
      this.putData(this.ikey, new Variable('float',this.value));
    }
  },
};
</script>

