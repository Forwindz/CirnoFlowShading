<template>
  <div v-bind:class="this.nodeClass" v-bind:style="this.node.styleInfo.nodeStyle.styleInfo.value">
  <div class="title">{{node.name}}</div>
  <div class="content">
    <div class="col" v-if="node.controls.size&gt;0 || node.inputs.size&gt;0">
      <div class="input" v-for="input in inputs()" :key="input.key" style="text-align: left">
        <Socket v-socket:input="input" type="input" :socket="input.socket" :used="() => input.connections.length" 
          :socket-style-info="this.node.styleInfo.socketsStyle.get(input)"
          :socket-dynamic-info="this.getSocketDynamicInfoString(input)"
          ></Socket>
        <div class="input-title" v-show="!input.showControl()">{{input.name}}</div>
        <div v-show="input.showControl()" v-control="input.control"
          :class="'input-control '+this.getControlClass(input.control)"
          :style="this.getControlStyle(input.control)"
        ></div>
     </div>
     <div v-for="control in controls()" v-control="control" :key="control" 
     :class="'control '+this.getControlClass(control)"
     :style="this.getControlStyle(control)"></div>
    </div>
    <div class="col">
      <div class="output" v-for="output in outputs()" :key="output.key" style="text-align: right">
        <div class="output-title">{{output.name}}</div>
        <Socket v-socket:output="output" type="output" :socket="output.socket" :used="() => output.connections.length"
          :socket-style-info="this.node.styleInfo.socketsStyle.get(output)"
          :socket-dynamic-info="this.getSocketDynamicInfoString(output)"></Socket>
      </div>
    </div>
  </div> 

  <p 
  class="error-info" 
  style="display:inline-block;width:200px;"
  v-if="this.node.errorInfo_.value!=''"
  >
    {{this.node.errorInfo_.value}}
    </p>

</div>
</template>
<script>
import {kebabize} from './../node/utility/utility'
import CustomSocket from './CustomSocket.vue'
import VueRenderPlugin from "rete-vue-render-plugin";
console.log(VueRenderPlugin.mixin);
export default{
    name:"CustomNode",
    mixins: [VueRenderPlugin.Node],
    methods:{
      used(io){
        return io.connections.length;
      },
      getControlClass(control){
        if(!control){
          return ''
        }
        return this.node.styleInfo.getControl(control).classInfo.value;
      },
      getControlStyle(control){
        if(!control){
          return ''
        }
        return this.node.styleInfo.getControl(control).styleInfo.value;
      },
      getSocketDynamicInfoString(socket){
        
        let st = ""+socket.socket.name
        let sets = socket.possibleSocketTemp;
        if(!sets){
          sets = socket.possibleSocket;
        }
        if(sets){
          for(let s of sets.values()){
            st+= " "+s.name
          }
        }
        return st
      },
      getSocketDynamicInfoList(socket){
        if(socket.possibleSocket){
          let st = []
          for(let s of socket.possibleSocket.values()){
            st.push(s.name)
          }
          return st
        }
        return []
      }
    },
    computed:{
        nodeClass(){
            console.log(`node ${this.selected()} ${kebabize(this.node.name)} `+this.node.styleInfo.nodeStyle.classInfo.value)
            return `node ${this.selected()} ${kebabize(this.node.name)} ${this.node.styleInfo.nodeStyle.classInfo.value}`;
        }
    },
    components: {
      Socket: CustomSocket //VueRenderPlugin.Socket 
    }
}
</script>
<style lang="sass" >
@import "@/assets/css/nodeEditor.sass"
</style>