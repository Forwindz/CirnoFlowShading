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
    "nodedraged","nodeselect","nodeselected","nodework","nodeworked"
]

const eventsNodeIndirect = [
    "translatenode","nodetranslate","nodetranslated","selectnode"
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
    ((oldMethod)=>{
        Rete.Engine.prototype.processNode = async function(node){
            editor.trigger("nodework",node);
            await oldMethod.apply(this,node);
            editor.trigger("nodeworked",node);
        }
    })(Rete.Engine.prototype.processNode)
    

    editor.on('noderemoved',(node)=>{
        subEvents.get(node.id).emit('noderemoved',node);
        subEvents.delete(node.id)
    });
    editor.on('nodecreated',(node)=>{
        subEvents.set(node.id,new EventEmitter());
    });

    for(let e of eventsNodeDirect){
        editor.on(e,(node,...param)=>{
            subEvents.get(node.id).emit(e,node,...param);
        })
    }
    for(let e of eventsNodeIndirect){
        editor.on(e,(node,...param)=>{
            subEvents.get(node.node.id).emit(e,node,...param);
        })
    }
}

export default{
    name: 'sub-event',
    install
}
