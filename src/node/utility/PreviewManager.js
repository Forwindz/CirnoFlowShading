import "@babel/polyfill";
import Rete from "rete";
import { Variable } from "../compile/DataDefine";

import {emptyDom} from "./utility"

import MaterialBuilder from "./MaterialBuilder";
import {extractMeshBufferType, arrayLerp} from "./utility"
import {PreviewBoxComponent} from "../comp/PreviewComponent"


class PreviewManager{
    constructor(editor,manager){
        this.editor = editor;
        this.manager = manager;//rete manager
        this._comp = new PreviewBoxComponent();
        this.editor.register(this._comp);
        this.previews = new Set();
    }

    addPreview(pos){
        let ms = this.manager.context.modelStore.roughClone();
        console.log(ms);
        let node = this._comp.createNode({"modelStore":ms});
        node.position = pos;
        this.editor.addNode(node);
        this.previews.add(node);
        return node;
    }

    removePreview(preview){
        this.previews.delete(preview);
    }

    _getNodeView(node){
        return this.editor.view.nodes.get(node);
    }

    _getSocketView(socket){
        return this.editor.view.nodes.get(socket.node).sockets.get(socket);
    }

    addPreviewAlongConnection(connection,lerp=0.5){
        let preview; 
        let func = (node)=>{
            const inpos = connection.input.position;
            const outpos = connection.output.position;
            preview.setPosition(this.editor,arrayLerp(inpos,outpos,lerp));
            return true;
        }
        let funcRemove = (node)=>{
            this.removePreview(preview);
            return true;
        }
        if(lerp!=0){
            connection.input.on("translatenode",func);
            connection.input.on("noderemoved",funcRemove)
        }
        if(lerp!=1){
            connection.output.on("translatenode",(node)=>func(node));
            connection.output.on("noderemoved",funcRemove)
        }
        preview = this.addPreview(func(null));
        return preview;
    }

    addPreviewAlongSocket(socket,padding=[5,0]){
        let preview = this.addPreview([100,0]);
        let func = (node)=>{
            let socketView = this._getSocketView(socket);
            let centerPos = socketView.getPosition(socketView.node);
            if(socket instanceof Rete.Output){
                centerPos[0]+=padding[0];
            }else{
                centerPos[0]-=padding[0]+preview.width;
            }
            centerPos[1]+=padding[1]-preview.height/2;
            preview.setPosition(this.editor,centerPos);
            return true;
        }
        let funcRemove = (node)=>{
            this.removePreview(preview);
            return true;
        }
        socket.node.on("translatenode",func);
        socket.node.on("noderemoved",funcRemove);
        console.log(preview)
        func();
        return preview;
    }

    //TODO: better layout
    addPreviewsSurroundNode(node){
        let nv = this._getNodeView(node);
        let sockets = nv.sockets;
        for(let socket of sockets.keys()){
            this.addPreviewAlongSocket(socket);
        }
    }
}

export default PreviewManager;