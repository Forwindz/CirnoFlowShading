import "@babel/polyfill";
import NodeComponent from "../NodeComponent";
import { Variable } from "../compile/DataDefine";

// this component mainly manage the buffer input data from model (like normal, uv, vertex position, tangent)
class InputComponent extends NodeComponent{

    /**
     * 
     * @param {string} name node name
     * @param {string} socketName socket name
     * @param {Variable} variable a variable to describe its input, it usually is a kind of buffer data. (no constant in some way)
     */
    constructor(name,socketName,variable) {
        super(name);
        this.socketName=socketName;
        this.variable = variable;
    }

    builder(node) {
        super.builder(node);
        this._addNumSocketOutput(node,'num', this.socketName)
        return node;
    }

    worker(node, inputs, outputs) {
        outputs['num'] = this.variable;
        super.worker(node,inputs,outputs);
    }
}

export default InputComponent;
