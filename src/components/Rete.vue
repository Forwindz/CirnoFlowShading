<template>
  <div id="rete"></div>
</template>
<script>
import "@babel/polyfill";
import Rete from "rete";
import ConnectionPlugin from "rete-connection-plugin";
import VueRenderPlugin from "rete-vue-render-plugin";

import ContextMenuPlugin from "rete-context-menu-plugin";
import AreaPlugin from "rete-area-plugin";


export default {
  data() {
    return { editor: null };
  },
  async mounted() {
    /*
    const container = document.querySelector('#rete')
    console.log(container);
    this.editor =new Rete.NodeEditor('rete@1.0.0', container)
    this.editor.use(VueRenderPlugin)
    this.editor.use(ConnectionPlugin, { curvature: 0.4 })
    this.editor.use(ContextMenuPlugin)
    this.editor.use(AreaPlugin, {
      background: false,
      scaleExtent: { min: 0.5, max: 1.5 }
    })
    this.editor.trigger('process')*/
    
  },
};
</script>

<style>
#rete {
  background: "#eeeeee";
  width: 100%;
  height: 100%;
}
</style>