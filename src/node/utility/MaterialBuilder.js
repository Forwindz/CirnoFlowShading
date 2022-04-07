import * as THREE from 'three'
import { Variable } from '../compile/DataDefine';
import { extractMeshBufferType,float2PointString } from "./utility"

const SUFFIX="_";
const IGNORE_ATTRS=new Set(
    ["position","normal","uv","tangent","color"]
) //these attribute should be ignored, as three.js has already define these element


class MaterialBuilder{

    constructor(){
        this.mesh = null;
        this.fragShaderText = "";
        this.vertShaderText = "";
        this.uniforms = {
            "time": { value: 1.0 } //TODO: selective, make time dynamic
        }
    }

    _makeShaders(){
        console.log("Shader info");
        console.log(this.vertShaderText)
        console.log("--")
        console.log(this.fragShaderText)
        const material = new THREE.ShaderMaterial({
            uniforms:this.uniforms,
            vertexShader: this.vertShaderText,
            fragmentShader: this.fragShaderText,

        });
        return material;
    }

    _genVertShader(){
        let mesh = this.mesh;
        const attrs = mesh.geometry.attributes;
        let s = this._generateUniformHeader();
        const texture = mesh.material.map;
        if(texture){
            s+= "\
                uniform sampler2D texture;\n";
        }
        s+=this._genenrateBufferInput(mesh,"attribute","",IGNORE_ATTRS);
        s+=this._genenrateBufferInput(mesh,"varying",SUFFIX);
        s+="void main() {\n"
        for(const k in attrs){
            s+=`${k}${SUFFIX} = ${k};\n`
        }
        s+="gl_Position = projectionMatrix * (modelViewMatrix * vec4( position, 1.0 ));\n"
        s+="}\n"
        return s;
    }

    _genFragShader(code){
        let s = this._generateFragShaderHeader(this.mesh)
        s+="void main(){\n  gl_FragColor = "+code+";\n}"
        return s;
    }

    set fragShader(code){
        if(!this.mesh){
            console.log("Not ready, skip compiling")
            return;
        }
        console.log("Begin Compile")
        let finalString = "";
        //TODO: manage all types and for constants
        if(code instanceof Variable){
            switch(code.type.name){
                case "vec4":
                    finalString = `vec4(${code.value})`
                    break;
                case "vec3":
                    finalString = `vec4(${code.value},1.0f)`
                    break;
                case "vec2":
                    finalString = `vec4(${code.value},1.0f)`
                    break;
                case "float":{ //make ESLint happy
                    const s = float2PointString(code.value);
                    finalString = `vec4(${s},${s},${s},1.0f)`
                    break;
                }
                default:
                    console.log("Unhandled final type "+code.type);
                    console.log(code);
                    break;
            }
        }else if(typeof code=="string"){
            finalString = `vec4(${code})`;
        }else if(typeof code=="number"){
            finalString = `vec4(vec3(${float2PointString(code)}),1.0f)`;
        }else{
            console.log("Unhandled final result")
            console.log(code);
        }
        this.fragShaderText = this._genFragShader(finalString);
        this.vertShaderText = this._genVertShader();
        this.newMaterial = this._makeShaders();
    }

    _generateUniformHeader(uniform){
        return "uniform float time;\n" //TODO: add custom support!
    }

    _genenrateBufferInput(mesh,attrType="varying",attrSuffix="",useIgnore=null){
        let s=""
        const attrs = mesh.geometry.attributes;

        for(const k in attrs){
            if(useIgnore){
                if(useIgnore.has(k)){
                    continue;//ignore
                }
            }
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
            s+= "uniform sampler2D texture;\n";
        }
        s+=this._genenrateBufferInput(mesh,"varying",SUFFIX);
        return s;
        
    }

}

export default MaterialBuilder;