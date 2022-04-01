import "@babel/polyfill";
import Rete from "rete";
import NumControl from "../control/NumControl"
import NodeComponent from "../NodeComponent";
import { Variable } from "../compile/DataDefine";
import { float2PointString } from "../utility/utility";

class Floats2RGBComponent extends NodeComponent {

    constructor() {
        super("Floats2RGB"); // node title name
    }

    // build a node
    builder(node) {
        super.builder(node);// remember to invoke super first
        this._addNumSocketInput(node,"r","Red","float");
        this._addNumSocketInput(node,"g","Green","float");
        this._addNumSocketInput(node,"b","Blue","float");
        this._addNumSocketOutput(node,'rgb', "RGB Color", "vec3")
        return node;
    }

    worker(node, inputs, outputs) {
        console.log(inputs["r"]);
        console.log(inputs["g"]);
        console.log(inputs["b"]);
        console.log(inputs);
        //outputs["rgb"] = new Variable("vec3","vec3("+inputs["r"][0]+","+inputs["g"][0]+","+inputs["b"][0]+")");
        outputs["rgb"] = new Variable("vec3",`vec3(${float2PointString(inputs["r"][0])},${float2PointString(inputs["g"][0])},${float2PointString(inputs["b"][0])})`);
        console.log(outputs);
        super.worker(node,inputs,outputs); //remember to invoke super last
    }
}

export default Floats2RGBComponent; //export default
// then find node/utility/ReteManager.js, 
// import this file, in _buildComponents(){ add component
//
