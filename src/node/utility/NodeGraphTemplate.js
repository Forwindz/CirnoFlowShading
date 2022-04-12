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
        this.name = ""
    }

    genKey(){
        return this.id;
    }

    fromNode(node){
        this.ref = node;
        this.data = deepClone(node.data);
        this.id = node.id;
        this.position = [...node.position]
        this.name = node.name;
        return this;
    }
}

class NodeGraphTemplate{

    constructor(){
        this.nodes = new Map();
        this.connections = new Map();
        this.fromSocket = null;
        this.fromNode = null;
        this.outputSocket = null;
        this.outputSocketTemplate = null
        this.relativePosition = [0,0] //original position 
        this.retainConnection=false;
    }

    saveSocket(fromSocket){
        this.fromNode = fromSocket.node;
        this.fromSocket = fromSocket;
        this.relativePosition = [...fromSocket.node.position]
        if(fromSocket instanceof Rete.Output){
            this.outputSocket=fromSocket
            this._saveNode(fromSocket.node);
            this.outputSocketTemplate = {
                id:fromSocket.node.id,
                key:fromSocket.key
            }
        }else{
            if(!fromSocket.connections.length){
                console.log(fromSocket);
                console.log(fromSocket.node.inputs.get(fromSocket.key));
                console.log(fromSocket.key)
                this._saveNode(fromSocket.node,false);
                this.outputSocket = fromSocket;
                this.retainConnection=true;
                return;
            }
            this.outputSocket=fromSocket.connections[0].output
            this._saveNode(fromSocket.connections[0].output.node);
            this.outputSocketTemplate = {
                id:this.outputSocket.node.id,
                key:this.outputSocket.key
            }
        }
    }

    _saveNode(node,rec= true){
        if(rec){
            for(let k of node.inputs.keys()){
                const inputSocket = node.inputs.get(k)
                for(let connection of inputSocket.connections){
                    this._saveConnection(connection)
                    this._saveNode(connection.output.node);
                }
            }
        }
        
        const tn = new TemplateNode().fromNode(node);
        this.nodes.set(tn.genKey(),tn);
    }

    _saveConnection(connection){
        const tc = new TemplateConnection().fromConnection(connection);
        this.connections.set(tc.genKey(),tc);
    }

    async applyToEditor(editor,alwaysCreateNew = false,referencePos=[0,0]){
        const viewNodes = editor.view.nodes
        let tempMapNodes = new Map(); // old id -> existing node
        let newNodes = new Map();// old id -> new node
        for(let nodeTemplate of this.nodes.values()){
            if(!alwaysCreateNew && viewNodes.has(nodeTemplate.ref)){
                for(let key in nodeTemplate.data){
                    nodeTemplate.ref.setData(key,nodeTemplate.data[key])
                }
                tempMapNodes.set(nodeTemplate.id,nodeTemplate.ref);
            }else{
                const component = editor.components.get(nodeTemplate.name)
                const data = deepClone(nodeTemplate.data);
                let node = await component.createNode(data);
                console.log("new node!!",node)
                node.position = [...nodeTemplate.position];
                console.log("alwaysCreateNew",alwaysCreateNew);
                if(alwaysCreateNew){
                    node.position[0]+=referencePos[0]-this.relativePosition[0]
                    node.position[1]+=referencePos[1]-this.relativePosition[1]
                }
                editor.addNode(node);
                for(let key in nodeTemplate.data){
                    node.setData(key,nodeTemplate.data[key])
                }
                tempMapNodes.set(nodeTemplate.id,node);
                newNodes.set(nodeTemplate.id,node);
            }
        }
        //restore connection
        console.log(this.connections)
        let newConnections = []
        for(let c of this.connections.values()){
            let inputNode = tempMapNodes.get(c.inputID);
            let outputNode = tempMapNodes.get(c.outputID);
            //let inputSocket = inputNode.inputs.get(c.inputKey);
            //let outputSocket = outputNode.outputs.get(c.outputKey);
            //editor.connect(outputSocket,inputSocket,deepClone(c.data));
            let flag=false;
            const oldKey = c.genKey();
            if(newNodes.has(c.inputID)){
                c.inputID=inputNode.id;
                flag=true;
            }
            if(newNodes.has(c.outputID)){
                c.outputID=outputNode.id;
                flag=true;
            }
            if(flag){
                newConnections.push([c,oldKey]);
            }
        }
        
        //restore information for new data
        for(const oldID of newNodes.keys()){
            let node = newNodes.get(oldID);
            const newID = node.id;
            let templateNode = this.nodes.get(oldID);
            templateNode.id=newID;
            templateNode.ref = node;
            this.nodes.set(newID,templateNode)
            this.nodes.delete(oldID);
            console.log("update node id",oldID,newID,node,templateNode)
        }

        for(const ck of newConnections){
            const c = ck[0]
            const oldKey = ck[1];
            this.connections.delete(oldKey)
            this.connections.set(c.genKey(),c);
            console.log("update connection", oldKey, c.genKey(),c)
        }

        //remove connections
        if(!this.retainConnection){
            for(let nodeTemplate of this.nodes.values()){
                console.log(nodeTemplate.ref.inputs)
                for(let input of nodeTemplate.ref.inputs.values()){
                    const connection = input.connections[0]
                    if(connection){
                        const k = new TemplateConnection().fromConnection(connection).genKey();
                        if(!this.connections.has(k)){
                            console.log("remove connection ",connection);
                            editor.removeConnection(connection);
                        }
                    }
                }
            }
        }
        

        for(let c of this.connections.values()){
            let inputNode = this.nodes.get(c.inputID).ref;
            let outputNode = this.nodes.get(c.outputID).ref;
            let inputSocket = inputNode.inputs.get(c.inputKey);
            let outputSocket = outputNode.outputs.get(c.outputKey);
            editor.connect(outputSocket,inputSocket,deepClone(c.data));
        }
        console.log(this)
        return newNodes;
    }
}

export default NodeGraphTemplate;
export {TemplateConnection, TemplateNode}