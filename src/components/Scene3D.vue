<template>

    <div ref="canvas" class="three-js-render-area"></div>
    
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
            globalData.set(this.$refs.canvas,renderManager)
            renderManager.mountView(this.$refs.canvas)
            renderManager.animate();
        })
    },
    beforeUnmount: function(){
        globalData.delete(this.$refs.canvas);
    },
    methods: {
    },
    watch:{
        modelStore:{
            handler(newv,oldv){
                if(!newv){
                    return;
                }
                const _this=this;
                const f = function(){
                    console.log("update scene3D modelStore")
                    let renderManager = globalData.get(_this.$refs.canvas)
                    if(renderManager!=null){
                        renderManager.mesh = toRaw(newv).objects;
                    }else{
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
.three-js-render-area{
    width:100%;
    height:100%;
    z-index: 0;
    background:black;
}
</style>
