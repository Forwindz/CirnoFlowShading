<template>
  <div>
    <div class="node" v-bind:style="nodeStyle">
      <Scene3D ref="p1" style="width:48%;height:50px;float:left"></Scene3D>
      <Scene3D ref="p1" style="width:48%;height:50px;float:right"></Scene3D>
    </div>
  </div>
  
</template>

<script>
import Scene3D from "./Scene3D.vue"

export default {
  name: 'PreviewBoxVue',
  props:["size"],
  data:()=>{
    return {}//{size:[300,500]}
  },
  components: {
    Scene3D
  },
  mounted(){
  },
  methods:{
  },
  computed:{
    nodeStyle(){
      //console.log("width:"+this.size[0]+"px"+";height:"+this.size[1]+"px")
      return "width:"+this.size[0]+"px"+";height:"+this.size[1]+"px;min-width:0px";
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
  min-width: $node-width;
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
