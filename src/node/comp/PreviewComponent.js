import "@babel/polyfill";
import Rete from "rete";
import PreviewBox from "./../../components/PreviewBox.vue";
import { createApp,reactive,ref } from 'vue';
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
        this.editor = editor;
        this.vueContext = null;
        this.name = "PreviewBox"
    }

    createVueComp(el){
        this.dom = el;
        //this.data.modelStore = reactive(this.data.modelStore)
        let app= createApp(PreviewBox, {modelStore:this.data.modelStore});
        app.mount(el)
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
}

export default {
    name: 'preview-box',
    install
};

export {
    PreviewBoxComponent
}