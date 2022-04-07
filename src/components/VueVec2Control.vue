<template>
  <input
    ref="x"
    type="number"
    placeholder="X"
    :readonly="readonly"
    :value="value[0]"
    @input="change($event)"
    @dblclick.stop=""
    @pointerdown.stop=""
    @pointermove.stop=""
  />
  <input
    ref="y"
    type="number"
    placeholder="Y"
    :readonly="readonly"
    :value="value[1]"
    @input="change($event)"
    @dblclick.stop=""
    @pointerdown.stop=""
    @pointermove.stop=""
  />
</template>
<script>
import {Variable} from "../node/compile/DataDefine.js"
import {vecString2Float} from "./../node/utility/utility"

export default {
  name: "VueNumControl",
  props: ["readonly", "emitter", "ikey", "getData", "putData"],
  data() {
    return {
      value: [0,0],
    };
  },
  methods: {
    change(e) {
      this.value = vecString2Float([
            this.$refs.x.value,
            this.$refs.y.value
        ]);
      this.update();
    },
    update() {
      if (this.ikey) this.putData(this.ikey, new Variable('vec2',this.value));
      this.emitter.trigger("process");
    },
  },
  mounted() {
    this.value = this.getData(this.ikey);
    if(!this.value){
      this.value = [0,0];
      this.putData(this.ikey, new Variable('vec2',[0,0]));
    }else{
      this.putData(this.ikey, new Variable('vec2',this.value));
    }
  },
};
</script>
<style scoped>
    input {
        width:50px;
        display: inline;
    }
</style>

