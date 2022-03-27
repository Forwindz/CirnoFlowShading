<template>

    <div ref="canvas" id="canvas"></div>
    
</template>

<script>
import RenderManager from "../node/utility/RenderManager"
import {toRaw} from "vue"
export default {
    name: 'Scene3D',
    data: function() {
        return {

        }
    },
    props:["modelStore"],
    created: function() {
    },
    rawData:{
        renderManager:null
    },
    mounted: function() {
        // delay, so that we will get correct clientWidth
        let renderManager = this.$options.rawData.renderManager;
        this.$options.rawData.renderManager = renderManager=new RenderManager();
        console.log(renderManager)
        setTimeout(()=>{
            console.log(renderManager)
            renderManager.mountView(this.$refs.canvas)
            renderManager.animate();
        }, 400)
    },
    methods: {
    },
    watch:{
        modelStore:function(newv,oldv){
            console.log("Update Mesh in Scene3D")
            let renderManager = this.$options.rawData.renderManager;
            renderManager.mesh = toRaw(newv).objects;
        }
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
