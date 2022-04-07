import "@babel/polyfill";
import Vec4Control from "../control/Vec4Control";
import NodeComponent from "../NodeComponent";
class Vec4Component extends NodeComponent {

    constructor() {
        super("4D Vector");
    }

    builder(node) {
        super.builder(node);
        this._addNumSocketOutput(node,'num', "4D Vector","vec4");
        node.addControl(new Vec4Control(this.editor, 'num'));
        return node;
    }

    worker(node, inputs, outputs) {
        outputs['num'] = node.data.num;
        console.log(outputs);
        super.worker(node,inputs,outputs);
    }
}

export default Vec4Component;
