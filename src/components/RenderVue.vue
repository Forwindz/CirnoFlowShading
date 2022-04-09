<template>
  <canvas id="threejscanvas" ref="threejscanvas"></canvas>
</template>
<script>
import {initThree} from "../node/utility/RenderManager"
export default {
    name:"RenderVue",
  mounted() {
      this.$nextTick(()=>{
          console.log(this.$refs)
          initThree(this.$refs.threejscanvas);
           
      })
  }
};
</script>

<style>
#threejscanvas {
    position: absolute;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
</style>