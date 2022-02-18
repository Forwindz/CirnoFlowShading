import "@babel/polyfill";
import Rete from "rete";
import PreviewBoxVue from "./components/PreviewBoxVue.vue";
import { createApp,reactive,ref } from 'vue';
import EventEmitter from 'events';
// a class for preview box
class PreviewBoxComponent extends Rete.Component {

    constructor(){
        super("PreviewBox")
    }

    worker(node, inputs, outputs) {
    }


    createNode(data){
        let result = new PreviewBoxNode(this.editor);
        result.data=data;
        return result
    }
}
class PreviewBoxNode extends Rete.Node{

    constructor(editor){
        super();
        this.editor = editor;
        this.vueContext = null;
        this.name = "PreviewBox"
        this.size=reactive([100,300])
        this.frag1 = ref("0,0,0")
        this.frag2 = ref("0,0,0")
        this.show2 = ref(false)
        this.edgeReact = 20;

        this.state = 0
        this.clickPos = null; 
        this.dom = null;
        this.linkNode = null;
    }

    createVueComp(el){
        this.dom = el;
        console.log(this.frag1)
        console.log(this.frag2)
        console.log(this.frag2)
        console.log(this.frag2)
        console.log(this.frag2)
        console.log(this.frag2)
        console.log(this.frag2)
        console.log(this.frag2)
        console.log(this.frag2)
        console.log(this.frag2)
        let app= createApp(PreviewBoxVue, {size: this.size, frag1:this.frag1,frag2:this.frag2,show2:this.show2});
        const IDLE = 0;
        const DOWNEDGE = 1
        const DOWN=2;
        app.mount(el)
        this.oldPosition = [0,0]
        el.addEventListener("pointermove",e=>{
            if(this.state == DOWNEDGE){
                let dx = e.clientX - this.clickPos[0];
                let dy = e.clientY - this.clickPos[1];
                //drag
                this.size[0]+=dx;
                this.size[1]+=dy;
                this.clickPos = [e.clientX,e.clientY];
                this.position[0]-=dx;
                this.position[1]-=dy;
                this.vueContext.$forceUpdate();
                this.scanNodes();
                e.stopPropagation()
            }
            if (this.state==DOWN){
                this.scanNodes();
                
            }
            
        },true)
        el.addEventListener("pointerdown",e=>{
            if(this.mouseOnEdge(e.offsetX,e.offsetY)){
                this.state = DOWNEDGE;
                this.clickPos = [e.clientX,e.clientY];
                //console.log("down!")
                e.stopPropagation()
                return;
            }else{
                this.position = this.oldPosition;
                this.state=DOWN;
            }
        },true)
        el.addEventListener("pointerup",e=>{
            //console.log("up")
            if(this.state == DOWNEDGE){
                this.state = IDLE;
                e.stopPropagation()
            }
            this.state = IDLE;
            
        },true)
        el.addEventListener("pointerleave",e=>{
            //console.log("leave")
            this.state = IDLE;
        },true)
    }

    mouseOnEdge(x,y){
        const r = this.editor.view.area.transform.k;
        const e = this.edgeReact;
        const w = this.dom.clientWidth*r;
        const h = this.dom.clientHeight*r;
        //console.log(w,h,"|",x,y,0<=x && x<e,w>=x && x>w-e,0<=y && y<e,h>=y&&y>h-e)
        return 0<=x && x<e || w>=x && x>w-e || 0<=y && y<e || h>=y&&y>h-e;
    }

    onNodeUpdate(node){
        console.log(node)
        console.log("Preview focused code is changed!")
        const code = node.data.getPreviewCode();
        console.log(code);
        console.log(this.frag2);
        this.frag2.value = code;
        console.log(this.frag2);
        this.show2.value = true;
        this.vueContext.$nextTick();
    }

    //scan nodes and try to find if the node is in the area
    scanNodes(){
        let includeNodes = []
        let nodes = this.editor.nodes;
        //TODO:
        const r = this.editor.view.area.transform.k;
        const w = this.dom.clientWidth/r;
        const h = this.dom.clientHeight/r;
        const x = this.position[0];
        const x1 = this.position[0]+w;
        const y = this.position[1];
        const y1 = this.position[1]+h;
        let selectedNode = null;
        let maxx=0;
        for(let node of nodes){
            const el = node.vueContext.$el;
            const nw = el.clientWidth/r;
            const nh = el.clientHeight/r;
            const nx = node.position[0];
            const nx1 = node.position[0]+nw;
            const ny = node.position[1];
            const ny1 = node.position[1]+nh;
            if (x<nx && nx<x1 && y<ny && ny<y1){//TODO: simple judge, optimize!
                //is included
                includeNodes.push(node)
                if(node.position[0]>maxx){
                    maxx=node.position[0];
                    selectedNode = node
                }
            }
        }
        let node=selectedNode;
        if(node==null){
            this.show2.value=false;
            console.log("null!")
            return;
        }
        if(node.eventManager==undefined){
            node.data.eventManager = new EventEmitter();
            node.data.addWorkEvent = (func)=>{node.data.eventManager.on("work",func)}
            node.data.removeWorkEvent = (func)=>{node.data.eventManager.removeListener("work",func)}
        }
        if(this.linkNode!=null){
            this.linkNode.data.removeWorkEvent(this.onNodeUpdate);
        }
        if(this.linkNode==selectedNode){
            return;
        }
        this.linkNode = selectedNode;
        this.linkNode.data.addWorkEvent(this.onNodeUpdate);
        
        this.onNodeUpdate(this.linkNode);

        
    }

    


}

function install(editor) {
    editor.on(
        'rendernode',
        ({ el, node, component, bindSocket, bindControl }) => {
            if (component.render && component.render !== 'vue') return;
            console.log({ el, node, component, bindSocket, bindControl })
            if (node.name == "PreviewBox"){
                node.createVueComp(el); // replaced the view
            }
        }
    );
    //first to do:
    //editor.previewBox = PreviewBox(editor)
    //then, inject view to editor
    // document.getElementById("test").parentNode;
    // create vue comp
    //editor.nodes[i].position[0~1] to obtain node position
    
    // this resolve mouse move
    //https://juejin.cn/post/6844904025314295822
    // and resolve scaling as well,

    // this resolve frame effect (just create two div, stack together)
    // http://jsfiddle.net/89da5cLz/10/

    // now, when node comp https://rete.readthedocs.io/en/latest/Events/
    // update the container of node, if node moves outside, inside, update the event
    // when node compute, update the event
    // the node outputs will be fetched, and send to vue comp as event
    // vue comp react to the comp, update the view

    //editor.view.container
}

export default {
    name: 'preview-box',
    install,
    PreviewBoxComponent
};