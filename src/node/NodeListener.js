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
    "nodedraged","nodeselect","nodeselected"]

const eventsNodeIndirect = [
    "translatenode","nodetranslate","nodetranslated","selectnode"
]
    //TODO: compatitable with multiply editors
function install(editor){
    editor.subEvents = new Map();
    var subEvents = editor.subEvents;
    
    Rete.Node.prototype.on = function(name,func){
        subEvents.get(this).on(name,func);
    }
    Rete.Node.prototype.removeListener = function(name,func){
        subEvents.get(this).removeListener(name,func);
    }
    Rete.Node.prototype.getListener = function(name){
        return subEvents.get(this)    
    }

    editor.on('noderemoved',(node)=>{
        subEvents.delete(node)
    });
    editor.on('nodecreated',(node)=>{
        subEvents.set(node,new EventEmitter());
    });

    for(let e of eventsNodeDirect){
        editor.on(e,(node,...param)=>{
            subEvents.get(node).emit(e,node,...param);
        })
    }
    for(let e of eventsNodeIndirect){
        editor.on(e,(node,...param)=>{
            subEvents.get(node.node).emit(e,node,...param);
        })
    }
}

function installNode(){
    Node.prototype.on = function(name,func){
        subEvents.get(this).on(name,func);
    }
    Node.prototype.removeListener = function(name,func){
        subEvents.get(this).removeListener(name,func);
    }
    Node.prototype.getListener = function(name){
        return subEvents.get(this)    
    }
}

export default{
    name: 'sub-event',
    install
}
