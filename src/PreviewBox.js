import "@babel/polyfill";
import Rete from "rete";
import PreviewBoxVue from "./components/PreviewBoxVue.vue";
import { createApp } from 'vue';

// a class for preview box
class PreviewBoxComponent extends Rete.Component {

    constructor(){
        super("PreviewBox")
    }

    worker(node, inputs, outputs) {
    }


    createNode(data){
        let result = new PreviewBoxNode(this.editor);
        result.data=data;
        return result
    }
}
class PreviewBoxNode extends Rete.Node{

    constructor(editor){
        super();
        this.pos = [50,0]
        this.size = [100,100]
        this.editor = editor;
        this.vueContext = null;
        this.name = "PreviewBox"
    }

    createVueComp(el){
        console.log("Hint!")
        console.log(this.editor)
        console.log(this.editor.view)
        let container = this.editor.view.container.firstElementChild;
        console.log(container)
        let app= createApp(PreviewBoxVue)
        app.mount(el)
        console.log(Rete)
        this.vueContext = app; 

    }
    //scan nodes and try to find if the node is in the area
    scanNodes(){
        let nodes = this.editor.nodes;
        //TODO:
    }

    


}

function install(editor) {
    editor.on(
        'rendernode',
        ({ el, node, component, bindSocket, bindControl }) => {
            if (component.render && component.render !== 'vue') return;
            console.log({ el, node, component, bindSocket, bindControl })
            if (node.name == "PreviewBox"){
                node.createVueComp(el); // replaced the view
            }
        }
    );
    //first to do:
    //editor.previewBox = PreviewBox(editor)
    //then, inject view to editor
    // document.getElementById("test").parentNode;
    // create vue comp
    //editor.nodes[i].position[0~1] to obtain node position
    
    // this resolve mouse move
    //https://juejin.cn/post/6844904025314295822
    // and resolve scaling as well,

    // this resolve frame effect (just create two div, stack together)
    // http://jsfiddle.net/89da5cLz/10/

    // now, when node comp https://rete.readthedocs.io/en/latest/Events/
    // update the container of node, if node moves outside, inside, update the event
    // when node compute, update the event
    // the node outputs will be fetched, and send to vue comp as event
    // vue comp react to the comp, update the view

    //editor.view.container
}

export default {
    name: 'preview-box',
    install,
    PreviewBoxComponent
};