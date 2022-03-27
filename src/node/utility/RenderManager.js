import * as THREE from 'three'
import TrackballControls from 'three-trackballcontrols'

const defualtMaterial = new THREE.MeshStandardMaterial({
    side: THREE.FrontSide,
    color: 'hsl(0, 100%, 50%)',
    wireframe: false
})
const defaultGeometry = new THREE.BoxGeometry(1, 1, 1)
const defualtMesh = new THREE.Mesh(defaultGeometry,defualtMaterial);


class RenderManager{

    constructor(mesh = defualtMesh){
        this._dom = null;
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(
            75,
            1,
            0.1,
            1000
        )
        console.log(camera);
        const renderer = new THREE.WebGLRenderer({ antialias: true })
        const light = new THREE.DirectionalLight('hsl(0, 100%, 100%)')
        //TODO: write shader like this: https://github.com/mrdoob/three.js/blob/1ba0eb4f57f6a34b843c8e17d1756dcee99f2b08/examples/jsm/shaders/AfterimageShader.js

        const axes = new THREE.AxesHelper(5)
        this.eles = {
            scene: scene,
            camera: camera,
            controls: null,
            renderer: renderer,
            light: light,
            mesh: mesh,
            axes: axes,
            speed: 0.01,
            //shouldUpdate: false //delay the update to animate()
        }
        this.eles.scene.add(this.eles.camera)
        this.eles.scene.add(this.eles.light)
        this.eles.scene.add(this.eles.axes)
        this.eles.scene.add(this.eles.mesh)
        this.eles.light.position.set(0, 0, 10)
        this.eles.camera.position.z = 2
        this.eles.scene.background = new THREE.Color('rgb(255,255,255)')
        this.eles.renderer.setSize(100,100)

    }

    _setControl(){
        if(this.eles.controls){
            delete this.eles.controls;
        }
        this.eles.controls = null;
        this.eles.controls = new TrackballControls(this.eles.camera,this._dom)
        this.eles.controls.rotateSpeed = 1.0
        this.eles.controls.zoomSpeed = 5
        this.eles.controls.panSpeed = 0.8
        this.eles.controls.noZoom = false
        this.eles.controls.noPan = false
        this.eles.controls.staticMoving = true
        this.eles.controls.dynamicDampingFactor = 0.3
    }

    setSize(width,height){
        this.eles.camera.aspect = width/height;
        this.eles.camera.width = width;
        this.eles.camera.height = height;
        this.eles.renderer.setSize(width,height);
    }

    animate(){
        requestAnimationFrame(()=>{this.animate()})
        this.eles.renderer.render(this.eles.scene, this.eles.camera)
        this.eles.mesh.rotation.y += this.eles.speed
        this.eles.controls.update()
    }

    mountView(ele){
        this._dom=ele;
        this.setSize(ele.clientWidth,ele.clientHeight)
        ele.appendChild(this.eles.renderer.domElement)
        this._setControl();
    }

    set mesh(m){
        this.eles.scene.remove(this.eles.mesh)
        this.eles.scene.add(m);
        this.eles.mesh = m;
    }
}

export default RenderManager;