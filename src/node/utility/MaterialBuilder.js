import * as THREE from 'three'
import { Float32BufferAttribute } from 'three';

const SUFFIX="_";
class MaterialBuilder{

    constructor(){
        this.model = null;
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
        let s = this._generateFragShaderHeader(this.model)
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
            if(v instanceof Float32BufferAttribute){
                switch(v.itemSize){
                    case 1:
                        s+=`${attrType} float ${k}${attrSuffix};\n`
                        break;
                    case 2:
                    case 3:
                    case 4:
                        s+=`${attrType} vec${v.itemSize} ${k}${attrSuffix};\n`
                        break;
                    default:
                        console.log("buffer itemSize>4, this should not happen >"+v.itemSize);
                        console.log(v);
                        break;
                }
            }else{
                console.log("Not implemented! for other type of buffer attribute");
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