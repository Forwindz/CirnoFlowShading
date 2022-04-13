import "@babel/polyfill";
import Rete, { Socket } from "rete";
import PreviewBox from "./../../components/PreviewBox.vue";
import { createApp,reactive,ref, watch } from 'vue';
import { Variable } from "../compile/DataDefine";
import ModelStore from "../utility/ModelStore";
import {NodeCustomize} from "../NodeComponent"
// a class for preview box
class PreviewBoxComponent extends Rete.Component {

    constructor(){
        super("PreviewBox")
        //this.data.component = PreviewBox
    }

    worker(node, inputs, outputs) {
    }

    builder(node){
        return node;
    }

    createNode(data){
        let result = new PreviewBoxNode(this.editor);
        result.data=data;
        return result
    }

}
class PreviewBoxNode extends NodeCustomize{

    constructor(width = PreviewBoxNode.defaultWidth,height = PreviewBoxNode.defaultHeight){
        super("PreviewBox");
        this.vueContext = null;
        this.width = width;
        this.height = height;
        this.templateData = null;
        this._variable = reactive(new Variable("float",0));
        this._state = ref("unlock")
        this._applyFunc = reactive({func:()=>{},func2:()=>{}});
    }

    // we use this method to create a node
    createVueComp(el){
        console.log("mount!")
        console.log(this.data)
        if(!this.data.modelStore){
            this.data.modelStore = new ModelStore();
        }
        let app= createApp(PreviewBox, {modelStore:this.data.modelStore,
            variable:this._variable,nodeStyle:this.styleInfo,
            state:this._state,
            setState:(v)=>{this.state=v},
            apply:this._applyFunc
        });
        app.mount(el)
        this.el=el;
    }

    set applyFunc(f){
        this._applyFunc.func=f;
    }

    set applyFunc2(f){
        this._applyFunc.func2=f;
    }

    set variable(v){
        Object.assign(this._variable,v);
    }

    set state(v){
        this._state.value = v;
    }

    get state(){
        return this._state.value;
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