import "@babel/polyfill";
import Rete from "rete";

import {arrayLerp, deepClone, pointDistance} from "./utility"
import {PreviewBoxComponent,PreviewBoxNode} from "../comp/PreviewComponent"
import NodeGraphTemplate from "./NodeGraphTemplate";
import InverseSet from "./InversableAssign";
import { Variable } from "../compile/DataDefine";


function genAlongSocketID(socket){
    return `socket_${socket.key}_${socket.node.id}_${socket instanceof Rete.Output?"out":"in"}`;
}

function genSingleID(oldID){
    return 'single_'+Math.random().toString(36).slice(-6)+"_"+oldID;
}

class PreviewManager{
    constructor(editor,manager){
        this.editor = editor;
        this.manager = manager;//rete manager
        this._comp = new PreviewBoxComponent();
        this.editor.register(this._comp);
        this.previews = new Map();
        this.pointFloat = new Map();
        this.independentPreviewInteraction = new IndependentPreviewInteraction(this);
        this._enablePreview=false;
        this.editor.on("nodecreated",(param)=>{
            console.log(param);
            if(! (param instanceof PreviewBoxNode)){
                this.setupInteraction(param);
            }
            
        })
        this.editor.on('noderemoved',(node)=>{
            this.pointFloat.delete(node.id);
        })
    }

    async addPreview(pos,id){
        if(this.previews.has(id)){
            console.log("Already existing preview",id);
            let preview = this.previews.get(id);
            preview.setPosition(this.editor,pos);
            return preview;
        }
        let ms = this.manager.context.modelStore.roughClone();
        console.log("add Preview",id);
        let node = await this._comp.createNode({"modelStore":ms});
        node.position = pos;
        this.editor.addNode(node);
        this.previews.set(id,node);
        return node;
    }

    renamePreview(oldID,newID){
        if(this.previews.has(oldID)){
            if(this.previews.has(newID)){
                console.warn("Duplicated preview id");
            }
            this.previews.set(newID,this.previews.get(oldID));
            this.previews.delete(oldID);
        }else{
            console.log("Unknown preview",oldID)
        }
    }

