import "@babel/polyfill";
import Rete from "rete";
import VueVec2Control from "../../components/VueVec2Control"
class Vec2Control extends Rete.Control {

  constructor(emitter, key, readonly) {
    super(key);
    this.component = VueVec2Control;
    this.props = { emitter, ikey: key, readonly };
  }

  setValue(val) {
    this.vueContext.value = val;
  }
}

export default Vec2Control;