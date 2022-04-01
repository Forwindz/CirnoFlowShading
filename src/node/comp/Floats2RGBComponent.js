import "@babel/polyfill";
import Rete from "rete";
import NumControl from "../control/NumControl"
import NodeComponent from "../NodeComponent";
import { Method, Variable } from "../compile/DataDefine";
import { float2PointString } from "../utility/utility";


const methodExecute = new Method("floats2rgb",
        {  
            "r":"float",
            "g":"float",
            "b":"float"
        },"vec3",
        (r,g,b)=>{return [r,g,b];},
        "vec3(#r#,#g#,#b#)"
        )

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
        
        // three methods to compute the result, recommend the third method, if too hard, use the first/second method

        //outputs["rgb"] = new Variable("vec3","vec3("+inputs["r"][0]+","+inputs["g"][0]+","+inputs["b"][0]+")");
        const inputs2 = this._extractInput(node,inputs);
        console.log(inputs)
        console.log(inputs2)
        console.log(node.data);
        outputs["rgb"] = new Variable("vec3",`vec3(${inputs2["r"]},${inputs2["g"]},${inputs2["b"]})`);
        //outputs["rgb"] = methodExecute.execute(this._extractInput(inputs2));
        console.log(outputs)
        super.worker(node,inputs,outputs); //remember to invoke super last
    }
}

export default Floats2RGBComponent; //export default
// then find node/utility/ReteManager.js, 
// import this file, in _buildComponents(){ add component
