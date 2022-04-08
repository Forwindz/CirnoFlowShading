import * as THREE from 'three'
import TrackballControls from 'three-trackballcontrols'

const defualtMaterial = new THREE.MeshStandardMaterial({
    side: THREE.FrontSide,
    color: 'hsl(0, 100%, 50%)',
    wireframe: false
})
const defaultGeometry = new THREE.BoxGeometry(1, 1, 1)
const defaultMesh = [new THREE.Mesh(defaultGeometry,defualtMaterial)];
const camera = new THREE.PerspectiveCamera(
    75,
    1,
    0.1,
    1000
);
const light = new THREE.DirectionalLight('hsl(0, 100%, 100%)')

const axes = new THREE.AxesHelper(100)

class RenderManager{

    constructor(mesh = defaultMesh){
        this._dom = null;
        const scene = new THREE.Scene()
        
        const renderer = new THREE.WebGLRenderer({ antialias: true })
        //TODO: write shader like this: https://github.com/mrdoob/three.js/blob/1ba0eb4f57f6a34b843c8e17d1756dcee99f2b08/examples/jsm/shaders/AfterimageShader.js

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
        for(const i of this.eles.mesh){
            this.eles.scene.add(i)
        }
        this.eles.light.position.set(0, 20, 200)
        this.eles.camera.position.z = 0
        this.eles.camera.position.y = 0;
        this.eles.camera.position.x = 200
        this.eles.scene.background = new THREE.Color('rgb(233,233,233)')
        //this.eles.scene.add(new THREE.AmbientLight(new THREE.Color(1,1,1)))
        this.eles.renderer.setSize(100,100)

    }

    unmountView(){
        this._dom=null;
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
        if(!this._dom){
            return;
        }
        requestAnimationFrame(()=>{this.animate()})
        this.eles.renderer.render(this.eles.scene, this.eles.camera)
        this.eles.mesh[0].rotation.y += this.eles.speed
        this.eles.controls.update()
    }

    mountView(ele){
        this._dom=ele;
        this.setSize(ele.clientWidth,ele.clientHeight)
        ele.appendChild(this.eles.renderer.domElement)
        this._setControl();
    }

    set mesh(m){
        if(m.length==0){
            console.log("ignore empty mesh")
            console.log(m);
            return;
        }
        console.log("set mesh")
        console.log(m);
        
        for(const i of this.eles.mesh){
            this.eles.scene.remove(i)
        }
        
        for(const i of m){
            this.eles.scene.add(i);
        }
        this.eles.mesh = m;
        console.log(this.eles.scene)
    }
}

export default RenderManager;