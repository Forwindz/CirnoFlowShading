import * as THREE from 'three'
import TrackballControls from 'three-trackballcontrols'

const defaultMaterial = new THREE.MeshStandardMaterial({
    side: THREE.FrontSide,
    color: 'hsl(0, 100%, 50%)',
    wireframe: false
})
const defaultGeometry = new THREE.BoxGeometry(100, 100, 100)
const defaultMesh = [new THREE.Mesh(defaultGeometry, defaultMaterial)];
const camera = new THREE.PerspectiveCamera(
    75,
    1,
    0.1,
    1000
);
const light = new THREE.DirectionalLight('hsl(0, 100%, 100%)')
const renderList = new Set();
camera.position.z = 0
camera.position.y = 0;
camera.position.x = 200
let renderer;// = new THREE.WebGLRenderer({ antialias: true, canvas:document.getElementById("threejscanvas") })

function initThree(dom){
    renderer = new THREE.WebGLRenderer({ antialias: true, canvas:dom, alpha: true });
    renderer.setClearColor(0x000000, 0);
    requestAnimationFrame(render);
}

function renderSceneList(){
    for(let i of renderList){
        renderSceneInfo(i.eles.scene,i.eles.camera,i.dom);
    }
}
function renderSceneInfo(scene, camera, elem) {

    // get the viewport relative position of this element
    const { left, right, top, bottom, width, height } =
        elem.getBoundingClientRect();
    const isOffscreen =
        bottom < 0 ||
        top > renderer.domElement.clientHeight ||
        right < 0 ||
        left > renderer.domElement.clientWidth;

    if (isOffscreen) {
        return;
    }

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    const positiveYUpBottom = renderer.domElement.clientHeight - bottom;
    renderer.setScissor(left, positiveYUpBottom, width, height);
    renderer.setViewport(left, positiveYUpBottom, width, height);

    scene.background = null;

    renderer.render(scene, camera);
}

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
}

function render() {
    resizeRendererToDisplaySize(renderer);
    renderer.setScissorTest(false);
    renderer.clear(true, true);
    renderer.setScissorTest(true);
    renderSceneList();
    requestAnimationFrame(render);
}


class RenderManager {

    constructor(mesh = defaultMesh) {
        this.dom = null;
        const scene = new THREE.Scene()

        //TODO: write shader like this: https://github.com/mrdoob/three.js/blob/1ba0eb4f57f6a34b843c8e17d1756dcee99f2b08/examples/jsm/shaders/AfterimageShader.js

        const axes = new THREE.AxesHelper(100)
        this.eles = {
            scene: scene,
            camera: camera,
            controls: null,
            renderer: renderer,
            light: light,
            mesh: mesh,
            axes: axes,
            speed: 0.002,
            //shouldUpdate: false //delay the update to animate()
        }
        this.eles.scene.add(this.eles.camera)
        //this.eles.scene.add(this.eles.light)
        this.eles.scene.add(this.eles.axes)
        for (const i of this.eles.mesh) {
            this.eles.scene.add(i)
        }
        //this.eles.light.position.set(0, 20, 200)
        //this.eles.camera.position.z = 0
        //this.eles.camera.position.y = 0;
        //this.eles.camera.position.x = 200
        this.eles.scene.background = new THREE.Color('rgb(255,255,255)')
        //this.eles.scene.add(new THREE.AmbientLight(new THREE.Color(1,1,1)))

    }

    unmountView() {
        this.dom = null;
        renderList.remove(this);
    }

    _setControl() {
        if (this.eles.controls) {
            delete this.eles.controls;
        }
        this.eles.controls = null;
        this.eles.controls = new TrackballControls(this.eles.camera, this.dom)
        this.eles.controls.rotateSpeed = 1.0
        this.eles.controls.zoomSpeed = 5
        this.eles.controls.panSpeed = 0.8
        this.eles.controls.noZoom = false
        this.eles.controls.noPan = false
        this.eles.controls.staticMoving = true
        this.eles.controls.dynamicDampingFactor = 0.3
    }

    setSize(width, height) {
        this.eles.camera.aspect = width / height;
        this.eles.camera.width = width;
        this.eles.camera.height = height;
    }

    animate() {
        if (!this.dom) {
            return;
        }
        requestAnimationFrame(() => { this.animate() })
        
        this.eles.mesh[0].rotation.y += this.eles.speed
        this.eles.controls.update()
    }

    mountView(ele) {
        this.dom = ele;
        this.setSize(ele.clientWidth, ele.clientHeight)
        this._setControl();
        console.log("Add to renderList")
        console.log(renderList)
        renderList.add(this);
    }

    set mesh(m) {
        if (m.length == 0) {
            console.log("ignore empty mesh")
            return;
        }

        for (const i of this.eles.mesh) {
            this.eles.scene.remove(i)
        }

        for (const i of m) {
            this.eles.scene.add(i);
        }
        this.eles.mesh = m;
    }
}

export default RenderManager;
export {initThree}