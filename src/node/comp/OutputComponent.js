import "@babel/polyfill";
import Rete from "rete";

import NodeComponent from "../NodeComponent";

class OutputComponent extends NodeComponent{

    constructor(){
        super("OutputComponent");
    }

    builder(node) {
        super.builder(node);
        this._addInput(node,"out","Output Color");
        return node
    }

    worker(node, inputs, outputs) {
        node.result = inputs["out"];
        if (node.result == undefined || node.result.length==0){
            node.result = ["0"];
        }
        super.worker(node,inputs,outputs);
    }
}

export default OutputComponent;