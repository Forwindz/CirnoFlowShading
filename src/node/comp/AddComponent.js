import "@babel/polyfill";
import Rete from "rete";
import NumControl from "../control/NumControl"
import NodeComponent from '../NodeComponent';
import { methods } from "../compile/PredefinedMethod";
import { Method } from "../compile/DataDefine";
// dynamic node by: http://jsfiddle.net/vmxdcLbq/27/
class AddComponent extends NodeComponent {
    constructor() {
        super("Add");
    }

    builder(node) {
        
        super.builder(node);
        this._addNumSocketInput(node,'num', "Number1","any")
        this._addNumSocketInput(node,'num2', "Number2","any")
        this._addNumSocketOutput(node,'num', "Result","any")
        node.addControl(new NumControl(this.editor, 'preview', true))
        return node;
    }

    worker(node, inputs, outputs) {
        let realNode = this.editor.nodes.find(n => n.id == node.id);
        let methodList = methods["add"];
        console.log(inputs)
        console.log(outputs)
        let input2 = this._extractInput(node,inputs);
        let method = Method.matchMethod(methodList,"add",input2);
        console.log(method,"method finded");
        let result = method.execute(input2);

        realNode.controls.get('preview').setValue(result.value);
        outputs['num'] = result;
        super.worker(node,inputs,outputs)
        console.log(node);
    }
}

export default AddComponent;
