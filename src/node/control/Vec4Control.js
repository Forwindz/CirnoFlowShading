import "@babel/polyfill";
import Rete from "rete";
import VueVec4Control from "../../components/VueVec4Control"
class Vec4Control extends Rete.Control {

  constructor(emitter, key, readonly) {
    super(key);
    this.component = VueVec4Control;
    this.props = { emitter, ikey: key, readonly };
  }

  setValue(val) {
    this.vueContext.value = val;
  }
}

export default Vec4Control;