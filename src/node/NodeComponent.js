import "@babel/polyfill";
import Rete from "rete";
import NumControl from "./control/NumControl"
import EventEmitter from 'events';

const socketTypes = {}
const types = {
    "Number":[],
    "Any":[]
}
for(let k in types){
    socketTypes[k] = new Rete.Socket(k);
}

for(let k in types){
    for(let v of types[k]){
        socketTypes[k].combineWith(socketTypes[v]);
    }
    socketTypes[k].combineWith(socketTypes["Any"]);
}
console.log(socketTypes);

// a utility class for faster coding
class NodeComponent extends Rete.Component {

    constructor(name) {
        super(name);
        this.eventManager = new EventEmitter();
    }

    _addInput(node,key,text,socketType = "Any"){
        let p = new Rete.Input(key,text,socketTypes[socketType]);
        node.addInput(p);
    }

    _addNumSocketInput(node,key,text,socketType="Number"){
        let p =new Rete.Input(key,text,socketTypes[socketType]);
        p.addControl(new NumControl(this.editor, key))
        node.addInput(p);
    }

    _addNumSocketOutput(node,key,text,socketType="Number"){
        node.addOutput(new Rete.Output(key,text,socketTypes[socketType]));
    }


    _textWorker(inputs,grammar){
        let t = grammar;
        for(let k in inputs){
            t = t.replace("#"+k+"#",str(inputs[k]))
        }
        return t;
    }

    addWorkEvent(func){
        this.eventManager.on("work",func);
    }

    removeWorkEvent(func){
        this.eventManager.removeListener("work",func);
    }

    worker(node, inputs, outputs) {
        console.log("Work!------------------------------------------------")
        if(node.data.eventManager==undefined){
            node.data.eventManager = new EventEmitter();
            node.data.addWorkEvent = (func)=>{node.data.eventManager.on("work",func)}
            node.data.removeWorkEvent = (func)=>{node.data.eventManager.removeListener("work",func)}
        }
        node.data.eventManager.emit("work",node,inputs,outputs);
        this.eventManager.emit("work",node, inputs, outputs);
        
        node.data.getPreviewCode = ()=> {
            return this.getPreviewCode(node,node.data.cacheInput,node.data.cacheOutput)
        }
        console.log("installPreview")
        console.log(node)

        if(node.data.cacheOutput==undefined){
            node.data.cacheOutput = outputs;
            node.data.cacheInput = inputs
            
        }else{
            node.data.cacheOutput = outputs;
            node.data.cacheInput = inputs

        }
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
