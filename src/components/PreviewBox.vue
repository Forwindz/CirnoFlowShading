<template>
  <div>
    <div class="node">
        <Scene3D ref="p1" style="width:100%;height:100%;float:left" v-bind:fshader="frag1c"></Scene3D>
        <div ref="text" style="float:left">{{displayText}}</div>
    </div>
  </div>
  
</template>

<script>
import Scene3D from "./Scene3D.vue"
import { Variable } from "../node/compile/DataDefine";

export default {
  name: 'PreviewBox',
  props:["v","width","height","modelStore"],
  data:()=>{
    return {
        displayText:"",
        variables:new Variable("float",0)
    }
  },
  components: {
      Scene3D
  },
  mounted(){
  },
  methods:{
  },
  updated:()=>{
  },
  computed:{
  },
  renderTriggered:({ key, target, type })=>{
    console.log("Updated rerender!!!!!!!!!!!!!!!!!!!!"+{ key, target, type })
  },
  watch:{
    v:{
      handler:function(newv,oldv){
        console.log("Update!");
        if(newv.isConstValue){
            this.displayText = newv.toString();
        }else{
            this.displayText = "";
        }
        

      },
      //immediate: true,
      deep: true
    }
  }
}
</script>

<style scoped lang="scss">
@import "../assets/css/previewBox";

.node {
  background: rgba(0,0,0,0);
  border: 2px solid #4e58bf;
  border-radius: 10px;
  cursor: pointer;
  min-width: 10px;
  height: auto;
  padding-bottom: 6px;
  box-sizing: content-box;
  position: relative;
  user-select: none;
  &:hover {
    background: rgba(0,0,0,0.05);
  }
  &.selected {
    background: rgba(0,0,0,0.1);
    border-color: #e3c000;
  }
  .title {
    color: white;
    font-family: sans-serif;
    font-size: 18px;
    padding: 8px;
  }
  .output {
    text-align: right;
  }
  .input {
    text-align: left;
  }
  .input-title,.output-title {
    vertical-align: middle;
    color: white;
    display: inline-block;
    font-family: sans-serif;
    font-size: 14px;
    margin: $socket-margin;
    line-height: $socket-size;
  }
  .input-control {
    z-index: 1;
    width: calc(100% - #{$socket-size + 2*$socket-margin});
    vertical-align: middle;
    display: inline-block;
  }
  .control {
    padding: $socket-margin $socket-size/2 + $socket-margin;
  }
}
</style>
