import "@babel/polyfill";
import Rete from "rete";
import NumControl from "../control/NumControl"
import NodeComponent from "../NodeComponent";
import { Method, Variable } from "../compile/DataDefine";
import { float2PointString } from "../utility/utility";
import { methods } from "../compile/PredefinedMethod";


class Floats2RGComponent extends NodeComponent {

    constructor() {
        super("Number To Vec2"); // node title name
    }

    // build a node
    builder(node) {
        super.builder(node);// remember to invoke super first
        this._addNumSocketInput(node,"r","X","float");
        this._addNumSocketInput(node,"g","Y","float");
        this._addNumSocketOutput(node,'rgb', "2D Position/Vector2", "vec2")
        return node;
    }

    worker(node, inputs, outputs) {
        
        // three methods to compute the result, recommend the third method, if too hard, use the first/second method

        //outputs["rgb"] = new Variable("vec3","vec3("+inputs["r"][0]+","+inputs["g"][0]+","+inputs["b"][0]+")");
        const inputs2 = this._extractInput(node,inputs);
        outputs["rgb"]= methods["varying"][0].execute(inputs2);
        //outputs["rgb"] = methodExecute.execute(this._extractInput(inputs2));
        super.worker(node,inputs,outputs); //remember to invoke super last
    }
}

class Floats2RGBComponent extends NodeComponent {

    constructor() {
        super("Number To Vec3"); // node title name
    }

    // build a node
    builder(node) {
        super.builder(node);// remember to invoke super first
        this._addNumSocketInput(node,"r","Red","float");
        this._addNumSocketInput(node,"g","Green","float");
        this._addNumSocketInput(node,"b","Blue","float");
        this._addNumSocketOutput(node,'rgb', "RGB Color/Vector3", "vec3")
        return node;
    }

    worker(node, inputs, outputs) {
        
        // three methods to compute the result, recommend the third method, if too hard, use the first/second method

        //outputs["rgb"] = new Variable("vec3","vec3("+inputs["r"][0]+","+inputs["g"][0]+","+inputs["b"][0]+")");
        const inputs2 = this._extractInput(node,inputs);
        outputs["rgb"]= methods["varying"][1].execute(inputs2);
        //outputs["rgb"] = methodExecute.execute(this._extractInput(inputs2));
        super.worker(node,inputs,outputs); //remember to invoke super last
    }
}
class Floats2RGBAComponent extends NodeComponent {

    constructor() {
        super("Number To Vec4"); // node title name
    }

    // build a node
    builder(node) {
        super.builder(node);// remember to invoke super first
        this._addNumSocketInput(node,"r","Red","float");
        this._addNumSocketInput(node,"g","Green","float");
        this._addNumSocketInput(node,"b","Blue","float");
        this._addNumSocketInput(node,"a","Alpha","float");
        this._addNumSocketOutput(node,'rgb', "RGBA Color/Vector4", "vec4")
        return node;
    }

    worker(node, inputs, outputs) {
        
        // three methods to compute the result, recommend the third method, if too hard, use the first/second method

        //outputs["rgb"] = new Variable("vec3","vec3("+inputs["r"][0]+","+inputs["g"][0]+","+inputs["b"][0]+")");
        const inputs2 = this._extractInput(node,inputs);
        outputs["rgb"]= methods["varying"][2].execute(inputs2);
        //outputs["rgb"] = methodExecute.execute(this._extractInput(inputs2));
        super.worker(node,inputs,outputs); //remember to invoke super last
    }
}



export {
    Floats2RGComponent,
    Floats2RGBComponent,
    Floats2RGBAComponent
}
// then find node/utility/ReteManager.js, 
// import this file, in _buildComponents(){ add component
