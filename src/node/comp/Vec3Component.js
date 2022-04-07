import "@babel/polyfill";
import Vec3Control from "../control/Vec3Control";
import NodeComponent from "../NodeComponent";
class Vec3Component extends NodeComponent {

    constructor() {
        super("3D Vector");
    }

    builder(node) {
        super.builder(node);
        this._addNumSocketOutput(node,'num', "3D Vector","vec3");
        node.addControl(new Vec3Control(this.editor, 'num'));
        return node;
    }

    worker(node, inputs, outputs) {
        outputs['num'] = node.data.num;
        console.log(outputs);
        super.worker(node,inputs,outputs);
    }
}

export default Vec3Component;
