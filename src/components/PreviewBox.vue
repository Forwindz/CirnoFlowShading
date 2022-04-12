<template>
  <div>
    <div
      v-bind:class="'node preview ' + this.nodeStyle.nodeStyle.classInfo.value"
      v-bind:style="this.nodeStyle.nodeStyle.styleInfo.value"
      style="width: 135px; height: 100px"
    >
      <div style="display: inline; float: right">
        <button class="button preview-lock-button2" 
          title="Apply the parameter set to original nodes"
          v-if="this.state.value == 'apply'"
          v-on:click="this.onclick2()">
          <svg
            fill="#ffffff"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            style="enable-background: new 0 0 30 30"
            version="1.1"
            viewBox="0 0 30 30"
            xml:space="preserve"
          >
            <path
              d="M24,13.328V24H6V10h10.672l6-6H6C4.895,4,4,4.895,4,6v18c0,1.105,0.895,2,2,2h18c1.105,0,2-0.895,2-2V11.329L24,13.328z"
            />
            <g>
              <path
                d="M28.957,5.543l0.525-0.525c0.69-0.69,0.69-1.81,0-2.5s-1.81-0.69-2.5,0l-0.525,0.525L28.957,5.543z"
              />
            </g>
            <g>
              <polygon
                points="25.043,4.457 14.475,15.025 14,18 16.975,17.525 27.543,6.957  "
              />
            </g>
          </svg>
        </button>

        <button
          v-bind:class="'button preview-lock-button ' + this.state.value"
          v-on:click="this.onclick()"
        >
          <svg
            v-if="this.state.value == 'lock'"
            title="Keep the preview existing"
            fill="#ffffff"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 30 30"
            width="100%"
            height="100%"
            style=""
          >
            <path
              d="M 15 2 C 11.145666 2 8 5.1456661 8 9 L 8 11 L 6 11 C 4.895 11 4 11.895 4 13 L 4 25 C 4 26.105 4.895 27 6 27 L 24 27 C 25.105 27 26 26.105 26 25 L 26 13 C 26 11.895 25.105 11 24 11 L 22 11 L 22 9 C 22 5.2715823 19.036581 2.2685653 15.355469 2.0722656 A 1.0001 1.0001 0 0 0 15 2 z M 15 4 C 17.773666 4 20 6.2263339 20 9 L 20 11 L 10 11 L 10 9 C 10 6.2263339 12.226334 4 15 4 z"
            />
          </svg>

          <svg
            v-if="this.state.value == 'unlock'"
            title="Let the preview disappears after some seconds"
            fill="#ffffff"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            width="100%"
            height="100%"
            viewBox="0 0 53.768 53.768"
            style="enable-background: new 0 0 53.768 53.768"
            xml:space="preserve"
          >
            <g>
              <path
                d="M39.714,23.75h-2.08h-20.5V6.669C17.134,4.094,19.228,2,21.803,2h10.161c2.574,0,4.67,2.094,4.67,4.669v7.235
		c0,0.553,0.447,1,1,1s1-0.447,1-1V6.669c0-3.678-2.992-6.669-6.67-6.669H21.803c-3.678,0-6.669,2.991-6.669,6.669V23.75h-1.081
		c-3.678,0-6.669,2.991-6.669,6.669v16.679c0,3.678,2.991,6.67,6.669,6.67h25.661c3.678,0,6.67-2.992,6.67-6.67V30.419
		C46.384,26.741,43.392,23.75,39.714,23.75z M44.384,47.098c0,2.574-2.096,4.67-4.67,4.67H14.053c-2.575,0-4.669-2.096-4.669-4.67
		V30.419c0-2.575,2.094-4.669,4.669-4.669h2.081h21.5h2.08c2.574,0,4.67,2.094,4.67,4.669V47.098z"
              />
            </g>
          </svg>

          <svg
            v-if="this.state.value == 'apply'"
            title="Create a new group of nodes, and change the preset to the new group"
            fill="#ffffff"
            xmlns="http://www.w3.org/2000/svg"
            height="100%"
            viewBox="0 0 24 24"
            width="100%"
          >
            <path
              d="M13,3 L5,3 L5,21 L15,21 L15,23 L5,23 C3.8954305,23 3,22.1045695 3,21 L3,3 C3,1.8954305 3.8954305,1 5,1 L15.4142136,1 L21,6.58578644 L21,14 L19,14 L19,9 L15,9 C13.8954305,9 13,8.1045695 13,7 L13,3 Z M19,19 L19,17 L21,17 L21,19 L23,19 L23,21 L21,21 L21,23 L19,23 L19,21 L17,21 L17,19 L19,19 Z M18.5857864,7 L15,3.41421356 L15,7 L18.5857864,7 Z"
              fill-rule="evenodd"
            />
          </svg>
        </button>

        
      </div>
      <Scene3D
        ref="p1"
        style="width: 100px; height: 100px; margin: 3px"
        v-bind:modelStore="this.modelStore"
      ></Scene3D>
    </div>
  </div>
</template>

<script>
import Scene3D from "./Scene3D.vue";
import { toRaw } from "vue";
// TODO: add width/height support
import MaterialBuilder from "../node/utility/MaterialBuilder";
export default {
  name: "PreviewBox",
  props: ["modelStore", "variable", "nodeStyle", "state", "setState", "apply"],
  data: () => {
    return {
      displayText: "",
      matBuilder: new MaterialBuilder(),
    };
  },
  components: {
    Scene3D,
  },
  mounted() {},
  methods: {
    buildMat() {
      console.log("======================================");
      console.log("Update variable!");
      console.log(this.variable);
      this.matBuilder.fragShader = toRaw(this.variable);
      this.modelStore.applyMaterialToAll(toRaw(this.matBuilder.newMaterial));
      console.log("======================================");
    },

    onclick() {
      if (this.state.value == "lock") {
        this.setState("unlock");
      } else if (this.state.value == "unlock") {
        this.setState("lock");
      } else if (this.state.value == "apply") {
        this.apply.func();
      }
    },

    onclick2(){
      this.apply.func2();
    }
  },
  updated: () => {},
  computed: {},
  watch: {
    modelStore: {
      handler: function (newv, oldv) {
        console.log(newv, oldv);
        if (!newv) {
          return;
        }
        this.matBuilder.mesh = toRaw(newv).sampleMesh;
        this.buildMat();
      },
      immediate: true,
      deep: false,
    },
    variable: {
      handler: function (newv, oldv) {
        if (!this.modelStore) {
          return;
        }
        this.buildMat();
      },
      immediate: true,
      deep: true,
    },
  },
};
</script>
<style scoped>
.preview-lock-button {
  display: block;
  margin: 4px;
  width: 25px;
  height: 25px;
}
.preview-lock-button2 {
  display: block;
  margin: 4px;
  width: 25px;
  height: 25px;
}
.lock {
  background-color: rgba(180, 180, 180, 0.8);
}
</style>

