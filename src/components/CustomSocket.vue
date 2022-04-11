<template>
  <div 
    :class="this.socketClass"
    :title="this.socket.name"></div>
</template>
<script>
import {kebabize} from './../node/utility/utility'
import VueRenderPlugin from "rete-vue-render-plugin";
export default{
    name:"CustomSocket",
    props: ['type', 'socket','used'],
    mixins: [VueRenderPlugin.Socket],
    methods:{
    },
    computed:{
        socketClass(){
            return `socket ${kebabize(this.type)} ${kebabize(this.socket.name)} ${this.used()?'used':''}`
        }
    }
}
</script>
<style lang="sass" >
@import "@/assets/css/nodeEditor.sass"
</style>