    //remove preview, unless it has lock state
    //you can still remove it with force==true
    removePreview(id,force=false){
        if(!this.previews.has(id)){
            console.log("remove Preview (failed)",id);
            return;
        }
        let preview = this.previews.get(id)
        if(preview.state=="lock" && !force){
            console.log("preview locked",id);
            return;
        }
        console.log("remove Preview",id);
        this.editor.removeNode(preview);
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

    //TODO: sort this code into a single class
    async addPreviewAlongSocket(socket,getPadding=function(socket){return [0,5]}){
        const id = genAlongSocketID(socket);
        let preview = await this.addPreview([100,0],id);
        let idlePosition = [0,0]
        let translationAnimationTimer = null;
        const RANGE=160;
        let func = (node)=>{
            let socketView = this.getSocketView(socket);
            let centerPos = socketView.getPosition(socketView.node);
            let previewView = preview.el //TODO: cannot obtain view from rete editor, strange
            if(!previewView){
                previewView = {clientWidth:100,clientHeight:100}
            }
            if(socket instanceof Rete.Output){
                centerPos[0]+=getPadding(socket)[0];
            }else{
                centerPos[0]-=getPadding(socket)[0]+previewView.clientWidth;
            }
            centerPos[1]+=getPadding(socket)[1]-previewView.clientHeight/2;
            preview.setPosition(this.editor,centerPos);
            idlePosition = [...centerPos]
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
        let funcPreviewTranslated = (node)=>{
            if(pointDistance(preview.position,idlePosition)>RANGE){
                preview.addNodeClass('preview-independ-try')
            }else{
                preview.removeNodeClass('preview-independ-try')
            }
        }
        let funcPreviewSelect = (node)=>{
            if(translationAnimationTimer){
                clearInterval(translationAnimationTimer);
            }
            translationAnimationTimer=null;
        }
        // change the preview to an independent one
        let funcDragPreview = (params)=>{
            console.log("drag end",params);
            //independent preview created!
            if(pointDistance(preview.position,idlePosition)>RANGE){
                preview.removeNodeClass('preview-independ-try')
                const newID = genSingleID(id);
                this.renamePreview(id,newID);
                socket.node.removeListener("translatenode",func)
                socket.node.removeListener("noderemoved",funcRemove);
                socket.node.removeListener("nodeworked",funcNodeUpdate);
                preview.removeListener("nodedraged",funcDragPreview);
                preview.removeListener("translatenode",funcPreviewTranslated);
                preview.removeListener("selectnode",funcPreviewSelect);
                preview.templateData = new NodeGraphTemplate();
                preview.templateData.saveSocket(socket);
                console.log(preview.templateData);
                preview.addNodeClass('preview-independ')
                this.independentPreviewInteraction.installPreview(preview);
            }else{
                translationAnimationTimer = setInterval(
                    ()=>{
                        let moved = [preview.position[0]-idlePosition[0],
                            preview.position[1]-idlePosition[1]];
                        let finalPos = [preview.position[0]-moved[0]*0.07,
                            preview.position[1]-moved[1]*0.07]
                        preview.setPosition(this.editor,finalPos);
                        funcPreviewTranslated();
                    },30
                )
            }
            
        }

        
        socket.node.on("translatenode",func);
        socket.node.on("noderemoved",funcRemove);
        socket.node.on("nodeworked",funcNodeUpdate);
        preview.on("translatenode",funcPreviewTranslated);
        preview.on("nodedraged",funcDragPreview);
        preview.on("selectnode",funcPreviewSelect);
        func();
        idlePosition = [...preview.position]
        return preview;
    }

    removePreviewAlongSocket(socket){
        const id = genAlongSocketID(socket);
        this.removePreview(id)
    }

    removePreviewsSurroundNode(node){
        console.log("remove previews",node)
        let nv = this.getNodeView(node);
        if(!nv){
            return; //already deleted
        }
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
        let layouter = new NodePreviewLayoutInfo(this,node);
        for(let socket of sockets.keys()){
            const preview = await this.addPreviewAlongSocket(socket,(socket)=>{return layouter.offsets.get(socket)});
            previewArray.push(preview)
        }
        layouter.relayoutAll();
        return previewArray
    }

    setupInteraction(node){
        //https://developer.mozilla.org/zh-CN/docs/Web/API/Pointer_events
        let nv = this.getNodeView(node);
        const el = nv.el;
        let v = new PreviewInteractionPointFloat(this,node,el,this._enablePreviewTime);
        this.pointFloat.set(node.id,v);
    }

    set enablePreview(v){
        if(this._enablePreview==v){
            return;
        }
        this._enablePreview = v
        const time = this._enablePreviewTime
        console.log(this.pointFloat)
        for(let pf of this.pointFloat.values()){
            pf.timeoutIn = time;
        }
    }

    get _enablePreviewTime(){
        return this._enablePreview?200:-1
    }
}

class IndependentPreviewInteraction{
    constructor(manager){
        this.manager = manager;
        this.editor = this.manager.editor;
        this.tempTemplate = null;
    }



    installPreview(preview){
        preview.operations = []
        preview.state='apply'
        const funcCheckCompleteNew = ()=>{
            let tdata = preview.templateData;
            let nv = this.manager.getNodeView(tdata.fromSocket.node);
            let createCompleteNew=false;

            nv = this.manager.getNodeView(tdata.outputSocket.node);
            console.log(nv)
            if(nv){
                nv = nv.sockets.get(tdata.outputSocket);
                console.log(nv)
            }else{
                nv=null
            }
            if(nv){
                this.tempTemplate.saveSocket(tdata.outputSocket);
            }else{
                this.tempTemplate = null;
                createCompleteNew=true;
            }
            return createCompleteNew;
        }
        preview.applyFunc2 = async ()=>{
            let refPosition = [...preview.position];
            refPosition[0] -= preview.el.clientWidth
            refPosition[1] -= preview.el.clientHeight
            await preview.templateData.applyToEditor(this.editor,funcCheckCompleteNew(),refPosition)
        };
        preview.applyFunc = async ()=>{
            let refPosition = [...preview.position];
            refPosition[0] -= preview.el.clientWidth
            refPosition[1] -= preview.el.clientHeight
            await preview.templateData.applyToEditor(this.editor,true,refPosition)
        };
        const funcIndependOnEnter = async (e)=>{
            console.log("pointerEnter",e)
            const viewNodes = this.editor.view.nodes
            this.tempTemplate = new NodeGraphTemplate();
            let tdata = preview.templateData;
            let nv = this.manager.getNodeView(tdata.fromSocket.node);
            let createCompleteNew=funcCheckCompleteNew();

            //this.tempTemplate.saveSocket(preview.templateData.fromSocket);
            for(let nodeTemplate of preview.templateData.nodes.values()){
                let node = nodeTemplate.ref;
                if(viewNodes.has(node)){
                    node.addNodeClass('node-highlight')
                    preview.operations.push(
                        ()=>{node.removeNodeClass('node-highlight')}
                    )
                    for(let key in nodeTemplate.data){
                        const templateData = nodeTemplate.data[key]
                        if(typeof templateData == "undefined"){
                            continue;
                        }
                        
                        const curData = node.data[key]
                        if(typeof curData == "undefined"){
                            continue;
                        }
                        let isEqual = templateData==curData;
                        if(!isEqual && 
                            templateData instanceof Variable &&
                            curData instanceof Variable){
                                isEqual = templateData.isEquals(curData);
                            }
                        if(!isEqual){
                            let control = node.getControl(key)
                            if(control){
                                console.log(control);
                                node.addControlStyle(control,'border: solid 1px red;')
                                preview.operations.push(
                                    ()=>{node.removeControlStyle(control,'border: solid 1px red;')}
                                )
                            }
                        }
                    }
                }

            }//end for
            let refPosition = [...preview.position];
            refPosition[0] -= preview.el.clientWidth
            refPosition[1] -= preview.el.clientHeight
            let nodes = await preview.templateData.applyToEditor(this.editor,createCompleteNew,refPosition)
            for(let node of nodes.values()){
                node.addNodeClass('node-highlight-fake')
            }
            preview.operations.push(
                ()=>{
                    console.log("remove nodes",nodes)
                    for(let node of nodes.values()){
                        node.removeNodeClass('node-highlight-fake')
                        this.editor.removeNode(node);
                    }
                }
            )
        }
        const funcIndependOnLeave = async (e)=>{
            console.log("pointerLeave",e)
            for(const f of preview.operations){
                f();
            }
            preview.operations=[]
            if(this.tempTemplate){
                await this.tempTemplate.applyToEditor(this.editor)
            }
        }
        preview.el.addEventListener("pointerenter",funcIndependOnEnter);
        preview.el.addEventListener("pointerleave",funcIndependOnLeave);

    }

}

function minPos(a,b){
    return [Math.min(a[0],b[0]),Math.min(a[1],b[1])]
}

function maxPos(a,b){
    return [Math.max(a[0],b[0]),Math.max(a[1],b[1])]
}

class NodePreviewLayoutInfo{
    constructor(manager,node){
        this.node=node;
        this.manager = manager;
        let nv = manager.getNodeView(node);
        let sockets = nv.sockets;
        let ins = []
        let outs = []
        let inSocketPosMin = null
        let inSocketPosMax = null
        let outSocketPosMin = null
        let outSocketPosMax = null
        let inSocketPos =[0,0]
        let outSocketPos =[0,0];
        this.offsets = new Map();
        for(let socket of sockets.keys()){
            const pos = this.manager.getSocketView(socket).getPosition(socket.node);
            if(socket instanceof Rete.Output){
                outs.push(socket)
                outSocketPos[0]+=pos[0];
                outSocketPos[1]+=pos[1];
                outSocketPosMax = outSocketPosMax?maxPos(outSocketPosMax,pos):pos
                outSocketPosMin = outSocketPosMin?minPos(outSocketPosMin,pos):pos
            }else{
                ins.push(socket)
                inSocketPos[0]+=pos[0];
                inSocketPos[1]+=pos[1];
                inSocketPosMax = inSocketPosMin?maxPos(inSocketPosMax,pos):pos
                inSocketPosMin = inSocketPosMin?minPos(inSocketPosMin,pos):pos
            }
        }
        if(ins.length>0){
            inSocketPos[0]=inSocketPosMax[0]-inSocketPosMin[0];
            inSocketPos[1]=inSocketPosMax[1]-inSocketPosMin[1];
        }

        if(outs.length>0){
            outSocketPos[0]=outSocketPosMax[0]-outSocketPosMin[0];
            outSocketPos[1]=outSocketPosMax[1]-outSocketPosMin[1];
        }
        this.inSocketAvgPos = inSocketPos;
        this.outSocketAvgPos = outSocketPos;
        this.ins=ins;
        this.outs=outs;
        this.relayoutAll();
    }

    relayoutAll(){
        this.relayout(this.ins,this.inSocketAvgPos)
        this.relayout(this.outs,this.outSocketAvgPos)
    }

    relayout(sockets,avgPos){
        let offsetY = []
        let curOffset = 0;
        let blankSpace = 0;
        let lastSocketPosY=null;
        for(let i=0;i<sockets.length;i++){
            const socket = sockets[i]
            const id = genAlongSocketID(socket);
            let preview = this.manager.previews.get(id);
            let previewview = this.manager.getNodeView(preview)
            let previewHeight = PreviewBoxNode.defaultHeight
            if(previewview){
                previewview = previewview.el;
                previewHeight = previewview.clientHeight
            }
            const socketView = this.manager.getSocketView(socket);
            const socketPos = socketView.getPosition(socket.node);
            let socketHeight = 10;
            if(socketView.el){
                socketHeight = socketView.el.clientHeight;
            }
            if(i==0){
                offsetY.push([curOffset+previewHeight/2,0]);
                lastSocketPosY = socketPos[1]
                blankSpace = socketHeight;
            }else{
                const blank = socketPos[1]-lastSocketPosY
                blankSpace+=blank;
                offsetY.push([curOffset+previewHeight/2,blank]);
                lastSocketPosY = socketPos[1]
            }
            curOffset+=previewHeight+2;//tiny padding 2px
            
        }
        const nv = this.manager.getNodeView(this.node);
        const nodeHeight = nv.el.clientHeight;
        const totalPreviewHeight = curOffset+blankSpace;
        const decayFactor = -Math.max(0.2,Math.pow(Math.min(1,nodeHeight/totalPreviewHeight),2));
        const totalDecayedPreviewHeight = curOffset+blankSpace*decayFactor;
        //curOffset/2 <--> avgPos[1]/2
        const worldOffsetY = -totalDecayedPreviewHeight/2;
        let socketPos = -avgPos[1]/2;
        for(let i=0;i<sockets.length;i++){
            const socket = sockets[i]
            const id = genAlongSocketID(socket);
            socketPos+=offsetY[i][1];
            const y = offsetY[i][0]+worldOffsetY-socketPos+(blankSpace/2-socketPos)*(decayFactor);//worldOffsetY+offsetY[i][0]+socketPos*(1-decayFactor);
            this.offsets.set(socket,[20,y]);
        }
    }
}

class PreviewInteractionPointFloat{
    constructor(manager,node,el,timeoutIn=200, timeoutOut=800){
        this.manager = manager;
        this.el=el;
        this.pres = [];
        const STATE_OUT_DOM=0;
        const STATE_IN_DOM=1;
        const STATE_ALREADY_DONE=2;
        const STATE_FADE_OUT=3;
        this.state = STATE_OUT_DOM;
        this.partState = false;
        this.timerIn = null;
        this.timerOut = null;
        this.timeoutIn = timeoutIn
        this.timeoutOut = timeoutOut

        const executeInFunc = async ()=>{
            this.state=STATE_ALREADY_DONE;
            this.pres = await this.manager.addPreviewsSurroundNode(node);
            for(let preview of this.pres){
                const v = this.manager.getNodeView(preview);
                const el = v.el;
                el.addEventListener("pointerenter",pointerenterFuncPreview);
                el.addEventListener("pointerleave",pointerleaveFuncPreview);
            }
            this.partState=false;
        }

        const executeOutFunc = ()=>{
            this.state=STATE_OUT_DOM;
            this.manager.removePreviewsSurroundNode(node);
            let newpres = []
            //add not removed previews
            for(let preview of this.pres){
                if(preview.state=='lock'){
                    newpres.push(preview)
                }
            }
            this.pres = newpres;
            if(this.pres.length){
                this.partState=true;
                //this.state=STATE_ALREADY_DONE;
            }else{
                this.partState=false;
            }
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
                    if(this.partState){
                        clearTimeout(this.timerIn);
                    }
                    this.timerOut = setTimeout(executeOutFunc,this.timeoutOut);
                    break;
                case STATE_OUT_DOM:
                    if(this.partState){
                        this.timerOut = setTimeout(executeOutFunc,this.timeoutOut);
                    }
            }
        }

        // for nodes ==========================

        const pointerenterFunc = (e)=>{
            switch(this.state){
                case STATE_OUT_DOM:
                    this.state = STATE_IN_DOM;
                    this.timerIn = this.timeoutIn<0?null:setTimeout(executeInFunc,this.timeoutIn);
                    clearTimeout(this.timerOut);
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
                    this.timerOut = setTimeout(executeOutFunc,this.timeoutOut);
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

}

export default PreviewManager;