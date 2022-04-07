import "@babel/polyfill";
import Rete from "rete";
import VueVec3Control from "../../components/VueVec3Control"
class Vec3Control extends Rete.Control {

  constructor(emitter, key, readonly) {
    super(key);
    this.component = VueVec3Control;
    this.props = { emitter, ikey: key, readonly };
  }

  setValue(val) {
    this.vueContext.value = val;
  }
}

export default Vec3Control;