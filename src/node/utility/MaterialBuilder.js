import * as THREE from 'three'
import { Float32BufferAttribute } from 'three';
import extractMeshBufferType from "./utility"

const SUFFIX="_";
class MaterialBuilder{

    constructor(){
        this.mesh = null;
        this.fragShaderText = "";
        this.vertShaderText = "\
        varying vec2 vUv; \
        \
        void main()\
        {\
            vUv = uv;\
            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\
            gl_Position = projectionMatrix * mvPosition;\
        }\
        ";
        this.uniforms = {
            "time": { value: 1.0 } //TODO: selective, make time dynamic
        }
    }

    _makeShaders(){
        const material = new THREE.ShaderMaterial({
            uniforms:this.uniforms,
            vertexShader: this.vertShaderText,
            fragmentShader: this.fragShaderText,

        });
        return material;
    }

    _genVertShader(){
        const attrs = mesh.geometry.attributes;
        let s = this._generateUniformHeader();
        const texture = mesh.material.map;
        if(texture){
            s+= "\
                uniform sampler2D texture;\
            ";
        }
        s+=this._genenrateBufferInput(mesh,"attribute");
        s+=this._genenrateBufferInput(mesh,"varying",SUFFIX);
        s+="void main(){"
        for(const k in attrs){
            s+=`${k}${SUFFIX} = ${k};`
        }
        s+="gl_Position = projectionMatrix * (modelViewMatrix * vec4( position, 1.0 ));"
        s+="}"
        return s;
    }

    _genFragShader(code){
        let s = this._generateFragShaderHeader(this.mesh)
        s+="void main(){\
            gl_FragColor = vec4("+code+",1.0f);}"
        return s;
    }

    set fragShader(code){
        this.fragShaderText = this._genFragShader(code);
        this.vertShaderText = this._genVertShader();
        this.newMaterial = this._makeShaders();
        this.material= this.newMaterial;
    }

    _generateUniformHeader(uniform){
        return "uniform float time;" //TODO: add custom support!
    }

    _genenrateBufferInput(mesh,attrType="varying",attrSuffix=""){
        let s=""
        const attrs = mesh.geometry.attributes;

        for(const k in attrs){
            const v = attrs[k];
            const typeName = extractMeshBufferType(v);
            if(typeName){
                s+=`${attrType} ${typeName} ${k}${attrSuffix};\n`
            }else{
                console.log("Unknown type for buffer, ignore");
            }
        }
        return s;
    }

    _generateFragShaderHeader(mesh){
        let s = this._generateUniformHeader();
        const texture = mesh.material.map;
        if(texture){
            s+= "\
                uniform sampler2D texture;\
            ";
        }
        s+=this._genenrateBufferInput(mesh);
        return s;
        
    }

}

export default MaterialBuilder;