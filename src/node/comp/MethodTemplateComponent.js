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
    constructor(methods=[],outputName="Output",inputNames=[],inputKeys=[]){
        this.methods = methods;
        this.outputSet = Method.gatherMethodsTypeSet(methods,'');
        this.inputSets = generateInputSets(methods,inputKeys)
        this.inputKeys = inputKeys

        this.outputName = outputName;
        this.inputNames = inputNames;
    }
}
function generateInputSets(methods_,inputKeys = ['']){
    let inputSets = new Map()
    for(const key of inputKeys){
        let result = Method.gatherMethodsTypeSet(methods_,key);
        inputSets.set(key,result)
    }
    return inputSets;
}
class MethodTemplateComponent extends NodeComponent {
    constructor(name,methodsLists) {
        super(name);
        if(!methodsLists.length){
            methodsLists = [methodsLists]
        }
        this.methodsLists = methodsLists;
        this.inputSets = new Map();
        for(let ml of this.methodsLists){
            for(const key of ml.inputSets.keys()){
                const inputSet = ml.inputSets.get(key)
                let selfi = new Set();
                this.inputSets.set(key,selfi);
                for(let v of inputSet.values()){
                    selfi.add(v)
                }
            }
        }
        //console.log(this)
        this.lastConnection = null;
        this.installed = false
        
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
        let p = this._addNumSocketOutput(node,key,name,output);
        p.possibleSocket = this._wrapSocketType(set)
        p.alwaysShowName=true;
    }

    _createInputSocket(node,set,key,name){
        const inputSocket = this.getSocketType(this._wrapSocketType(set))
        if(inputSocket.name=='null'){
            return;
        }
        let p =this._addNumSocketInput(node,key,name,inputSocket,DynamicControl)
        p.possibleSocket=this._wrapSocketType(set);
        p.alwaysShowName=true;
    }

    _getInputName(index){
        return this.methodsLists[0].inputNames[index];
    }

    _getInputKeys(){
        return this.methodsLists[0].inputKeys;
    }


    builder(node) {
        super.builder(node);
        let ind=0
        for(let ml of this.methodsLists){
            this._createOutputSocket(node,ml.outputSet,`out_${ind}`,ml.outputName)
            ind++
        }
        for(const key of this.inputSets.keys()){
            this._createInputSocket(node,this.inputSets.get(key),`${key}`,this._getInputName(key))
        }
        if(!this.installed && this.editor){
            this.installed=true;
            this.editor.on('connectionpath', data => {
                const {
                    points, // array of numbers, e.g. [x1, y1, x2, y2]
                    connection, // Rete.Connection instance
                    d // string, d attribute of <path>
                } = data;
                this.lastConnection = connection;
                //data.d = `M ${x1} ${y1} ${x2} ${y2}`; // you can override the path curve
            });
        }
        return node;
    }

    removeConnections(cs){
        let cs2=[]
        for(const c of cs){
            cs2.push(c)
        }
        for(const c of cs2){
            this.editor.removeConnection(c)
        }
    }

    updateSocketConnections(socket){
        const cs = socket.connections
        let cs2=[]
        for(const c of cs){
            cs2.push(c)
        }
        for(const c of cs2){
            let accept = c.input.checkConnection(c) && c.output.checkConnection(c)
            if(!accept){
                console.log("remove connection",c)
                this.editor.removeConnection(c)
            }
        }
    }

    _wrapSocketType(s){
        let r = new Set();
        if(!s){
            return r;
        }
        for(const v of s.values()){
            r.add(this._getSocket(v))
        }
        return r;
    }

    resetInputSocketsType(realNode){
        for(const key of this.inputSets.keys()){
            const inKey = `${key}`
            let inputSocket = realNode.inputs.get(inKey);
            const inputSet = this.inputSets.get(key)
            inputSocket.setSocket(this._getSocket('null'))
            inputSocket.possibleSocket = this._wrapSocketType(inputSet);
        }
    }
    worker(node, inputs, outputs) {
        this.clearErrorInfo(node);
        let realNode = this.getRealNode(node);
        const inputs2 = this._extractInput(node,inputs);
        //try to match for each output
        let nullMatchMethods = []
        for(let indml=0;indml<this.methodsLists.length;indml++){
            const ml = this.methodsLists[indml]
            const outKey = `out_${indml}`
            const result = Method.matchPartMethods(ml.methods,null,inputs2)
            let outSocket = realNode.outputs.get(outKey);
            //console.log("Match result",result)
            outSocket.possibleSocketTemp =  this._wrapSocketType(Method.gatherMethodsTypeSet(result.allMatch,''));
            //console.log(outSocket.possibleSocketTemp)
            if(result.fullMatch.length>0){
                for(const m of result.fullMatch){
                    nullMatchMethods.push(m)
                }
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
                outSocket.possibleSocket =  this._wrapSocketType(Method.gatherMethodsTypeSet(result.nullMatch,''));
                
                outSocket.hide = false;
                this.updateSocketConnections(outSocket)
            }else{
                outSocket.setSocket(this._getSocket('null'))
                outSocket.possibleSocket = new Set();
                outSocket.hide = true;
                this.updateSocketConnections(outSocket)
                //this.removeConnections(outSocket.connections);
            }
            
        }

        if(nullMatchMethods.length==0){
            this.editor.removeConnection(this.lastConnection);
            this.lastConnection=null;
            this.resetInputSocketsType(realNode);
            this.setErrorInfo(node,"Cannot match");
            throw Error("Cannot match!")
        }else{
            let inputSets = generateInputSets(nullMatchMethods,this._getInputKeys());
            //console.log(inputSets)
            for(const key of inputSets.keys()){
                const inKey = `${key}`
                let inputSocket = realNode.inputs.get(inKey);
                const inputSet = inputSets.get(key)
                inputSocket.possibleSocketTemp = this._wrapSocketType(inputSet);
                //console.log(inputSet)
                if(inputs[key].length==0){
                    continue;
                }
                if(inputSet.size>1){
                    inputSocket.setSocket(this._getSocket('null'))
                    inputSocket.possibleSocket = this._wrapSocketType(inputSet);
                    this.updateSocketConnections(inputSocket)
                }else if (inputSet.size==1){
                    inputSocket.setSocket(this._getSocket([...inputSet.values()][0]));
                    inputSocket.possibleSocket = this._wrapSocketType(inputSet);
                    this.updateSocketConnections(inputSocket)
                }else {
                    //inputSocket.setSocket(this._getSocket('null'))
                    //inputSocket.possibleSocket = new Set();
                    //this.removeConnections(inputSocket.connections);
                    inputSocket.possibleSocket = new Set();
                    this.updateSocketConnections(inputSocket)
                }
            }
            
        }

        realNode.vueContext.$forceUpdate();

        this.resetInputSocketsType(realNode);
        super.worker(node,inputs,outputs)
    }
}

export {MethodTemplateComponent, MethodsList}