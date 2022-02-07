import "@babel/polyfill";
import * as shared from '../utility/shared'
import Rete from "rete";
import NumControl from "../control/NumControl"

class NumComponent extends Rete.Component {

    constructor() {
        super("Number");
    }

    builder(node) {
        var out1 = new Rete.Output('num', "Number", shared.numSocket);

        return node.addControl(new NumControl(this.editor, 'num')).addOutput(out1);
    }

    worker(node, inputs, outputs) {
        outputs['num'] = node.data.num;
    }
}

export default NumComponent;
