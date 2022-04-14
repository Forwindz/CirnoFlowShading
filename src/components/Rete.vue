<template>
  <div id="rete" ref="rete" class="node-editor"></div>
  <div class="float-panel">
    <span
      class="text"
      style="color: white; padding-bottom: 100px; margin-left: 0px"
      >PreviewBox {{this.enablePreview?'Enabled':'Disabled'}}</span
    >
    <span class="text"><br />.</span>
    <div>
      <label class="switch">
        <input type="checkbox" v-model="this.enablePreview"/>
        <span class="slider round"></span>
      </label>
    </div>
  </div>
</template>
<script>
//TODO: fast coded template, optimize it!
//TODO: resolve warnings
import ReteManager from "./../node/utility/ReteManager";
import { toRaw } from "vue";
export default {
  data() {
    return {
      enablePreview:false,
      previousPressedCtrl:false
    };
  },
  methods:{
    initRete(){
      let container = this.$refs.rete;
      let rete = new ReteManager(container, this.modelStore);
      this.$options.rawData.rete = rete;
    },
    inited(){
      return this.$options.rawData.rete;
    }
  },
  props: ["modelStore"],
  async mounted() {
    //let container = this.$refs.rete;
    if(!this.inited() && this.modelStore){
      this.initRete();
    }
    //let rete = new ReteManager(container, this.modelStore);
    //this.$options.rawData.rete = rete;
    
    document.addEventListener('keydown',(e)=>{
      if(e.ctrlKey){
        this.enablePreview = true
        this.previousPressedCtrl=true;
      }
    })

    document.addEventListener('keypress',(e)=>{
      if(e.charCode == 101){ //TODO: deprecated
        this.enablePreview = !this.enablePreview
      }
    })

    document.addEventListener('keyup',(e)=>{
      if(!e.ctrlKey && this.previousPressedCtrl){
        this.enablePreview = false
        this.previousPressedCtrl=false;
      }
    })
  },
  rawData: {
    rete: null,
  },
  watch: {
    modelStore: function (newv, oldv) {
      console.log("Update Mesh in Scene3D");
      if(!this.inited() && this.modelStore){
        this.initRete();
      }
      if(this.inited()){
        this.$options.rawData.rete.modelStore = toRaw(newv);
      }
      
    },
    enablePreview: {
      handler(newv,oldv){
        console.log("Enable preview!!!!!!!!!!!!",newv,this.$options.rawData.rete);
        if(!this.$options.rawData.rete){
          return;
        }
        this.$options.rawData.rete.previewManager.enablePreview = newv;
      },
      immediate:false

      }
  },
};
</script>

<style scoped lang="sass">
@import "@/assets/css/nodeEditor.sass"
#rete
  height: 100%
  width: 100%
</style>

<style scoped>
/* The switch - the box around the slider */
.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.float-panel {
  left: 10px;
  bottom: 10px;
  z-index: 9999;
  position: fixed;
  padding: 5px;
}

/* Hide default HTML checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgb(173, 173, 173);
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: rgb(219, 219, 219);
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

input:checked + .slider {
  background-color: #2196f3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196f3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(26px);
  -ms-transform: translateX(26px);
  transform: translateX(26px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}
</style>