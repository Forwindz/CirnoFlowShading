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
  <input
    ref="z"
    type="number"
    placeholder="Z"
    :readonly="readonly"
    :value="value[2]"
    @input="change($event)"
    @dblclick.stop=""
    @pointerdown.stop=""
    @pointermove.stop=""
  />
  <input
    ref="w"
    type="number"
    placeholder="W"
    :readonly="readonly"
    :value="value[3]"
    @input="change($event)"
    @dblclick.stop=""
    @pointerdown.stop=""
    @pointermove.stop=""
  />
</template>
<script>
import {Variable} from "../node/compile/DataDefine.js"
import {vecString2Float} from "./../node/utility/utility"
import {toRaw} from "vue"
export default {
  name: "VueNumControl",
  props: ["readonly", "emitter", "ikey", "getData", "putData"],
  data() {
    return {
      value: [0,0,0,0],
    };
  },
  methods: {
    change(e) {
      this.value = ([
            this.$refs.x.value,
            this.$refs.y.value,
            this.$refs.z.value,
            this.$refs.w.value
        ]);
      this.update();
    },
    update() {
      let v = vecString2Float([
            this.value[0],
            this.value[1],
            this.value[2],
            this.value[3]
        ]);
      if (this.ikey) this.putData(this.ikey, new Variable('vec4',toRaw(v)));
      this.emitter.trigger("process");
    },
  },
  mounted() {
    this.value = this.getData(this.ikey);
    if(!this.value){
      this.value = [0,0,0,0];
      this.putData(this.ikey, new Variable('vec4',[0,0,0,0]));
    }else{
      this.putData(this.ikey, new Variable('vec4',toRaw(this.value)));
    }
  },
};
</script>
<style scoped>
    input {
        width:50px;
        padding-left: 5px;
        display: inline;
    }
</style>

