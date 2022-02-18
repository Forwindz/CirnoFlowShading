<template>
  <div>
    
    <button>+</button>
    <button style="float:right">☆</button>
    <button style="float:right">三</button>
    <button style="float:right">?</button>
    <div class="node" v-bind:style="nodeStyle">
      <Scene3D ref="p1" style="width:48%;height:70px;float:left" v-bind:fshader="frag1c"></Scene3D>
      <Scene3D ref="p2" style="width:48%;height:50px;float:right" v-if="show2c" v-bind:fshader="frag2c"></Scene3D>
    </div>
  </div>
  
</template>

<script>
import Scene3D from "./Scene3D.vue"
import { nextTick } from 'vue'
//f*ck framwork

export default {
  name: 'PreviewBoxVue',
  props:["size","frag1","frag2","show2"],
  data:()=>{
    return {}//{size:[300,500]}
  },
  components: {
    Scene3D
  },
  mounted(){
    setInterval(function(){nextTick(); }, 1000);
  },
  methods:{
    forceUpdate(){
      this.$forceUpdate();
    }
  },
  updated:()=>{
    console.log("Updated!!!!!!!!!!!!!!!!!!!!")
  },
  computed:{
    nodeStyle(){
      //console.log("width:"+this.size[0]+"px"+";height:"+this.size[1]+"px")
      return "width:"+this.size[0]+"px"+";height:"+this.size[1]+"px;min-width:0px";
    },
    show2c(){
      console.log("show!!!!!!!!!!!!!!!!!!!")
      return this.show2.value;
    },
    frag1c(){
      console.log("frag1------------------!")
      return this.frag1.value;
    },
    frag2c(){
      console.log("frag2------------------!")
      return this.frag2.value;
    }
  },
  renderTriggered:({ key, target, type })=>{
    console.log("Updated rerender!!!!!!!!!!!!!!!!!!!!"+{ key, target, type })
  },
  watch:{
    frag1:{
      handler:function(newv,oldv){
      console.log("frag1------------------!w")
      },
      immediate: true,
      deep: true
    },
    frag2:{
      handler:function(newv,oldv){
      console.log("frag2------------------!w ")
      console.log(newv)
      console.log(oldv)
      },
      immediate: true,
      deep: true
    },
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
