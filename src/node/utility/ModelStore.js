import * as THREE from 'three'
import { MeshPhongMaterial } from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
//TODO:!!!
class ModelStore{

    constructor(scene){
        this.scene = scene; 
        this.meshes = {};
        this.meshMaterial = {};
    }

    load(path){
        const fbxLoader = new FBXLoader()
        fbxLoader.load(
            path,
            (object) => {
                console.log(object)
                const subobjs = object.children;
                for(const subobj of subobjs){
                    if(subobj.type == "Mesh"){
                        this.meshes[subobj.uuid] = subobj
                        const orgmat = subobj.material;
                        console.log(typeof orgmat)
                        if(orgmat == "MeshPhongMaterial"){
                            //
                        }
                        //TODO: Other types of material
                    }else if(subobj.type == "AmbientLight"){
                        //TODO: parse this
                    }
                }
                console.log(this);
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
            },
            (error) => {
                console.log(error)
            }
        )
    }
}

export default ModelStore;