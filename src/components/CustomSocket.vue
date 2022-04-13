<template>
  <div 
    :class="this.socketClass"
    :style="this.socketStyleInfo.styleInfo.value"
    :title="this.socket.name"></div>
</template>
<script>
import {kebabize} from './../node/utility/utility'
import VueRenderPlugin from "rete-vue-render-plugin";
export default{
    name:"CustomSocket",
    props: ['type', 'socket','used','socketStyleInfo'],
    mixins: [VueRenderPlugin.Socket],
    methods:{
    },
    computed:{
        socketClass(){
            console.log(this.socket)
            console.log(this.socket.name)
            return `socket ${kebabize(this.type)} ${kebabize(this.socket.name)} ${this.used()?'used':''} ${this.socketStyleInfo.classInfo.value}`
        }
    }
}
</script>
<style lang="sass" >
@import "@/assets/css/nodeEditor.sass"
</style>