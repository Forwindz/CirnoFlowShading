<template>
  <div 
    :class="this.socketClass"
    :style="this.socketStyleInfo.styleInfo.value+this.socketStyleExtra"
    :title="this.socket.name+' '+this.socketDynamicInfo"></div>
</template>
<script>
import {kebabize} from './../node/utility/utility'
import VueRenderPlugin from "rete-vue-render-plugin";
export default{
    name:"CustomSocket",
    props: ['type', 'socket','used','socketStyleInfo','socketDynamicInfo'],
    mixins: [VueRenderPlugin.Socket],
    methods:{
    },
    computed:{
        socketClass(){
            return `socket ${kebabize(this.type)} ${kebabize(this.socket.name)} ${this.used()?'used':''} ${this.socketStyleInfo.classInfo.value}`
        },
        socketStyleExtra(){
            let basic = 'background-image: conic-gradient('
            if(this.used()){
                basic = 'background-image: conic-gradient(#ffffff 50%,'
            }
            let v = this.socketDynamicInfo;
            if(v.indexOf('texture2D')!=-1){
                basic+="#ff0000,#ff0000,"
            }
            if(v.indexOf('float')!=-1){
                basic+="#7777ff,#7777ff,"
            }
            if(v.indexOf('vec2')!=-1){
                basic+="#00ffff,#00ffff,"
            }
            if(v.indexOf('vec3')!=-1){
                basic+="#ffff00,#ffff00,"
            }
            if(v.indexOf('vec4')!=-1){
                basic+="#77ff00,#77ff00,"
            }
            /*
            if(v.indexOf('null')!=-1){
                basic+=",#ffffff"
            }*/
            basic = basic.substring(0,basic.length-1);
            basic+=");"
            console.log("style_basic",basic)
            return basic;
        }
    }
}
</script>
<style lang="sass" >
@import "@/assets/css/nodeEditor.sass"
</style>