import "@babel/polyfill";
import Rete from "rete";
import { Variable } from "../compile/DataDefine";

import {emptyDom} from "./utility"

import MaterialBuilder from "./MaterialBuilder";
import {extractMeshBufferType, arrayLerp} from "./utility"
import {PreviewBoxComponent,PreviewBoxNode} from "../comp/PreviewComponent"


class PreviewManager{
    constructor(editor,manager){
        this.editor = editor;
        this.manager = manager;//rete manager
        this._comp = new PreviewBoxComponent();
        this.editor.register(this._comp);
        this.previews = new Map();

        this.editor.on("nodecreated",(param)=>{
            console.log(param);
            if(! (param instanceof PreviewBoxNode)){
                this.setupInteraction(param);
            }
            
        })
    }

    async addPreview(pos,id){
        let ms = this.manager.context.modelStore.roughClone();
        console.log("add Preview",id);
        let node = await this._comp.createNode({"modelStore":ms});
        node.position = pos;
        this.editor.addNode(node);
        this.previews.set(id,node);
        return node;
    }

    removePreview(id){
        console.log("remove Preview",id);
        this.editor.removeNode(this.previews.get(id));
        this.previews.delete(id);
    }

    getNodeView(node){
        return this.editor.view.nodes.get(node);
    }

    getSocketView(socket){
        return this.editor.view.nodes.get(socket.node).sockets.get(socket);
    }

    //TODO: add node translation
    addPreviewAlongConnection(connection,lerp=0.5){
        let preview; 
        const id = `c_${connection.input.id}_${connection.output.id}_${lerp}`
        let func = (node)=>{
            const inpos = connection.input.position;
            const outpos = connection.output.position;
            preview.setPosition(this.editor,arrayLerp(inpos,outpos,lerp));
        }
        let funcRemove = (node)=>{
            this.removePreview(id);
        }
        if(lerp!=0){
            connection.input.on("translatenode",func);
            connection.input.on("noderemoved",funcRemove)
        }
        if(lerp!=1){
            connection.output.on("translatenode",(node)=>func(node));
            connection.output.on("noderemoved",funcRemove)
        }
        preview = this.addPreview(func(null),id);
        return preview;
    }

    _genAlongSocketID(socket){
        return `s_${socket.key}_${socket.node.id}_${socket instanceof Rete.Output?"out":"in"}`;
    }

    async addPreviewAlongSocket(socket,padding=[5,0]){
        const id = this._genAlongSocketID(socket);
        let preview = await this.addPreview([100,0],id);
        let func = (node)=>{
            let socketView = this.getSocketView(socket);
            let centerPos = socketView.getPosition(socketView.node);
            if(socket instanceof Rete.Output){
                centerPos[0]+=padding[0];
            }else{
                centerPos[0]-=padding[0]+preview.width;
            }
            centerPos[1]+=padding[1]-preview.height/2;
            preview.setPosition(this.editor,centerPos);
        }
        let funcRemove = (node)=>{
            this.removePreview(id);
        }
        let funcNodeUpdate = (params)=>{
            const node = params.node;
            if(socket instanceof Rete.Output){
                preview.variable = params.outputData[socket.key];
            }else{
                let v = this.editor.components.get(node.name).extractInputKey(node,params.inputData,socket.key)
                preview.variable = v;
            }
        }
        socket.node.on("translatenode",func);
        socket.node.on("noderemoved",funcRemove);
        socket.node.on("nodeworked",funcNodeUpdate);
        func();
        return preview;
    }

    removePreviewAlongSocket(socket){
        const id = this._genAlongSocketID(socket);
        this.removePreview(id)
    }

    removePreviewsSurroundNode(node){
        console.log("remove previews",node)
        let nv = this.getNodeView(node);
        let sockets = nv.sockets;
        for(let socket of sockets.keys()){
            this.removePreviewAlongSocket(socket);
        }
    }

    //TODO: better layout
    async addPreviewsSurroundNode(node){
        let nv = this.getNodeView(node);
        let sockets = nv.sockets;
        let previewArray = []
        for(let socket of sockets.keys()){
            const preview = await this.addPreviewAlongSocket(socket);
            previewArray.push(preview)
        }
        return previewArray
    }

    setupInteraction(node){
        //https://developer.mozilla.org/zh-CN/docs/Web/API/Pointer_events
        let nv = this.getNodeView(node);
        const el = nv.el;
        var v = new PreviewInteractionPointFloat(this,node,el);
        el.addEventListener("focusin",(e)=>{
            console.log("focusin",e)
        })
        el.addEventListener("focusout",(e)=>{
            console.log("focusout",e)
        })
    }

}

class PreviewInteractionPointFloat{
    constructor(manager,node,el,timeoutIn=200, timeoutOut=3000){
        this.manager = manager;
        this.el=el;
        this.pres = [];
        const STATE_OUT_DOM=0;
        const STATE_IN_DOM=1;
        const STATE_ALREADY_DONE=2;
        const STATE_FADE_OUT=3;
        this.state = STATE_OUT_DOM;
        this.timerIn = null;
        this.timerOut = null;

        const executeInFunc = async ()=>{
            this.state=STATE_ALREADY_DONE;
            this.pres = await this.manager.addPreviewsSurroundNode(node);
            console.log("Add function!")
            console.log(this.pres)
            for(let preview of this.pres){
                const v = this.manager.getNodeView(preview);
                const el = v.el;
                el.addEventListener("pointerenter",pointerenterFuncPreview);
                el.addEventListener("pointerleave",pointerleaveFuncPreview);
            }
        }

        const executeOutFunc = ()=>{
            this.state=STATE_OUT_DOM;
            this.manager.removePreviewsSurroundNode(node);
            this.pres = [];
        }

        // for previews:
        const pointerenterFuncPreview = (e)=>{
            switch(this.state){
                case STATE_FADE_OUT:
                    this.state = STATE_ALREADY_DONE;
                    clearTimeout(this.timerOut);
                    break;
            }
        }

        const pointerleaveFuncPreview = (e)=>{
            switch(this.state){
                case STATE_ALREADY_DONE:
                    this.state = STATE_FADE_OUT;
                    this.timerOut = setTimeout(executeOutFunc,timeoutOut);
                    break;
            }
        }

        // for nodes ==========================

        const pointerenterFunc = (e)=>{
            switch(this.state){
                case STATE_OUT_DOM:
                    this.state = STATE_IN_DOM;
                    this.timerIn = setTimeout(executeInFunc,timeoutIn);
                    break;
                case STATE_FADE_OUT:
                    this.state = STATE_ALREADY_DONE;
                    clearTimeout(this.timerOut);
                    break;
            }
        }
        
        //const pointermoveFunc = function(e){
            //TODO: prolong the delay when user move across the node fast
            /*switch(this.state){
                case STATE_IN_DOM:
                    break;
            }*/
        //}
        const pointerleaveFunc = (e)=>{
            switch(this.state){
                case STATE_ALREADY_DONE:
                    this.state = STATE_FADE_OUT;
                    this.timerOut = setTimeout(executeOutFunc,timeoutOut);
                    break;
                case STATE_IN_DOM:
                    this.state = STATE_OUT_DOM;
                    clearTimeout(this.timerIn);
                    break;
            }
        }
        el.addEventListener("pointerenter",pointerenterFunc);
        el.addEventListener("pointerleave",pointerleaveFunc);
        //el.addEventListener("pointermove",pointermoveFunc);
    }

    installPreviewInteraction(preview){
        
        
    }

}

export default PreviewManager;