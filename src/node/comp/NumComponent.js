import "@babel/polyfill";
import Rete from "rete";
import NumControl from "../control/NumControl"
import NodeComponent from "../NodeComponent";
import { Variable } from "../compile/DataDefine";
import { string2Float } from "../utility/utility";

class NumComponent extends NodeComponent {

    constructor() {
        super("Number");
    }

    builder(node) {
        super.builder(node);
        this._addNumSocketOutput(node,'num', "Number")
        const control = new NumControl(this.editor, 'num');
        node.addControl(control);
        return node;
    }

    worker(node, inputs, outputs) {
        outputs['num'] = node.data.num;
        console.log("Output num")
        console.log(node.data.num)
        super.worker(node,inputs,outputs);
    }
}

export default NumComponent;