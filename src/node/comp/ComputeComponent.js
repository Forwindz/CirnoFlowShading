import "@babel/polyfill";
import Rete from "rete";
import NumControl from "../control/NumControl"
import NodeComponent from '../NodeComponent';
import { methods } from "../compile/PredefinedMethod";
import { Method } from "../compile/DataDefine";
import {MethodTemplateComponent, MethodsList} from "./MethodTemplateComponent"
// dynamic node by: http://jsfiddle.net/vmxdcLbq/27/
class ComputeComponent extends NodeComponent {
    constructor(name,methodTag,displayOp="") {
        super(name);
        this.methodTag = methodTag
        this.displayOp=displayOp
    }

    builder(node) {
        
        super.builder(node);
        this._addNumSocketInput(node,'num', "Number1","any")
        this._addNumSocketInput(node,'num2', this.displayOp+"Number2","any")
        this._addNumSocketOutput(node,'num', "Result","any")
        //node.addControl(new NumControl(this.editor, 'preview', true))
        return node;
    }

    worker(node, inputs, outputs) {
        this.clearErrorInfo(node);
        //let realNode = this.editor.nodes.find(n => n.id == node.id);
        let methodList = methods[this.methodTag];
        let input2 = this._extractInput(node,inputs);
        let method = Method.matchMethod(methodList,this.methodTag,input2);
        if(!method){
            this.setErrorInfo(node,
                `Failed to compute\nPlease change inputs\nInput type:\n Number1:${input2['num'].type} \n Number2:${input2['num2'].type}\nFor example\nYou can use Floats2RGB component to build a vec3\n and DecomposeVec2 to break down vec2 into numbers`
            )
        }
        let result = method.execute(input2);

        //this.setErrorInfo(realNode,"asdhaskjdh aslkdj ddddddddddddddddddddddddddddd"+method)
        
        //realNode.controls.get('preview').setValue(result.value);
        outputs['num'] = result;
        super.worker(node,inputs,outputs)
    }
}

//var addComponent = new ComputeComponent("Add","add");
//var minusComponent = new ComputeComponent("Minus","minus");
//var divComponent = new ComputeComponent("Division","div");
//var multiComponent = new ComputeComponent("Multiply","mult");
var addComponent = new MethodTemplateComponent('Add',
    new MethodsList(methods['add'],'Result',{'num':'Number','num2':'+Number'},['num','num2']));
    var divComponent = new MethodTemplateComponent('Division',
    new MethodsList(methods['div'],'Result',{'num':'Number','num2':'/Number'},['num','num2']));
    var multiComponent = new MethodTemplateComponent('Multiply',
    new MethodsList(methods['mult'],'Result',{'num':'Number','num2':'*Number'},['num','num2']));
var minusComponent = new MethodTemplateComponent('Minus',
    new MethodsList(methods['minus'],'Result',{'num':'Number','num2':'-Number'},['num','num2']));


    export default ComputeComponent;
export{
    addComponent,minusComponent,divComponent,multiComponent
}
