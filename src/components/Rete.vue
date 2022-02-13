<template>
  <div id="rete" ref="rete"></div>
</template>
<script>
import "@babel/polyfill";
import Rete from "rete";
import ConnectionPlugin from "rete-connection-plugin";
import VueRenderPlugin from "rete-vue-render-plugin";

import ContextMenuPlugin from "rete-context-menu-plugin";
import AreaPlugin from "rete-area-plugin";
import PreviewBox from "../PreviewBox.js"

import NumComponent from '../node/comp/NumComponent'
import AddComponent from '../node/comp/AddComponent'
import OutputComponent from '../node/comp/OutputComponent'


export default {
  data() {
    return { 
      result: ""
    };
  },
  async mounted() {
    let container = this.$refs.rete;//document.querySelector('#rete');
    let components = [new NumComponent(), new AddComponent(), new OutputComponent(), new PreviewBox.PreviewBoxComponent()];
    
    components[2].addWorkEvent((node)=>{
      console.log("--- Final result ---")
      console.log(node.result[0]);
      let r = parseFloat(node.result[0]);
      if(isNaN(r)||r==undefined){
        r = 0.0
      }else{
        r/=256.0
      }
      this.result = r+","+r+","+r //a simple way to implement, TODO: better
      console.log(this.result);
    })
    
    let editor = new Rete.NodeEditor('demo@0.1.0', container);
    editor.use(ConnectionPlugin);
    editor.use(VueRenderPlugin);    
    editor.use(ContextMenuPlugin);
    editor.use(AreaPlugin);
    editor.use(PreviewBox);
    //editor.use(CommentPlugin);
    //editor.use(HistoryPlugin);
    //editor.use(ConnectionMasteryPlugin);

    let engine = new Rete.Engine('demo@0.1.0');
    
    components.map(c => {
        editor.register(c);
        engine.register(c);
    });

    let n1 = await components[0].createNode({num: 2});
    let n2 = await components[0].createNode({num: 0});
    let add = await components[1].createNode();
    let output = await components[2].createNode();
    let pbox = await components[3].createNode();

    n1.position = [80, 200];
    n2.position = [80, 400];
    add.position = [500, 240];
 

    editor.addNode(n1);
    editor.addNode(n2);
    editor.addNode(add);
    editor.addNode(output);
    editor.addNode(pbox);

    editor.connect(n1.outputs.get('num'), add.inputs.get('num'));
    editor.connect(n2.outputs.get('num'), add.inputs.get('num2'));


    editor.on('process nodecreated noderemoved connectioncreated connectionremoved', async () => {
        console.log('process');
        await engine.abort();
        await engine.process(editor.toJSON());
    });

    editor.view.resize();
    AreaPlugin.zoomAt(editor);
    editor.trigger('process');

    this.editor = editor;

    console.log(this.editor);
    
  },
  watch:{
    result:{
      handler(val, oldVal) {
        this.$emit('change-result', this.result)
        console.log("emit!")
      },
      deep: true
    }
  }
};
</script>

<style>
#rete {
  background: "#eeeeee";
  width: 100%;
  height: 100%;
}
</style>