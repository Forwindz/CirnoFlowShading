import "@babel/polyfill";
import Rete from "rete";
import NumControl from "./control/NumControl"
import EventEmitter from 'events';
import { Types, Variable } from "./compile/DataDefine";
import { getSocket } from "./compile/Types";
import { textWorker } from "./compile/Compile";
class NodeSpector {
    constructor(node){
        node.data.spector = this;
        this._node=node;
        this.cacheInput = {}
        this.cacheOutput = {}
        this.eventManager = new EventEmitter();
    }

    addWorkEvent(func){
        this.eventManager.on("work",func);
    }

    removeWorkEvent(func){
        this.eventManager.removeListener("work",func);
    }

    trigger(inputs,outputs){
        this.eventManager.emit("work",this._node,inputs,outputs)
        this.cacheInput=inputs;
        this.cacheOutput=outputs;
    }
}
// a utility class for faster coding
class NodeComponent extends Rete.Component {

    constructor(name) {
        super(name);
        this.eventManager = new EventEmitter();
        this.defaultInput = {};
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
            if(inputs[i].length){ // is array (input from other node)
                input2[i]=inputs[i][0]
            }else{ // no connection, but control input
                input2[i] = node.data[i];
                if(!input2[i]){ // no control input and connection, use default value
                    input2[i] = this.defaultInput[i];
                    if(!this.defaultInput[i]){
                        console.warn("Unknown key in _extractInput: "+i);
                        console.log(node);
                    }
                }
            }
        }
        return input2;
    }

    addWorkEvent(func){
        this.eventManager.on("work",func);
    }

    removeWorkEvent(func){
        this.eventManager.removeListener("work",func);
    }

    worker(node, inputs, outputs) {
        console.log("work!")
        this.eventManager.emit("work",node, inputs, outputs);
        node.data.spector.trigger(inputs,outputs);
        console.log("work end!")
        //TODO: worker.work, implement in the Node Listeners

    }

    builder(node){
        let spector = new NodeSpector(node);
        return node;
    }

/*
    createNode(data){
        let node = super.createNode(data);
        node.eventManager = new EventEmitter();
        node.addWorkEvent = (func)=>{node.eventManager.on("work",func)}
        node.removeWorkEvent = (func)=>{node.eventManager.removeListener("work",func)}
        console.log(node)
        return new Node2(data,this);//replace, since it use proxy
    }*/
    

}
/*
class Node2 extends Rete.Node{

    constructor(data,comp){
        super()
        this.eventManager = new EventEmitter();
        this.cacheInput= {};
        this.cacheOutput={};
        this.comp=comp;
        this.data=data;
    }

    addWorkEvent(func){
        this.eventManager.on("work",func);
    }

    removeWorkEvent(func){
        this.eventManager.removeListener("work",func);
    }

    getPreviewCode(node){
        return this.comp(this,this.cacheInput,this.cacheOutput)
    }


}*/
export default NodeComponent;
