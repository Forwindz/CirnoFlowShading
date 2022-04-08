import "@babel/polyfill";
import Vec3Control from "../control/Vec3Control";
import NodeComponent from "../NodeComponent";
//TODO: 
/*
class BreakVec3Component extends NodeComponent {

    constructor() {
        super("Break Vec3");
    }

    builder(node) {
        super.builder(node);
        this._addNumSocketInput(node,"num","Vec3","vec3",Vec3Control);
        this._addNumSocketOutput(node,'numx', "X","float");
        this._addNumSocketOutput(node,'numy', "Y","float");
        this._addNumSocketOutput(node,'numz', "Z","float");
        return node;
    }

    worker(node, inputs, outputs) {
        outputs['num'] = node.data.num;
        console.log(outputs);
        super.worker(node,inputs,outputs);
    }
}

export default Vec3Component;
*/
