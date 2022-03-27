import * as THREE from "three"
import { Color, MeshLambertMaterial } from "three";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
//TODO:!!!
class ModelStore{

    constructor(){
        this.meshes = {};
        this.textureMaterialMap = {};
        this.objects = [];
    }

    processGroup(object,layer=0){
        if(!object){
            return;
        }
        console.log(object)
        const subobjs = object.children;
        for(const subobj of subobjs){
            if(subobj.type == "Mesh"){
                this.meshes[subobj.uuid] = subobj
                const orgmat = subobj.material;
                if(orgmat.map){
                    if(!this.textureMaterialMap[orgmat.map.uuid]){
                        this.textureMaterialMap[orgmat.map.uuid] = {
                            "relatedMesh":[subobj],
                            "texture":orgmat.map
                        }
                    }else{
                        let tmmap=this.textureMaterialMap[orgmat.map.uuid];
                        tmmap.relatedMesh.push(subobj);
                        
                    }
                }
                if(orgmat.type == "MeshPhongMaterial"){
                    //trying to resolve black texture issue
                    //console.log("Phone!!!!")
                    //subobj.material.emissive=subobj.material.color;
                    //subobj.material.emissiveIntensity=1;
                    //subobj.material.emissiveMap=subobj.material.map;
                }
                //TODO: Other types of material
            }else if(subobj.type == "AmbientLight"){
                //subobj.color = new Color(255,255,255);
                subobj.visible=false; //turn off the whole ambient light
                //TODO: parse this
            }else if(subobj.type == "Group"){
                this.processGroup(subobj,layer+1);
            }
        }
        if(layer==0){
            this.objects.push(object)
        }
        console.log(this.objects);
        console.log(this.textureMaterialMap)
    }

    load(path,onComplete=null){
        let manager = new THREE.LoadingManager()
        if(onComplete){
            manager.onLoad = onComplete;
        }
        const fbxLoader = new FBXLoader(manager)
        fbxLoader.load(
            path,
            (obj)=>{this.processGroup(obj)},
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
            },
            (error) => {
                console.log(error)
            }
        )
    }

    get sampleMesh(){
        for(const i of Object.values(this.meshes)){
            return i;
        }
        return null;
    }

    //set all model with the specific material
    applyMaterialToAll(mat){
        let tempSet = new Set();
        console.log(this.meshes)
        console.log(mat);
        for(let mesh of Object.values(this.meshes)){
            mesh.material = mat;
        }
        if(this.meshes){
            return;
        }
        for(let mesh of Object.values(this.meshes)){
            //mesh.material = mat;
            let texture=mesh.material.map;
            if(texture && !(tempSet.has(texture.uuid))){ //retain the texture settings
                let newmat = mat.clone();
                newmat.map = texture;
                //let testMat = new MeshLambertMaterial();
                //testMat.emissive = new Color(0.1,0.2,0.9);
                //testMat.emissiveIntensity=1.0;
                let textMesh = this.textureMaterialMap[texture.uuid];
                for(let rmesh of textMesh.relatedMesh){
                    rmesh.material = newmat;
                    console.log(rmesh);
                }
                newmat.needsUpdate=true;
                tempSet.add(texture.uuid);
            }
        }
    }
}

export default ModelStore;