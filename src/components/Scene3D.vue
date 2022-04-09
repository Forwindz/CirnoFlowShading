<template>

    <div ref="canvas" v-on:click="greet"></div>
    
</template>

<script>
import RenderManager from "../node/utility/RenderManager"
import {toRaw} from "vue"

// vue prevent us from modifying any data inside vue component
// also it is impossible to put the render manager to data, as it cause type issues
// so a bruteforce way to resole this
// key is dom
const globalData = new Map();

export default {
    name: 'Scene3D',
    data: function() {
        return {
        }
    },
    props:["modelStore"],
    created: function() {
    },
    mounted: function() {
        // delay, so that we will get correct clientWidth
        let renderManager = new RenderManager();
        this.$nextTick(function () {
            console.log(this.$refs.canvas)
            globalData.set(this.$refs.canvas,renderManager)
            console.log(renderManager)
            renderManager.mountView(this.$refs.canvas)
            renderManager.animate();
        })
        setTimeout(()=>{
            
        }, 400)
    },
    beforeUnmount: function(){
        globalData.delete(this.$refs.canvas);
    },
    methods: {
        greet:function(e){
            console.log(this);
            console.log(this.renderManager);
        }
    },
    watch:{
        modelStore:{
            handler(newv,oldv){
                const _this=this;
                const f = function(){
                    console.log("update scene3D modelStore")
                    let renderManager = globalData.get(_this.$refs.canvas)
                    console.log(renderManager);
                    console.log(_this.$refs.canvas);
                    if(renderManager!=null){
                        console.log("Update Mesh in Scene3D")
                        renderManager.mesh = toRaw(newv).objects;
                        console.log("Update Mesh in Scene3D completed")
                        console.log(renderManager)
                        console.log(_this)
                        console.log("-----------------------------------")
                    }else{
                        console.log("Scene3D not inited")
                        _this.$nextTick(f);
                    }
                }
                f();
            },
            immediate: true
        }
    },
    computed: {
    }
}
</script>
<style scoped>
#canvas{
    width:100%;
    height:100%;
}
</style>
