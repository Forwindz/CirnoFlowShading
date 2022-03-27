import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
//TODO:!!!
class ModelStore{

    constructor(){
        this.meshes = {};
        this.textureMaterialMap = {};
        this.object = [];
    }

    load(path){
        const fbxLoader = new FBXLoader()
        let innerRecusive;
        fbxLoader.load(
            path,
            innerRecusive = function(object){
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
                                    "texture":[orgmat.map]
                                }
                            }else{
                                let tmmap=this.textureMaterialMap[orgmat.map.uuid];
                                tmmap.relatedMesh.push(subobj);
                            }
                        }
                        if(orgmat == "MeshPhongMaterial"){
                            //
                        }
                        //TODO: Other types of material
                    }else if(subobj.type == "AmbientLight"){
                        //TODO: parse this
                    }else if(subobj.type == "Group"){
                        innerRecusive(subobj);
                    }
                }
                this.object.push(this)
                console.log(this.object);
                console.log(this.textureMaterialMap)
            },
            (xhr) => {
                console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
            },
            (error) => {
                console.log(error)
            }
        )
    }

    get sampleMesh(){
        for(const i of this.meshes){
            return i;
        }
        return null;
    }

    //set all model with the specific material
    applyMaterialToAll(mat){
        let tempSet = new Set();
        for(let mesh of this.meshes){
            mesh.material = mat;
            let texture=mesh.material.map;
            if(texture && !(tempSet.has(texture.uuid))){ //retain the texture settings
                let newmat = mat.clone();
                newmat.map = texture;
                let textMesh = this.textureMaterialMap[texture.uuid];
                for(let rmesh of textMesh.relatedMesh){
                    rmesh.material = newmat;
                }
                tempSet.add(texture.uuid);
            }
        }
    }
}

export default ModelStore;