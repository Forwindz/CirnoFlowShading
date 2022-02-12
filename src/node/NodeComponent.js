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

    worker(node, inputs, outputs) {
        this.eventManager.emit("work",node);
    }

}

export default NodeComponent;
