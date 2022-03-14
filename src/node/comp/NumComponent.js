import "@babel/polyfill";
import Rete from "rete";
import NumControl from "../control/NumControl"
import NodeComponent from "../NodeComponent";
import { Variable } from "../utility/DataDefine";

function toFloat(x){
    if (typeof x=="number"){
        return x;
    }else if (typeof x=="string"){
        return parseInt(x)
    }else{
        console.log("Failed to parse "+x);
        console.log(x);
        return 0;
    }
}
class NumComponent extends NodeComponent {

    constructor() {
        super("Number");
    }

    builder(node) {
        super.builder(node);
        this._addNumSocketOutput(node,'num', "Number")
        node.addControl(new NumControl(this.editor, 'num'));
        return node;
    }

    worker(node, inputs, outputs) {
        outputs['num'] = new Variable("float",toFloat(node.data.num));
        super.worker(node,inputs,outputs);
    }

    getPreviewCode(node,inputs,outputs){
        return outputs["num"]+","+outputs["num"]+","+outputs["num"];
    }
}

export default NumComponent;
