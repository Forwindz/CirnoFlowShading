import "@babel/polyfill";
import Rete from "rete";
import NumControl from "../control/NumControl"
import NodeComponent from "../NodeComponent";

class NumComponent extends NodeComponent {

    constructor() {
        super("Number");
    }

    builder(node) {
        this._addNumSocketOutput(node,'num', "Number")
        node.addControl(new NumControl(this.editor, 'num'));
        return node;
    }

    worker(node, inputs, outputs) {
        outputs['num'] = node.data.num;
        super.worker(node,inputs,outputs);
    }

    getPreviewCode(node,inputs,outputs){
        //console.log(inputs)
        //console.log(outputs)
        return outputs["num"]+","+outputs["num"]+","+outputs["num"];
    }
}

export default NumComponent;
