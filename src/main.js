import { createApp } from 'vue'
import App from './App.vue'

import "@babel/polyfill";
import Rete from "rete";
import ConnectionPlugin from "rete-connection-plugin";
import VueRenderPlugin from "rete-vue-render-plugin";

import ContextMenuPlugin from "rete-context-menu-plugin";
import AreaPlugin from "rete-area-plugin";

import NumComponent from './node/comp/NumComponent'
import AddComponent from './node/comp/AddComponent'

let app = createApp(App).mount('#app')
/*
let asyncFunc = async () => {
    

    var container = document.querySelector('#rete');
    var components = [new NumComponent(), new AddComponent()];
    
    var editor = new Rete.NodeEditor('demo@0.1.0', container);
    editor.use(ConnectionPlugin);
    editor.use(VueRenderPlugin);    
    editor.use(ContextMenuPlugin);
    editor.use(AreaPlugin);
    //editor.use(CommentPlugin);
    //editor.use(HistoryPlugin);
    //editor.use(ConnectionMasteryPlugin);

    var engine = new Rete.Engine('demo@0.1.0');
    
    components.map(c => {
        editor.register(c);
        engine.register(c);
    });

    var n1 = await components[0].createNode({num: 2});
    var n2 = await components[0].createNode({num: 0});
    var add = await components[1].createNode();

    n1.position = [80, 200];
    n2.position = [80, 400];
    add.position = [500, 240];
 

    editor.addNode(n1);
    editor.addNode(n2);
    editor.addNode(add);

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
    console.log(app)
    console.log(app.$ref)
};

asyncFunc();
*/
