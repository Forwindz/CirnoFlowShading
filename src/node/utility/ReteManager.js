import "@babel/polyfill";
import Rete from "rete";
import ConnectionPlugin from "rete-connection-plugin";
import VueRenderPlugin from "rete-vue-render-plugin";

import ContextMenuPlugin from "rete-context-menu-plugin";
import AreaPlugin from "rete-area-plugin";

import NumComponent from "../comp/NumComponent";
import AddComponent from "../comp/AddComponent";
import OutputComponent from "../comp/OutputComponent";
import InputComponent from "../comp/InputComponent"
import { Variable } from "../compile/DataDefine";

import {emptyDom} from "./utility"

class ReteManager{

    constructor(container){
        this.container = container;
        //this is a global context description, when it changes, the whole editor will be changed
        //mesh indicates a reference of the input data structure.
        this.context={mesh:null,name:"shader"}; 
        this._buildComponents();
        this._initEditor("shader");
    }

    _initEditor(name){
        let editor = new Rete.NodeEditor(`${name}@0.1.0`, this.container);
        this.editor = editor;
        editor.use(ConnectionPlugin);
        editor.use(VueRenderPlugin);
        editor.use(ContextMenuPlugin);
        editor.use(AreaPlugin);

        let engine = new Rete.Engine(`${name}@0.1.0`);
        this.engine = engine;

        this.components.map((c) => {
          editor.register(c);
          engine.register(c);
        });

        
        editor.on(
            "process nodecreated noderemoved connectioncreated connectionremoved",
            async () => {
              console.log("process");
              await engine.abort();
              await engine.process(editor.toJSON());
            }
          );

        this._initNode();

        editor.view.resize();
        AreaPlugin.zoomAt(editor);
        editor.trigger("process");

        console.log(this.editor);
    }

    removeAll(){
        delete this.editor;
        delete this.engine;
        this.components = []
        emptyDom(this.container);
    }

    _buildComponents(){
        this.components =[
            new NumComponent(),
            new AddComponent(),
            new OutputComponent()
        ];
  
        const mesh = this.context.mesh;
        if(mesh){
            const attrs = mesh.geometry.attributes;
            for(const k in attrs){
                const v = attrs[k];
                const typeName = extractMeshBufferType(v);
                if(typeName){
                    let comp = new InputComponent(`${k} (${typeName})`,typeName,new Variable(typeName,k));
                    this.dynamicComponents.push(comp);
                }
            }
        }
        this.components[2].addWorkEvent((node) => {
          console.log("--- Final result ---");
          console.log(node.result[0]);
          let r = parseFloat(node.result[0]);
          if (!r) {
            r = 0.0;
          } else {
            r /= 256.0;
          }
          this.result = r + "," + r + "," + r; //a simple way to implement, TODO: better
          console.log(this.result);
        });

        this.dynamicComponents = [];
    }

    //rebuild the whole node editor, this will remove all the content we have currently
    rebuild(){
        this.removeAll();
        this._buildComponents();
        this._initEditor(this.context.name);
    }

    set mesh(mesh_){
        this.context.mesh=mesh_;
        if(mesh_){
            this.context.name = mesh_.uuid;
        }
        this.rebuild();
    }

    async _initNode(){
        console.log("hi")
        console.log(this.components);
        const components = this.components;
        const editor = this.editor;
        let n1 = await components[0].createNode({ num: 2 });
        let n2 = await components[0].createNode({ num: 0 });
        let add = await components[1].createNode();
        let output = await components[2].createNode();

        n1.position = [0, 200];
        n2.position = [0, 400];
        add.position = [300, 240];
        output.position = [600,0];

        editor.addNode(n1);
        editor.addNode(n2);
        editor.addNode(add);
        editor.addNode(output);

        editor.connect(n1.outputs.get("num"), add.inputs.get("num"));
        editor.connect(n2.outputs.get("num"), add.inputs.get("num2"));
    }
}

export default ReteManager;