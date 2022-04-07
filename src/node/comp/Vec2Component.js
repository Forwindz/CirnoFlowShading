import "@babel/polyfill";
import Vec2Control from "../control/Vec2Control";
import NodeComponent from "../NodeComponent";
class Vec2Component extends NodeComponent {

    constructor() {
        super("2D Vector");
    }

    builder(node) {
        super.builder(node);
        this._addNumSocketOutput(node,'num', "2D Vector","vec2");
        node.addControl(new Vec2Control(this.editor, 'num'));
        return node;
    }

    worker(node, inputs, outputs) {
        outputs['num'] = node.data.num;
        console.log(outputs);
        super.worker(node,inputs,outputs);
    }
}

export default Vec2Component;
