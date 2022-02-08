<template>
  <Scene3D style = "width:20%;height:20vh;position:fixed;padding:10px"></Scene3D>
  <Rete style = "width:100%;height:80vh"></Rete>
</template>

<script>
import Rete from './components/Rete.vue'
import Scene3D from './components/Scene3D.vue'
export default {
  name: 'App',
  components: {
    Rete,
    Scene3D
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
