import "@babel/polyfill";
import Rete from "rete";
import NumControl from "../control/NumControl"
import NodeComponent from '../NodeComponent';
import { methods } from "../utility/PredefinedMethod";
import { Method } from "../utility/DataDefine";
class AddComponent extends NodeComponent {
    constructor() {
        super("Add");
    }

    builder(node) {
        super.builder(node);
        this._addNumSocketInput(node,'num', "Number1")
        this._addNumSocketInput(node,'num2', "Number2")
        this._addNumSocketOutput(node,'num', "Result")
        return node.addControl(new NumControl(this.editor, 'preview', true))
    }

    worker(node, inputs, outputs) {
        let methodList = methods["add"];
        let input2 = this._extractInput(inputs);
        let method = Method.matchMethod(methodList,"add",input2);
        console.log("Worker+++++++++++++++++++++++++++++")
        console.log(methodList);
        console.log(input2);
        console.log(method);
        let result = method.execute(input2);
        console.log(result);

        this.editor.nodes.find(n => n.id == node.id).controls.get('preview').setValue(result.value);
        outputs['num'] = result;
        super.worker(node,inputs,outputs)
    }

    computeSingle(a,b,lambda){

    }

    getPreviewCode(node,inputs,outputs){
        return outputs["num"]+","+outputs["num"]+","+outputs["num"];
    }
}

export default AddComponent;
