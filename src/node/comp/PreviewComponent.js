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

    constructor(){
        super();
        this.vueContext = null;
        this.name = "PreviewBox"
        this.width = 100;
        this.height = 100;
    }

    createVueComp(el){
        //this.dom = el;
        //this.data.modelStore = reactive(this.data.modelStore)
        console.log("mount!")
        console.log(this.data)
        let app= createApp(PreviewBox, {modelStore:this.data.modelStore});
        app.mount(el)
    }
    
    setPosition(editor,pos){
        this.position=pos;
        editor.view.nodes.get(this).translate(pos[0],pos[1]);
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