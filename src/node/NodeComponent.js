import "@babel/polyfill";
import Rete from "rete";
import NumControl from "./control/NumControl"
import EventEmitter from 'events';
import { Types, Variable } from "./compile/DataDefine";
import { getSocket } from "./compile/Types";
import { textWorker } from "./compile/Compile";
import CustomNode from "./../components/CustomNode"
import {ref} from "vue"

class StyleManager{
    constructor(classInfo_="",styleInfo_=""){
        this.classInfo=ref(classInfo_),
        this.styleInfo=ref(styleInfo_)
    }

    addClass(v){
        if(this.classInfo.value.indexOf(v)==-1){
            this.classInfo.value += ` ${v}`
        }
    }

    removeClass(v){
        this.classInfo.value = this.classInfo.value.replace(` ${v}`,'');
    }

    addStyle(v){
        this.styleInfo.value += `;${v}`
    }

    removeStyle(v){
        this.styleInfo.value = this.styleInfo.value.replace(`;${v}`,'');
    }


}
function makeStyleData(classInfo_="",styleInfo_=""){
    return new StyleManager();
}

class NodeStyleData{
    constructor(){
        this.nodeStyle = makeStyleData();
        this.socketsStyle = new Map();
        this.controlsStyle = new Map(); // control changes frequently, so we use string as key
        //this.nodeRef = null;
    }

    applyNode(node){
        //this.noderef = node;
        for(const s of node.inputs.values()){
            this.addSocket(s)
            this.addControl(s.control)
        }
        for(const s of node.outputs.values()){
            this.addSocket(s)
            this.addControl(s.control)
        }

        for(const c of node.controls.values()){
            this.addControl(c)
        }
    }

    genControlID(control){
        return `${control.parent.id}_${control.key}`
    }

    addControl(control){
        if(!control){
            return;
        }
        const id = this.genControlID(control);
        this.controlsStyle.set(id,makeStyleData())
    }

    getControl(control){
        return this.controlsStyle.get(this.genControlID(control));
    }

    addSocket(socket){
        this.socketsStyle.set(socket,makeStyleData())
    }

    clone(){
        let n = new NodeStyleData();
        //TODO: clone operations
        return n;
    }

}

//set up Node function

// a utility class for faster coding
class NodeComponent extends Rete.Component {

    constructor(name) {
        super(name);
        this.eventManager = new EventEmitter();
        this.defaultInput = {};
        this.data.component = CustomNode
    }

    _getSocket(name){
        return getSocket(name);
    }

    _addInput(node,key,text,socketType = "any"){
        let p = new DynamicInput(key,text,getSocket(socketType));
        node.addInput(p);
        return p;
    }

    _addNumSocketInput(node,key,text,socketType="float", controlType=NumControl,possibleSocket=null, defaultInput = null){
        let p =new DynamicInput(key,text,getSocket(socketType));
        p.addControl(new controlType(this.editor, key))
        this.defaultInput[key]=defaultInput;
        if(possibleSocket){
            p.possibleSocket = possibleSocket;
        }
        node.addInput(p);
        return p;
    }

    _addNumSocketOutput(node,key,text,socketType="float",possibleSocket=null){
        let p = new DynamicOutput(key,text,getSocket(socketType));
        if(possibleSocket){
            p.possibleSocket=possibleSocket;
        }
        node.addOutput(p);
        return p
    }


    _textWorker(inputs,grammar){
        return textWorker(inputs,grammar)
    }

    // extract input from raw inputs
    // if input is undefined, then use the data in node.data
    // otherwise, return an undefined value
    _extractInput(node,inputs){
        let input2 = {}
        for(let i in inputs){
            input2[i] = this.extractInputKey(node,inputs,i);
        }
        return input2;
    }

    extractInputKey(node,inputs,key){
        if(inputs[key].length){ // is array (input from other node)
            return inputs[key][0]
        }else{ // no connection, but control input
            let t =node.data[key];
            if(!t){ // no control input and connection, use default value
                t = this.defaultInput[key];
                if(!this.defaultInput[key]){
                    console.warn("Unknown key in _extractInput: "+key);
                    console.log(node);
                    return null
                }
            }
            return t;
        }
    }

    addWorkEvent(func){
        this.eventManager.on("work",func);
    }

    removeWorkEvent(func){
        this.eventManager.removeListener("work",func);
    }

    worker(node, inputs, outputs) {
        this.eventManager.emit("work",node, inputs, outputs);
        
        //TODO: worker.work, implement in the Node Listeners

    }

    async builder(node){
        return node;
    }

    //completely cover the parent method
    async createNode(data={}){
        let result = new NodeCustomize(this.name);
        result.data=data;
        await this.build(result);
        result.styleInfo.applyNode(result);
        return result
    }

    setErrorInfo(node,info){
        this.editor.nodes.find(n => n.id == node.id).errorInfo = info;
    }
    
    clearErrorInfo(node){
        this.setErrorInfo(node,"")
    }

    getRealNode(node){
        return this.editor.nodes.find(n => n.id == node.id)
    }
}
/*
Rete.IO.prototype.setSocket = function(socket){
    if(this.socket==socket){
        return;
    }
    for(let c of this.connections){

    }
}*/

class DynamicInput extends Rete.Input{
    constructor(key, title, socket, multiConns = false) {
        super(key, title, socket, multiConns);
        this.hide = false;
        this.alwaysShowName = false;
        this.possibleSocket = new Set(); // a list of possible socket type
        this.possibleSocketTemp = new Set(); // a list of possible socket type
    }

    setSocket(socket){
        if(this.socket==socket){
            return;
        }
        if(typeof socket=="string"){
            socket = getSocket(socket);
        }else if(socket==null){
            socket = getSocket('null')
        }
        this.socket = socket;
    }

