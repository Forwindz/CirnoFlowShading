<template>
    <div ref="canvas" id="canvas"></div>
</template>

<script>
// import { Clock, PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import * as THREE from 'three'
import TrackballControls from 'three-trackballcontrols'
/*
import {
    BloomEffect,
    EffectComposer,
    GlitchPass,
    EffectPass,
    RenderPass
} from 'postprocessing'*/

export default {
    name: 'Scene3D',
    data: function() {
        return {
            //vertexShader:"", //TODO: selective, support vertex functioning
            fragShader:"",
            uniforms:{
                "time": { value: 1.0 } //TODO: selective, make time dynamic
            }
        }
    },
    props:[],
    created: function() {
    },
    mounted: function() {
        const scene = new THREE.Scene()
        // const composer = new THREE.EffectComposer(new WebGLRenderer())
        // const effectPass = new THREE.EffectPass(camera, new BloomEffect())
        const camera = new THREE.PerspectiveCamera(
            75,
            this.$refs.canvas.clientWidth / this.$refs.canvas.clientHeight,
            0.1,
            1000
        )
        const renderer = new THREE.WebGLRenderer({ antialias: true })
        const light = new THREE.DirectionalLight('hsl(0, 100%, 100%)')
        const geometry = new THREE.BoxGeometry(1, 1, 1)
        const material = new THREE.MeshStandardMaterial({
            side: THREE.FrontSide,
            color: 'hsl(0, 100%, 50%)',
            wireframe: false
        })
        const mesh = new THREE.Mesh(geometry, material)
        const axes = new THREE.AxesHelper(5)

        this.eles = {
            scene: scene,
            camera: camera,
            controls: [],
            renderer: renderer,
            light: light,
            mesh: mesh,
            axes: axes,
            speed: 0.01,
            //shouldUpdate: false //delay the update to animate()
        }
        
        this.$refs.canvas.appendChild(this.eles.renderer.domElement)
        this.eles.scene.add(this.eles.camera)
        this.eles.scene.add(this.eles.light)
        this.eles.scene.add(this.eles.mesh)
        this.eles.scene.add(this.eles.axes)
        this.eles.light.position.set(0, 0, 10)
        this.eles.camera.position.z = 15
        this.eles.scene.background = new THREE.Color('rgb(233,233,233)')
        console.log(this.$refs.canvas.clientWidth, this.$refs.canvas.clientHeight)
        this.eles.renderer.setSize(this.$refs.canvas.clientWidth, this.$refs.canvas.clientHeight)
        this.eles.controls = new TrackballControls(this.eles.camera,this.$el)
        this.eles.controls.rotateSpeed = 1.0
        this.eles.controls.zoomSpeed = 5
        this.eles.controls.panSpeed = 0.8
        this.eles.controls.noZoom = false
        this.eles.controls.noPan = false
        this.eles.controls.staticMoving = true
        this.eles.controls.dynamicDampingFactor = 0.3
        this.animate()
        
    },
    methods: {
        animate: function() {
            requestAnimationFrame(this.animate)
            this.eles.renderer.render(this.eles.scene, this.eles.camera)
            this.eles.mesh.rotation.y += this.eles.speed
            this.eles.controls.update()
        },
        makeShaders: function(){
            const material = new THREE.ShaderMaterial({
                uniforms:this.uniforms,
                vertexShader: this.fullVertexShader,
                fragmentShader: this.fullFragmentShader,

            });
            return material;
        },
        updateShader: function(){
            console.log("Update shaders")
            this.eles.mesh.material = this.makeShaders();
        }
    },
    watch:{
        fragShader:{
            handler(newv,oldv){
                this.updateShader();
            }
        }
    },
    computed: {
        rotate: function() {
            if (this.eles.speed === '') {
                return 0
            } else {
                return this.eles.speed
            }
        },
        fullVertexShader: function(){
            return "\
varying vec2 vUv; \
\
void main()\
{\
    vUv = uv;\
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\
    gl_Position = projectionMatrix * mvPosition;\
}\
"
        },
        fullFragmentShader:function(){
            return "\
uniform float time;\
varying vec2 vUv;\
void main( void ) {\
    vec2 position = - 1.0f + 2.0f * vUv;\
    gl_FragColor = vec4( " 
        + this.fragShader +
    ", 1.0f );}"
        }
    }
}
</script>
<style>
canvas {
    width: 100vw;
    height: 100vh;
}
</style>
