<template>
  <div>
    <div class="node" style="width:100px;height:100px">
        <Scene3D ref="p1" style="width:100px;height:100px;margin:3px" v-bind:modelStore="this.modelStore"></Scene3D>
    </div>
  </div>
  
</template>

<script>
import Scene3D from "./Scene3D.vue"
import {toRaw} from "vue"
// TODO: add width/height support
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
    buildMat(){
        console.log("======================================")
        console.log("Update variable!");
        console.log(this.variable);
        this.matBuilder.fragShader = toRaw(this.variable);
        this.modelStore.applyMaterialToAll(toRaw(this.matBuilder.newMaterial))
        console.log("======================================")
    }
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
        console.log(newv,oldv)
        if(!newv){
          return;
        }
        this.matBuilder.mesh = toRaw(newv).sampleMesh;
        this.buildMat();
      },
      immediate: true,
      deep: false
    },
    variable:{
      handler:function(newv,oldv){
        if(!this.modelStore){
          return;
        }
        this.buildMat();
      },
      immediate: true,
      deep: true
    }
  }
}
</script>

