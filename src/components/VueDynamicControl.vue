<template>

  <input
    v-if="type.value!='any'"
    ref="x"
    type="number"
    placeholder="X"
    :readonly="readonly"
    :value="value.length?value:value[0]"
    @input="change($event)"
    @dblclick.stop=""
    @pointerdown.stop=""
    @pointermove.stop=""
  />
  <input
    v-if="type.value!='any' && type.value!='float'"
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
  v-if="type.value!='any' && type.value!='float' && type.value!='vec2'"
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
  v-if="type.value!='any' && type.value!='float' && type.value!='vec2' && type.value!='vec3'"
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
  props: ["readonly", "emitter", "ikey", "getData", "putData","type"],
  data() {
    return {
      value: 0
    };
  },
  methods: {
    change(e) {
      let value = vecString2Float([
            this.$refs.x.value,
            this.$refs.y.value,
            this.$refs.z.value,
            this.$refs.w.value
        ]);
        let finv=0.0;
      switch(this.type.value){
          case "float":
              finv = value[0]
              break;
          case 'vec2':
              finv = [value[0],value[1]]
              break;
          case 'vec3':
              finv = [value[0],value[1],value[2]]
              break;
          case 'vec4':
              finv = [value[0],value[1],value[2],value[3]]
              break;
      }
      this.value = finv;
      //this.update();
    },
    update() {
      //if (this.ikey) this.putData(this.ikey, new Variable(toRaw(this.type),toRaw(this.value)));
     // this.emitter.trigger("process");
    },
  },
  mounted() {
    this.value = this.getData(this.ikey);
    if(!this.value){
      this.value = 0;
      this.putData(this.ikey, new Variable('any','(0.0f)'));
    }else{
      this.putData(this.ikey, new Variable(toRaw(this.type),toRaw(this.value)));
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