    checkConnection(connection){
        return true;
    }

    showControl(){
        return (super.showControl() && !this.hide) && !this.alwaysShowName
    }
}

class DynamicOutput extends Rete.Output{
    constructor(key, title, socket, multiConns = true) {
        super(key, title, socket, multiConns);
        this.hide = false;
        this.alwaysShowName = false;
        this.possibleSocket = new Set(); // a list of possible socket type, 
        this.possibleSocketTemp = new Set(); 
    }

    setSocket(socket){
        if(this.socket==socket){
            return;
        }
        if(typeof socket=="string"){
            socket = getSocket(socket);
        }else if(socket==null){
            socket = getSocket('null')
        }
        this.socket = socket;
    }


    connectTo(input) {
        console.log("Try connection",input,this)
        if (!input.multipleConnections && input.hasConnection())
            throw new Error('Input already has one connection');
        if (!this.multipleConnections && this.hasConnection())
            throw new Error('Output already has one connection');
        
        let flag = false;
        for(let thisSocket of this.possibleSocket.values()){
            for(let inputSocket of input.possibleSocket.values()){
                if(thisSocket.compatibleWith(inputSocket)){
                    flag=true;
                    break;
                }
            }
            if(flag){
                break;
            }
        }
        if(!flag){
            for(let inputSocket of input.possibleSocket.values()){
                if(this.socket.compatibleWith(inputSocket)){
                    flag=true;
                    break;
                }
            }
        }
        if(!flag){
            
            for(let thisSocket of this.possibleSocket.values()){
                if(thisSocket.compatibleWith(input.socket)){
                    flag=true;
                    break;
                }
            }
        }
        if (!flag && !this.socket.compatibleWith(input.socket)){
            throw new Error('Sockets not compatible');
        }

        const connection = new Rete.Connection(this, input);

        this.connections.push(connection);
        return connection;
    }

    checkConnection(connection){
        const input = connection.input
        const _this = connection.output
        //if (!input.multipleConnections && input.hasConnection())
        //    return false;
        //if (!this.multipleConnections && this.hasConnection())
        //return false;
        
        for(let thisSocket of _this.possibleSocket.values()){
            for(let inputSocket of input.possibleSocket.values()){
                if(thisSocket.compatibleWith(inputSocket)){
                    return true;
                }
            }
        }

        
        for(let inputSocket of input.possibleSocket.values()){
            if(_this.socket.compatibleWith(inputSocket)){
                return true;
            }
        }
        for(let thisSocket of _this.possibleSocket.values()){
            if(thisSocket.compatibleWith(input.socket)){
                return true;
            }
        }
        if (!_this.socket.compatibleWith(input.socket)){
            return false;
        }
        return true;
    }

    showControl(){
        return (super.showControl() && !this.hide) && !this.alwaysShowName
    }
}
/*
function installMethod(classType){
    classType.prototype.setSocket = function(socket){
        
    }
}*/

class NodeCustomize extends Rete.Node{

    constructor(name){
        super(name);
        this.styleInfo = new NodeStyleData();
        this.errorInfo_ = ref('')
    }

    set errorInfo(x){
        this.errorInfo_.value=x
    }

    set nodeStyle(s){
        this.styleInfo.nodeStyle.styleInfo.value = s
    }

    set nodeClass(s){
        this.styleInfo.nodeStyle.classInfo.value = s
    }

    setSocketStyle(socket,s){
        this.styleInfo.socketsStyle.get(socket).styleInfo.value = s;
    }

    setSocketClass(socket,s){
        this.styleInfo.socketsStyle.get(socket).styleClass.value = s;
    }

    addNodeStyle(s){
        this.styleInfo.nodeStyle.addStyle(s);
    }

    removeNodeStyle(s){
        this.styleInfo.nodeStyle.removeStyle(s);
    }

    addNodeClass(s){
        this.styleInfo.nodeStyle.addClass(s);
    }

    removeNodeClass(s){
        this.styleInfo.nodeStyle.removeClass(s);
    }


    addSocketClass(socket,s){
        this.styleInfo.socketsStyle.get(socket).addClass(s);
    }

    removeSocketClass(socket,s){
        this.styleInfo.socketsStyle.get(socket).removeClass(s);
    }

    addSocketStyle(socket,s){
        this.styleInfo.socketsStyle.get(socket).addStyle(s);
    }

    removeSocketStyle(socket,s){
        this.styleInfo.socketsStyle.get(socket).removeStyle(s);
    }


    addControlClass(control,s){
        this.styleInfo.getControl(control).addClass(s);
    }

    removeControlClass(control,s){
        this.styleInfo.getControl(control).removeClass(s);
    }

    addControlStyle(control,s){
        this.styleInfo.getControl(control).addStyle(s);
    }

    removeControlStyle(control,s){
        this.styleInfo.getControl(control).removeStyle(s);
    }
    /*
    addSocketsClass(s){
        for(let socket of this.styleInfo.socketsStyle.values()){
            socket.addClass(s)
        }
    }*/

    // set data and reflect it on the control
    // key: string, v: Variable
    setData(key,v){
        this.data[key] = v;
        let control = this.getControl(key);
        if(control){
            const vv = v instanceof Variable?v.value:v;
            control.setValue(vv);
        }
    }

    getControl(key){
        if(this.controls.has(key)){
            return this.controls.get(key)
        }else if(this.inputs.has(key)){
            return this.inputs.get(key).control
        }
        return null
    }

    getData(key){
        return this.data[key];
    }

}

export default NodeComponent;

export{
    NodeCustomize,
    NodeStyleData,
    StyleManager
}
