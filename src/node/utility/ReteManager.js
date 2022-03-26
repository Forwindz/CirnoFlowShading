import "@babel/polyfill";
import Rete from "rete";
import ConnectionPlugin from "rete-connection-plugin";
import VueRenderPlugin from "rete-vue-render-plugin";

import ContextMenuPlugin from "rete-context-menu-plugin";
import AreaPlugin from "rete-area-plugin";

import NumComponent from "../comp/NumComponent";
import AddComponent from "../comp/AddComponent";
import OutputComponent from "../comp/OutputComponent";

class ReteManager{

    constructor(container){
        this.container = container;
        this._buildComponents();
        this._initEditor();
    }

    _initEditor(){
        let editor = new Rete.NodeEditor("shaderEditor@0.1.0", this.container);
        this.editor = editor;
        editor.use(ConnectionPlugin);
        editor.use(VueRenderPlugin);
        editor.use(ContextMenuPlugin, {
          searchBar: true,
          delay: 100,
          allocate(component) {
            return component;
          },
          rename(component) {
            return component.name;
          },
          items: {
            "Click me"() {
              console.log("Works!");
            },
          },
        });
        editor.use(AreaPlugin);

        let engine = new Rete.Engine("shaderEditor@0.1.0");
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

    _buildComponents(){
        this.components =[
            new NumComponent(),
            new AddComponent(),
            new OutputComponent()
        ];
  
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
    }

    setMesh(mesh){
        // register extra components for input

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