<template>
  <div>
    <div class="node" style="width:100px;height:100px">
        <Scene3D ref="p1" style="width:100px;height:100px;float:left" v-bind:modelStore="this.modelStore"></Scene3D>
        <div ref="text" style="float:left">{{displayText}}</div>
    </div>
  </div>
  
</template>

<script>
import Scene3D from "./Scene3D.vue"
import {toRaw} from "vue"
import { Variable } from "../node/compile/DataDefine";

import ModelStore from '../node/utility/ModelStore';
import MaterialBuilder from '../node/utility/MaterialBuilder';
export default {
  name: 'PreviewBox',
  props:["modelStore","variable"],
  data:()=>{
    return {
        displayText:"",
        matBuilder:new MaterialBuilder()
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
    modelStore:{
      handler:function(newv,oldv){
        this.matBuilder.mesh = toRaw(newv).sampleMesh;
      },
      immediate: true,
      deep: false
    },
    variable:{
      handler:function(newv,oldv){
        console.log("======================================")
        console.log("Update variable!");
        console.log(newv);
        this.matBuilder.fragShader = toRaw(newv);
        this.modelStore.applyMaterialToAll(toRaw(this.matBuilder.newMaterial))
        console.log("======================================")
      },
      immediate: true,
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
