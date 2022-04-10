import { deepClone } from "./utility";
import Rete from 'rete'


class TemplateConnection{
    constructor(){
        this.inputKey = null;
        this.inputID = null
        this.outputKey = null;
        this.outputID = null;
        this.data = {}
    }

    genKey(){
        return `${this.inputKey}_${this.inputID}|${this.outputKey}_${this.outputID}`
    }

    fromConnection(connection){
        this.data = deepClone(connection.data);
        this.inputKey = connection.input.key;
        this.inputID = connection.input.node.id;
        this.outputKey = connection.output.key;
        this.outputID = connection.output.node.id;
        return this;
    }
}

class TemplateNode{
    constructor(){
        this.id = null;
        this.ref = null; //reference to the existing node
        this.data = {};
        this.position = [0,0];
        this.connections = [];
    }

    genKey(){
        return this.id;
    }

    fromNode(node){
        this.ref = node;
        this.data = deepClone(node.data);
        this.id = node.id;
        this.position = [...node.position]
        return this;
    }
}

class NodeGraphTemplate{

    constructor(){
        this.nodes = new Map();
        this.connections = new Map();
        this.fromSocket = null;
        this.fromNode = null;
        this.relativePosition = [0,0] //original position 
    }

    saveSocket(fromSocket){
        this.fromNode = fromSocket.node;
        this.fromSocket = fromSocket;
        this.relativePosition = [...fromSocket.node.position]
        if(fromSocket instanceof Rete.Output){
            this._saveNode(fromSocket.node);
        }else{
            this._saveNode(fromSocket.connections[0].output.node)
        }
    }

    _saveNode(node){
        for(let k of node.inputs.keys()){
            const inputSocket = node.inputs.get(k)
            for(let connection of inputSocket.connections){
                this._saveConnection(connection)
                this._saveNode(connection.output.node);
            }
        }
        const tn = new TemplateNode().fromNode(node);
        this.nodes.set(tn.genKey(),tn);
    }

    _saveConnection(connection){
        const tc = new TemplateConnection().fromConnection(connection);
        this.connections.set(tc.genKey(),tc);
    }
}

export default NodeGraphTemplate;
export {TemplateConnection, TemplateNode}