import "@babel/polyfill";
import Rete from "rete";
import ConnectionPlugin from "rete-connection-plugin";
import VueRenderPlugin from "rete-vue-render-plugin";

import ContextMenuPlugin from "rete-context-menu-plugin";
import AreaPlugin from "rete-area-plugin";
import NodeListener from "../NodeListener";

import PreviewComponent from "../comp/PreviewComponent";

import NumComponent from "../comp/NumComponent";
import {
    addComponent,minusComponent,divComponent,multiComponent
} from "../comp/ComputeComponent";
import OutputComponent from "../comp/OutputComponent";
import InputComponent from "../comp/InputComponent"
import {
    Floats2RGComponent,
    Floats2RGBComponent,
    Floats2RGBAComponent
} from "../comp/Floats2RGBComponent";
import {
    RG2FloatsComponent,
    RGB2FloatsComponent,
    RGBA2FloatsComponent
}from "../comp/BreakVec3Component";
import { dotComponent } from "../comp/DotComponent";
import Vec2Component from "../comp/Vec2Component";
import Vec3Component from "../comp/Vec3Component";
import Vec4Component from "../comp/Vec4Component";
//import component here
import { Method, Variable } from "../compile/DataDefine";

import {emptyDom} from "./utility"

import MaterialBuilder, { SUFFIX } from "./MaterialBuilder";
import {extractMeshBufferType} from "./utility"

import PreviewManager from "./PreviewManager";
import {MethodTemplateComponent, MethodsList} from "../comp/MethodTemplateComponent"
import {methods} from "../compile/PredefinedMethod"

class ReteManager{

    constructor(container,modelStore_=null){
        this.container = container;
        //this is a global context description, when it changes, the whole editor will be changed
        //mesh indicates a reference of the input data structure.
        this.context={
            mesh:null,
            name:"shader",
            matBuilder : new MaterialBuilder(),
            modelStore : modelStore_
        }; 
        this.components=[];
        this.previewManager=null;
        //this._buildComponents();
        //this._initEditor("shader");
    }

    _initEditor(name){
        let editor = new Rete.NodeEditor(`${name}@0.1.0`, this.container);
        this.editor = editor;
        editor.use(ConnectionPlugin);
        editor.use(VueRenderPlugin);
        editor.use(ContextMenuPlugin);
        editor.use(AreaPlugin);
        editor.use(PreviewComponent);
        editor.use(NodeListener);

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

        this.previewManager = new PreviewManager(this.editor,this);
        console.log(this.editor);
    }

    removeAll(){
        delete this.editor;
        delete this.engine;
        for(let i=0;i<this.components.length;i++){
            delete this.components[i];
        }
        delete this.components;
        this.components = []
        emptyDom(this.container);
    }

    //for fast prototype only
    _addMethod(method,name,outputName='Result',nameMapping={}){
        if(!method.length){
            method = [method]
        }
        let keys = []
        for(let i in nameMapping){
            keys.push(i)
        }
        let methodlist = new MethodsList(method,outputName,nameMapping,keys)
        let comp = new MethodTemplateComponent(name,methodlist);
        this.components.push(comp);
    }

    _buildComponents(){
        this.outputComponent = new OutputComponent();
        this.components =[
            new NumComponent(),
            addComponent,minusComponent,divComponent,multiComponent,dotComponent,
            new Vec2Component(),
            new Vec3Component(),
            new Vec4Component(),
            new Floats2RGComponent(),
            new Floats2RGBComponent(),
            new Floats2RGBAComponent(),
            new RG2FloatsComponent(),
            new RGB2FloatsComponent(),
            new RGBA2FloatsComponent(),
            this.outputComponent
            // Add component here
        ];
  
        // Input component, automatically generated.
        const mesh = this.context.mesh;
        if(mesh){
            const attrs = mesh.geometry.attributes;
            for(const k in attrs){
                const v = attrs[k];
                const typeName = extractMeshBufferType(v);
                if(typeName){
                    let comp = new InputComponent(`${k} (${typeName})`,typeName,new Variable(typeName,`${k}${SUFFIX}`));
                    console.log(`Add component: ${k} (${typeName})`)
                    this.components.push(comp);
                }
            }
        }

        //hard coded for the fast prototype!
        let comp = new InputComponent(`Texture (Texture2D)`,'texture2D',new Variable('texture2D',`ourTexture`));
        

        this._addMethod(
            new Method('sampleTexture2D',
                {
                    't':'texture2D',
                    'uv':'vec2'
                },
                'vec4',
                ()=>{},
                'texture2D(#t#,#uv#)'
                ),
            'Sample Texture',
            'Color (Vec4)',
            {
                't':'Texture',
                'uv':'Sample Position (UV)'
            }
        )

        this._addMethod(
            new Method('CrossProduct',
                {
                    'a':'vec3',
                    'b':'vec3'
                },
                'vec3',
                (a,b)=>{
                    return [
                        a[1]*b[2]-b[1]*a[2],
                        a[2]*b[0]-b[2]*a[0],
                        a[0]*b[1]-b[0]*a[1]
                    ]
                },
                'cross(#t#,#uv#)'
                ),
            'Cross Product',
            'Vector 3',
            {
                'a':'Value a',
                'b':'Value b'
            }
        )

        this._addMethod(
            methods['step'],
            'Threshold',
            'Is Pass?',
            {
                'v1':'Threshold',
                'v2':'Test value'
            }
        )

        this._addMethod(
            methods['mix'],
            'Mix',
            'Result',
            {
                'v1':'Value 1',
                'v2':'Value 2',
                'v3':'weight'
            }
        )

        this._addMethod(
            methods['max'],
            'Max',
            'Result',
            {
                'v1':'Value 1',
                'v2':'Value 2',
            }
        )

        this._addMethod(
            methods['min'],
            'Min',
            'Result',
            {
                'v1':'Value 1',
                'v2':'Value 2',
            }
        )

        this._addMethod(
            methods['pow'],
            'Power',
            'A^B',
            {
                'v1':'Value A',
                'v2':'Value B',
            }
        )

        this._addMethod(
            methods['sin'],
            'Sin',
            'result',
            {
                'v1':'Value A',
                'v2':'Value B',
            }
        )

        this._addMethod(
            methods['cos'],
            'Cos',
            'result',
            {
                'v1':'Value A',
                'v2':'Value B',
            }
        )

        this._addMethod(
            methods['tan'],
            'Tan',
            'result',
            {
                'v1':'Value A',
                'v2':'Value B',
            }
        )

        

        
        this.components.push(comp);
        this.outputComponent.addWorkEvent((node) => {
          console.log("--- Final result ---");
          let result = node.result[0];
          console.log(result);
          this.context.matBuilder.fragShader = result;
          console.log("------- END -------")
          this.context.modelStore.applyMaterialToAll(this.context.matBuilder.newMaterial)
        });

    }

    //rebuild the whole node editor, this will remove all the content we have currently
    rebuild(){
        this.removeAll();
        this._buildComponents();
        this._initEditor(this.context.name);
    }

    // set model store
    set modelStore(ms){
        console.log("Set modelStore in rete")
        this.context.modelStore = ms;
        this.mesh = ms.sampleMesh;
    }

    set mesh(mesh_){
        this.context.mesh=mesh_;
        this.context.matBuilder.mesh=mesh_;
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
        let output = await this.outputComponent.createNode();

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