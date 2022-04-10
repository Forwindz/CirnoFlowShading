import "@babel/polyfill";
import Rete from "rete";
import EventEmitter from 'events';

/*
    "nodecreate","nodecreated",
    "noderemove","noderemoved",
    "connectioncreate","connectioncreated",
    "connectionremove","connectionremoved",
    "nodetranslated","nodedraged",
    "selectnode","nodeselect","nodeselected"]
    "rendernode",
    "rendersocket",
    "rendercontrol",
    "renderconnection",
    "updateconnection",
    "componentregister",
    "keydown","keyup",
    "translate","translated",
    "zoom","zoomed","click","mousemove","contextmenu","import","export","process","error","warn"] 
 */
const eventsNodeDirect = [
    "nodedraged","nodeselect","nodeselected"
]

const eventsNodeIndirect = [
    "translatenode","nodetranslate","nodetranslated","selectnode","nodework","nodeworked"
]

    //TODO: compatitable with multiply editors
function install(editor){
    editor.subEvents = new Map();
    var subEvents = editor.subEvents;
    
    Rete.Node.prototype.on = function(name,func){
        subEvents.get(this.id).on(name,func);
    }
    Rete.Node.prototype.removeListener = function(name,func){
        subEvents.get(this.id).removeListener(name,func);
    }
    Rete.Node.prototype.getListener = function(name){
        return subEvents.get(this.id)    
    }

    editor.bind("nodework");
    editor.bind("nodeworked");

    Rete.Engine.prototype.processWorker = async function(node){
        const inputData = await this.extractInputData(node);
        const component = this.components.get(node.name);
        const outputData = {};
        if (!component){
            return outputData;
        }
        editor.trigger("nodework",{node,inputData});
        try {
            await component.worker(node, inputData, outputData, ...this.args);
        } catch (e) {
            this.abort();
            this.trigger('warn', e);
        }
        editor.trigger("nodeworked",{node,inputData,outputData});
        return outputData;
    }
    

    editor.on('noderemoved',(node)=>{
        subEvents.get(node.id).emit('noderemoved',node);
        subEvents.delete(node.id)
    });
    editor.on('nodecreated',(node)=>{
        if(!subEvents.has(node.id)){
            subEvents.set(node.id,new EventEmitter());
        }
    });
    editor.on('rendernode',(param)=>{
        const node = param.node;
        if(!subEvents.has(node.id)){
            subEvents.set(node.id,new EventEmitter());
        }
        subEvents.get(node.id).emit('rendernode',param);
    });

    for(let e of eventsNodeDirect){
        editor.on(e,(param)=>{
            subEvents.get(param.id).emit(e,param);
        })
    }
    for(let e of eventsNodeIndirect){
        editor.on(e,(param)=>{
            subEvents.get(param.node.id).emit(e,param);
        })
    }
}

export default{
    name: 'sub-event',
    install
}
