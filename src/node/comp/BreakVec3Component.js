import "@babel/polyfill";
import NodeComponent from "../NodeComponent";
import { methods } from "../compile/PredefinedMethod";
import { Method } from "../compile/DataDefine";

import NumControl from "../control/NumControl";
import Vec2Control from "../control/Vec2Control";
import Vec3Control from "../control/Vec3Control";
import Vec4Control from "../control/Vec4Control";
class RG2FloatsComponent extends NodeComponent {

    constructor() {
        super("Vec2 to Numbers"); // node title name
    }

    // build a node
    builder(node) {
        super.builder(node);// remember to invoke super first
        this._addNumSocketInput(node,"v","Vector 2D","vec2",Vec2Control);
        this._addNumSocketOutput(node,'r', "X", "float")
        this._addNumSocketOutput(node,'g', "Y", "float")
        return node;
    }

    worker(node, inputs, outputs) {
        
        const inputs2 = this._extractInput(node,inputs);
        outputs["r"]=Method.matchMethod(methods["extract"],"extract_r",inputs2).execute(inputs2)
        outputs["g"]=Method.matchMethod(methods["extract"],"extract_g",inputs2).execute(inputs2)
        
        super.worker(node,inputs,outputs); //remember to invoke super last
    }
}

class RGB2FloatsComponent extends NodeComponent {

    constructor() {
        super("Vec3 to Numbers"); // node title name
    }

    // build a node
    builder(node) {
        super.builder(node);// remember to invoke super first
        this._addNumSocketInput(node,"v","Vector3/RGB Color","vec3",Vec3Control);
        this._addNumSocketOutput(node,'r', "X / Red", "float")
        this._addNumSocketOutput(node,'g', "Y / Green", "float")
        this._addNumSocketOutput(node,'b', "Z / Blue", "float")
        return node;
    }

    worker(node, inputs, outputs) {
        
        const inputs2 = this._extractInput(node,inputs);
        outputs["r"]=Method.matchMethod(methods["extract"],"extract_r",inputs2).execute(inputs2)
        outputs["g"]=Method.matchMethod(methods["extract"],"extract_g",inputs2).execute(inputs2)
        outputs["b"]=Method.matchMethod(methods["extract"],"extract_b",inputs2).execute(inputs2)
        
        super.worker(node,inputs,outputs); //remember to invoke super last
    }
}

class RGBA2FloatsComponent extends NodeComponent {

    constructor() {
        super("Vec4 to Numbers"); // node title name
    }

    // build a node
    builder(node) {
        super.builder(node);// remember to invoke super first
        this._addNumSocketInput(node,"v","Vector4/RGBA Color","vec4",Vec4Control);
        this._addNumSocketOutput(node,'r', "X / Red", "float")
        this._addNumSocketOutput(node,'g', "Y / Green", "float")
        this._addNumSocketOutput(node,'b', "Z / Blue", "float")
        this._addNumSocketOutput(node,'a', "W / Alpha", "float")
        return node;
    }

    worker(node, inputs, outputs) {
        
        const inputs2 = this._extractInput(node,inputs);
        outputs["r"]=Method.matchMethod(methods["extract"],"extract_r",inputs2).execute(inputs2)
        outputs["g"]=Method.matchMethod(methods["extract"],"extract_g",inputs2).execute(inputs2)
        outputs["b"]=Method.matchMethod(methods["extract"],"extract_b",inputs2).execute(inputs2)
        outputs["a"]=Method.matchMethod(methods["extract"],"extract_a",inputs2).execute(inputs2)
        
        super.worker(node,inputs,outputs); //remember to invoke super last
    }
}

export{
    RG2FloatsComponent,
    RGB2FloatsComponent,
    RGBA2FloatsComponent
}