<template>
  <RenderVue></RenderVue>
  
  <Scene3D style = "width:200px;height:200px;position:fixed;padding:10px" ref="previewAll" v-bind:modelStore="this.modelStore"></Scene3D>
  <Rete style = "width:100%;height:100%" v-bind:modelStore="this.modelStore"></Rete>
</template>

<script>
import Rete from './components/Rete.vue'
import Scene3D from './components/Scene3D.vue'
import RenderVue from './components/RenderVue.vue'
import ModelStore from './node/utility/ModelStore'
export default {
  name: 'App',
  data:()=>{
    return {
      modelStore:new ModelStore()
    }
  },
  components: {
    Rete,
    Scene3D,
    RenderVue
  },
  mounted: function() {
    this.loadModel(require('./assets/model/Chocola.glb'));
  },
  methods:{
    async loadModel(path){
      let modelStore = new ModelStore();
      modelStore.load(path,()=>{
        console.log("Load complete");
        this.modelStore=modelStore;
        console.log(this.modelStore)
        });
    }
  },
  computed:{
    fshaders:function(){
      console.log("shader changed :vue!")
      return this.fshaders2;
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  width: 100%;
  height: 100vh;
  padding: 0;
  margin: 0;
}
</style>
