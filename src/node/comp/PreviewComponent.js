import "@babel/polyfill";
import Rete from "rete";
import PreviewBox from "./../../components/PreviewBox.vue";
import { createApp,reactive,ref, watch } from 'vue';
import { Variable } from "../compile/DataDefine";
import ModelStore from "../utility/ModelStore";
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

    constructor(width = PreviewBoxNode.defaultWidth,height = PreviewBoxNode.defaultHeight){
        super();
        this.vueContext = null;
        this.name = "PreviewBox"
        this.width = width;
        this.height = height;
        this.templateData = null;
        this._variable = reactive(new Variable("float",0));
    }

    createVueComp(el){
        console.log("mount!")
        console.log(this.data)
        if(!this.data.modelStore){
            this.data.modelStore = new ModelStore();
        }
        let app= createApp(PreviewBox, {modelStore:this.data.modelStore,variable:this._variable});
        app.mount(el)
        this.el=el;
    }

    set variable(v){
        Object.assign(this._variable,v);
    }
    
    setPosition(editor,pos){
        this.position=pos;
        const v = editor.view.nodes.get(this);
        if(v){
            v.translate(pos[0],pos[1]);

        }
    }

}
PreviewBoxNode.defaultWidth=100;
PreviewBoxNode.defaultHeight=100;

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
    PreviewBoxComponent,PreviewBoxNode
}