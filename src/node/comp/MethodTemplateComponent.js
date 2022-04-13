import "@babel/polyfill";
import NodeComponent from '../NodeComponent';
import { methods } from "../compile/PredefinedMethod";
import { Method, Variable } from "../compile/DataDefine";
import NumControl from "../control/NumControl";
import Vec2Control from "../control/Vec2Control";
import Vec3Control from "../control/Vec3Control";
import Vec4Control from "../control/Vec4Control";
import DynamicControl from "../control/DynamicControl";

const MAPPING_SOCKET = {
    'float':NumControl,
    'vec2':Vec2Control,
    'vec3':Vec3Control,
    'vec4':Vec4Control
}

const TYPE_LEVEL = {
    'any':0,
    'float':1,
    'vec2':2,
    'vec3':3,
    'vec4':4,
}

function maxType(t1,t2){
    const v1 = TYPE_LEVEL[t1]
    const v2 = TYPE_LEVEL[t2]
    return v1>v2?v1:v2;
}

function minType(t1,t2){
    const v1 = TYPE_LEVEL[t1]
    const v2 = TYPE_LEVEL[t2]
    return v1<v2?v1:v2;
}

function largestTypeInSet(s){
    let maxT = 'any'
    for(let t of s){
        maxT = maxType(maxT,t)
    }
    return maxT;
}

class MethodsList{
    constructor(methods=[],outputName="Output",inputNames=[]){
        this.methods = methods;
        this.outputSet = Method.gatherMethodsTypeSet(methods,-1);
        this.inputSets = generateInputSets(methods)

        this.outputName = outputName;
        this.inputNames = inputNames;
    }
}
function generateInputSets(methods,maxTypeCount=-1){
    inputSets = []
    for(let i=0;maxTypeCount<0 || i<maxTypeCount;i++){
        let result = Method.gatherMethodsTypeSet(methods,i);
        if(result.size>0){
            inputSets.push(result)
        }else{
            break;
        }
    }
    return inputSets;
}
class ComputeComponent extends NodeComponent {
    constructor(name,methodsLists) {
        super(name);
        this.methodsLists = methodsLists;
        this.inputSets = []
        for(let ml of this.methodsLists){
            while(ml.inputSets.length>this.inputSets.length){
                this.inputSets.push(new Set())
            }
            for(let i=0;i<ml.inputSets.length;i++){
                const mli = ml.inputSets[i]
                let selfi = this.inputSets[i]
                for(let v of mli.values()){
                    selfi.add(v)
                }
            }
        }
    }

    getSocketType(set){
        return 'null'
        /*
        if(set.size>1){
            return set.values()[0]//'any'
        }else if(set.size==1){
            return set.values()[0]
        }else{
            return 'null';
        }
        */
    }

    _createOutputSocket(node,set,key="num_out",name="Output"){
        const output = this.getSocketType(set);
        if(output.name=='null'){
            return;
        }
        this._addNumSocketOutput(node,key,name,output,set);
    }

    _createInputSocket(node,set,key,name){
        const inputSocket = this.getSocketType(set)
        if(inputSocket.name=='null'){
            return;
        }
        this._addNumSocketInput(node,key,name,inputSocket,DynamicControl,set)
    }

    _getInputName(index){
        return this.methodsLists[0].inputNames[index];
    }


    builder(node) {
        super.builder(node);
        let ind=0
        for(let ml of this.methodsLists){
            this._createOutputSocket(node,ml.outputSet,`out_${ind}`,ml.outputName)
            ind++
        }
        for(let i=0;i<this.inputSets.size();i++){
            this._createInputSocket(node,this.inputSets[i],`in_${ind}`,this._getInputName(i))
        }
        return node;
    }

    removeConnections(cs){
        for(const c of cs){
            this.editor.removeConnection(c)
        }
    }

    updateSocketConnections(socket){
        const cs = socket.connections
        for(const c of cs){
            let accept = c.input.checkConnection(c) && c.output.checkConnection(c)
            if(!accept){
                this.editor.removeConnection(c)
            }
        }
    }

    worker(node, inputs, outputs) {
        this.clearErrorInfo(node);
        let realNode = this.getRealNode(node);
        const inputs2 = this._extractInput(inputs);
        //try to match for each output
        let nullMatchMethods = []
        for(let indml=0;indml<this.methodsLists.length;indml++){
            const ml = this.methodsLists[indml]
            const outKey = `out_${indml}`
            const result = Method.matchPartMethods(ml.methods,null,inputs2)
            let outSocket = realNode.outputs.get(outKey);
            if(result.fullMatch.length>0){
                const m = result.fullMatch[0];
                outputs[outKey] = m.execute(inputs2)
                outSocket.setSocket(this._getSocket(outputs[outKey].type.name))
                outSocket.possibleSocket = new Set();
                outSocket.hide = false;
                this.updateSocketConnections(outSocket)
            }else if(result.nullMatch.length>0){ //match part
                for(const m of result.nullMatch){
                    nullMatchMethods.push(m)
                }
                outSocket.setSocket(this._getSocket('null'))
                outSocket.possibleSocket = Method.gatherMethodsTypeSet(result.nullMatch,-1);
                outSocket.hide = false;
                this.updateSocketConnections(outSocket)
            }else{
                outSocket.setSocket(this._getSocket('null'))
                outSocket.possibleSocket = new Set();
                outSocket.hide = true;
                this.removeConnections(outSocket.connections);
            }
            
        }
        
        let inputSets = generateInputSets(nullMatchMethods,this.inputSets.length);
        for(let ind=0;ind<inputSets.length;ind++){
            const inKey = `in_${indml}`
            let inputSocket = realNode.inputs.get(inKey);
            const inputSet = inputSets[ind]
            if(inputSet.size>1){
                inputSocket.setSocket(this._getSocket('null'))
                inputSocket.possibleSocket = inputSet;
                this.updateSocketConnections(inputSocket)
            }else if (inputSet.size==1){
                inputSocket.setSocket(this._getSocket(inputSet.values()[0]))
                this.updateSocketConnections(inputSocket)
            }else {
                inputSocket.setSocket(this._getSocket('null'))
                this.removeConnections(inSocket.connections);
            }
        }

        super.worker(node,inputs,outputs)
    }
}

