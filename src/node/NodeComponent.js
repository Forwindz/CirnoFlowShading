import "@babel/polyfill";
import Rete from "rete";
import NumControl from "./control/NumControl"
import EventEmitter from 'events';
import { Types, Variable } from "./compile/DataDefine";
import { getSocket } from "./compile/Types";
import { textWorker } from "./compile/Compile";
import CustomNode from "./../components/CustomNode"
// a utility class for faster coding
class NodeComponent extends Rete.Component {

    constructor(name) {
        super(name);
        this.eventManager = new EventEmitter();
        this.defaultInput = {};
        this.data.component = CustomNode
    }

    _getSocket(name){
        return getSocket(name);
    }

    _addInput(node,key,text,socketType = "any"){
        let p = new Rete.Input(key,text,getSocket(socketType));
        return node.addInput(p);
    }

    _addNumSocketInput(node,key,text,socketType="float", controlType=NumControl, defaultInput = new Variable("float",0)){
        let p =new Rete.Input(key,text,getSocket(socketType));
        p.addControl(new controlType(this.editor, key))
        this.defaultInput[key]=defaultInput;
        return node.addInput(p);
    }

    _addNumSocketOutput(node,key,text,socketType="float"){
        return node.addOutput(new Rete.Output(key,text,getSocket(socketType)));
    }


    _textWorker(inputs,grammar){
        return textWorker(inputs,grammar)
    }

    // extract input from raw inputs
    // if input is undefined, then use the data in node.data
    // otherwise, return an undefined value
    _extractInput(node,inputs){
        let input2 = {}
        for(let i in inputs){
            input2[i] = this.extractInputKey(node,inputs,i);
        }
        return input2;
    }

    extractInputKey(node,inputs,key){
        if(inputs[key].length){ // is array (input from other node)
            return inputs[key][0]
        }else{ // no connection, but control input
            let t =node.data[key];
            if(!t){ // no control input and connection, use default value
                t = this.defaultInput[key];
                if(!this.defaultInput[key]){
                    console.warn("Unknown key in _extractInput: "+key);
                    console.log(node);
                }
            }
            return t;
        }
    }

    addWorkEvent(func){
        this.eventManager.on("work",func);
    }

    removeWorkEvent(func){
        this.eventManager.removeListener("work",func);
    }

    worker(node, inputs, outputs) {
        this.eventManager.emit("work",node, inputs, outputs);
        
        //TODO: worker.work, implement in the Node Listeners

    }

    builder(node){
        //let spector = new NodeSpector(node);
        return node;
    }
/*
    createNode(data){
        let result = new NodeCustom(this.editor);
        result.data=data;
        return result
    }*/

    

}
/*
class NodeCustom extends Rete.Node{
    constructor(){
        super();
    }

    createVueComp(el){
        this.el=el;
        let app = createApp(null,{})
        app.mount(el);
    }

    setPosition(editor,pos){
        this.position=pos;
        const v = editor.view.nodes.get(this);
        if(v){
            v.translate(pos[0],pos[1]);
        }
    }
}

function install(editor) {
    editor.on(
        'rendernode',
        ({ el, node, component, bindSocket, bindControl }) => {
            if (component.render && component.render !== 'vue') return;
            console.log({ el, node, component, bindSocket, bindControl })
            if (node instanceof NodeCustom){
                node.createVueComp(el); // replaced the view
            }
        }
    );
}*/
/*
export default {
    name: 'highlight-node',
    install
};*/
export default NodeComponent;
