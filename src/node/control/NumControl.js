import "@babel/polyfill";
import Rete from "rete";
import VueNumControl from "../../components/VueNumControl"
class NumControl extends Rete.Control {

  constructor(emitter, key, readonly) {
    super(key);
    this.component = VueNumControl;
    this.props = { emitter, ikey: key, readonly };
  }

  setValue(val) {
    this.vueContext.value = val;
  }
}

export default NumControl;