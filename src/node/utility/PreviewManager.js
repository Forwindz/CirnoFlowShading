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
        this.previews = {}
    }

    addPreview(pos){
        let ms = this.manager.context.modelStore;
        let node = this._comp.createNode({"modelStore":ms});
        node.position = pos;
        this.editor.addNode(node);
        return node;
    }

    _getNodeView(node){
        return this.editor.view.nodes.get(node);
    }

    _getSocketView(node,socket){
        return this.editor.view.nodes.get(node).sockets.get(socket);
    }

    _genIndex(nodeID,socketKey){
        return `${nodeID}_${socketKey}`;
    }

    addPreviewAlongConnection(connection,lerp=0.5){
        let innode = connection.input.node;
        let outnode = connection.output.node;
        //TODO: create a preview node here
        const inpos = innode.position;
        const outpos = outnode.position;
        return this.addPreview(arrayLerp(inpos,outpos,lerp));
    }

    addPreviewAlongSocket(socket,padding=[5,0]){
        let socketView = this._getSocketView(socket);
        let centerPos = socketView.getPosition(socketView.node);
        centerPos[0]+=padding[0];
        centerPos[1]+=padding[1];
        return this.addPreview(centerPos)
    }

    addPreviewSurroundNode(node){
        const id = node.id;
        let nv = this._getNodeView(node);
        let sockets = nv.sockets;
        for(let socket of sockets.keys()){
            let connections = socket.connections;
            //TODO: add connection with a preview window

        }
    }
}

export default PreviewManager;