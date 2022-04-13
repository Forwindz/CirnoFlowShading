import * as THREE from "three"
import { Color, MeshLambertMaterial } from "three";
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
//TODO:!!!
/*
THREE.Mesh.prototype.clone = function ( object ) {

    if ( object === undefined ) object = new THREE.Mesh( this.geometry, this.material );

    THREE.Object3D.prototype.clone.call( this, object );

    return object;

};*/

class ModelStore{

    constructor(){
        this.meshes = {};
        this.textureMaterialMap = {};
        this.objects = [];
        this.meshToTexture = new Map();
    }

    //return a new object with shallow copy
    roughClone(){
        let ms = new ModelStore();
        //ms.meshes = this.meshes;
        ms.objects = [];
        //ms.textureMaterialMap = this.textureMaterialMap;
        for(let obj of this.objects){
            ms.processGroup(obj.clone());
            //ms.objects.push(obj.clone());
        }
        console.log("clone!!!")
        console.log(this)
        console.log(ms);
        return ms;
    }
/*
    _roughCloneInner(obj){
        if(obj.type == "Mesh"){
            let r = obj.copy();
        }else if(subobj.type == "Group"){
            for(let i=0;i<subobj.children.length;i++){
                let v =subobj.children[i];
                delete v;
                subobj.children[i] = this._roughCloneInner(obj);
            }
        }
    }*/

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
                    this.meshToTexture.set(subobj,orgmat.map);
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
            //let material = mat.clone();
            ////material.map = mesh.material.map;
            //const map = this.meshToTexture.get(mesh);
            //console.log(map);
            //console.log(material);
            //console.log(material.uniforms);
            //material.unifroms.ourTexture = map;
            //mesh.material = material;
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
        console.log("final r",this)
    }


    applyMaterialToAllBuilder(mat){
        let tempSet = new Set();
        console.log(this.meshes)
        console.log(mat);
        //for(let mesh of Object.values(this.meshes)){
        //    mesh.material = mat;
        //}
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
        console.log("final r",this)
    }
}

export default ModelStore;