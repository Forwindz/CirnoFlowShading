import "@babel/polyfill";
import Rete from "rete";
import PreviewBoxVue from "./components/PreviewBoxVue.vue";
import { createApp,reactive } from 'vue';

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
        this.edgeReact = 20;

        this.state = 0
        this.clickPos = null; 
        this.dom = null;
    }

    createVueComp(el){
        this.dom = el;
        let app= createApp(PreviewBoxVue, {size: this.size})
        const IDLE = 0;
        const DOWN = 1
        app.mount(el)
        el.addEventListener("pointermove",e=>{
            if(this.state == DOWN){
                let dx = e.clientX - this.clickPos[0];
                let dy = e.clientY - this.clickPos[1];
                //drag
                this.size[0]+=dx;
                this.size[1]+=dy;
                this.clickPos = [e.clientX,e.clientY];
                this.position[0]-=dx;
                this.position[1]-=dy;
                this.vueContext.$forceUpdate();
                e.stopPropagation()
            }
        },true)
        el.addEventListener("pointerdown",e=>{
            if(this.mouseOnEdge(e.offsetX,e.offsetY)){
                this.state = DOWN;
                this.clickPos = [e.clientX,e.clientY];
                console.log("down!")
                e.stopPropagation()
            }
            
        },true)
        el.addEventListener("pointerup",e=>{
            console.log("up")
            if(this.state == DOWN){
                this.state = IDLE;
                e.stopPropagation()
            }
            
        },true)
        el.addEventListener("pointerleave",e=>{
            console.log("leave")
            this.state = IDLE;
        },true)
    }

    mouseOnEdge(x,y){
        const r = this.editor.view.area.transform.k;
        const e = this.edgeReact;
        const w = this.dom.clientWidth*r;
        const h = this.dom.clientHeight*r;
        console.log(w,h,"|",x,y,0<=x && x<e,w>=x && x>w-e,0<=y && y<e,h>=y&&y>h-e)
        return 0<=x && x<e || w>=x && x>w-e || 0<=y && y<e || h>=y&&y>h-e;
    }

    //scan nodes and try to find if the node is in the area
    scanNodes(){
        let nodes = this.editor.nodes;
        //TODO:
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