<template>

    <div ref="canvas" id="canvas"></div>
    
</template>

<script>
import RenderManager from "../node/utility/RenderManager"
export default {
    name: 'Scene3D',
    data: function() {
        return {
        }
    },
    props:[],
    created: function() {
    },
    mounted: function() {
        // delay, so that we will get correct clientWidth
        setTimeout(()=>{
            this.initRender();
        }, 400)
    },
    methods: {
        initRender:function(){
            this.renderManager = new RenderManager();
            this.renderManager.mountView(this.$refs.canvas)
            this.renderManager.animate();

        }
    },
    watch:{
    },
    computed: {
    }
}
</script>
<style>
canvas {
    width: 100vw;
    height: 100vh;
}
</style>
