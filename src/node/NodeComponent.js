import "@babel/polyfill";
import Rete from "rete";
import NumControl from "./control/NumControl"
import EventEmitter from 'events';
import { Types } from "./utility/DataDefine";
import { getSocket } from "./utility/Types";
import { textWorker } from "./utility/Compile";
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
    }

    _getSocket(name){
        return getSocket(name);
    }

    _addInput(node,key,text,socketType = "any"){
        let p = new Rete.Input(key,text,getSocket(socketType));
        node.addInput(p);
    }

    _addNumSocketInput(node,key,text,socketType="float"){
        let p =new Rete.Input(key,text,getSocket(socketType));
        p.addControl(new NumControl(this.editor, key))
        node.addInput(p);
    }

    _addNumSocketOutput(node,key,text,socketType="float"){
        node.addOutput(new Rete.Output(key,text,getSocket(socketType)));
    }


    _textWorker(inputs,grammar){
        return textWorker(inputs,grammar)
    }

    _extractInput(inputs){
        let input2 = {}
        for(let i in inputs){
            input2[i]=inputs[i][0]
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
        this.eventManager.emit("work",node, inputs, outputs);
        node.data.spector.trigger(inputs,outputs);

    }

    builder(node){
        let spector = new NodeSpector(node);
        return node;
    }

    getPreviewCode(node, inputs, outputs){
        return "0,0,0"
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
