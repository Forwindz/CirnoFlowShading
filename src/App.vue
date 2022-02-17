<template>
  <Scene3D style = "width:20%;height:20vh;position:fixed;padding:10px" ref="previewAll" v-bind:fshader="fshaders"></Scene3D>
  <Rete style = "width:100%;height:80vh" @changeResult="onChangeResult"></Rete>
</template>

<script>
import Rete from './components/Rete.vue'
import Scene3D from './components/Scene3D.vue'
import PreviewBoxVue from './components/PreviewBoxVue.vue'
import { computed } from '@vue/runtime-core'
export default {
  name: 'App',
  data:()=>{
    return {
      "fshaders2":""
    }
  },
  components: {
    Rete,
    Scene3D
  },
  methods:{
    onChangeResult(result){
      console.log("Detect changes")
      this.fshaders2 = result
      console.log(result)
      //this.$refs.previewAll.fshader = result;
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
