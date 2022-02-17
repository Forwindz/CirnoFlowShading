import "@babel/polyfill";
import Rete from "rete";
import NumControl from "../control/NumControl"
import NodeComponent from '../NodeComponent';
class AddComponent extends NodeComponent {
    constructor() {
        super("Add");
    }

    builder(node) {

        this._addNumSocketInput(node,'num', "Number")
        this._addNumSocketInput(node,'num2', "Number2")
        this._addNumSocketOutput(node,'num', "Result")
        return node.addControl(new NumControl(this.editor, 'preview', true))
    }

    worker(node, inputs, outputs) {
        console.log(inputs);
        console.log(outputs);
        var n1 = inputs['num'].length ? inputs['num'][0] : node.data.num1;
        var n2 = inputs['num2'].length ? inputs['num2'][0] : node.data.num2;
        var sum = n1 + n2;

        this.editor.nodes.find(n => n.id == node.id).controls.get('preview').setValue(sum);
        outputs['num'] = sum;
        super.worker(node,inputs,outputs)
    }

    getPreviewCode(node,inputs,outputs){
        return outputs["num"]+","+outputs["num"]+","+outputs["num"];
    }
}

export default AddComponent;
