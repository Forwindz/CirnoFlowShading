import "@babel/polyfill";
import NodeComponent from '../NodeComponent';
import { methods } from "../compile/PredefinedMethod";
import { Method } from "../compile/DataDefine";

class ComputeComponent extends NodeComponent {
    constructor(name,methods=[]) {
        super(name);
        this.methods = methods;
    }

    builder(node) {
        
        super.builder(node);
        return node;
    }

    worker(node, inputs, outputs) {
        this.clearErrorInfo(node);
        super.worker(node,inputs,outputs)
    }
}

