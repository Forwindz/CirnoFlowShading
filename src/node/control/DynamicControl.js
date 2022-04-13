import "@babel/polyfill";
import Rete from "rete";
import { reactive, ref } from "vue";
import VueDynamicControl from "../../components/VueDynamicControl"
class DynamicControl extends Rete.Control {

  constructor(emitter, key, readonly) {
    super(key);
    this.component = VueDynamicControl;
    this._types = reactive(new Set())
    this.props = { emitter, ikey: key, readonly, type:this._type };
  }

  setValue(val) {
    this.vueContext.value = val.value;
    //this._types.value=val.type.name;
  }
}

export default DynamicControl;