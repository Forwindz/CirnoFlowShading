import { Types } from "./DataDefine";
import { float2PointString } from "../utility/utility";
import Rete from "rete";
function defineTypes(){
    Types.define("any")
    Types.define("null")
    Types.define("float",(v)=>{return float2PointString(v)});
    Types.define("int")
    Types.define("texture2D")
    Types.define("vec2",(v)=>{return `vec2(${float2PointString(v[0])},${float2PointString(v[1])})`})
    Types.define("vec3",(v)=>{return `vec3(${float2PointString(v[0])},${float2PointString(v[1])},${float2PointString(v[2])})`})
    Types.define("vec4",(v)=>{return `vec4(${float2PointString(v[0])},${float2PointString(v[1])},${float2PointString(v[2])},${float2PointString(v[3])})`})
    //TODO: resolve #input#
    Types.defineImplicit("float","int",(v)=>{return v.toFixed(0)},"int(#input#)");
    Types.defineImplicit("int","float",(v)=>{return v+0.0},"float(#input#)");
    Types.defineImplicit("float","vec2",(v)=>{return [v,v]},"vec2(#input#)");
    //Types.defineImplicit("float","vec3",(v)=>{return [v,v,v]},"vec3(#input#)");
    //Types.defineImplicit("float","vec4",(v)=>{return [v,v,v,v]},"vec4(#input#)");
    //Types.defineImplicit("vec2","vec3",(v)=>{return [v[0],v[1],0]},"vec3(#input#.x,#input#.y,0)");
    //Types.defineImplicit("vec2","vec4",(v)=>{return [v[0],v[1],0,0]},"vec4(#input#.xy,0,0)");
    //Types.defineImplicit("vec3","vec4",(v)=>{return [v[0],v[1],v[2],0]},"vec4(#input#.xyz,0)");
}

function postProcess(){
    console.log(Types);

    for(let k in Types.members){
        Types.members[k].reteSocket = new Rete.Socket(k);
    }

    for(let k in Types.members){
        let v = Types.members[k];
        let ls = v.implicitTransform;
        for(let i in ls){
            //v.reteSocket.combineWith(Types.members[i].reteSocket)
            Types.members[i].reteSocket.combineWith(v.reteSocket);
        }
        v.reteSocket.combineWith(Types.members["any"].reteSocket)
    }   
}

function getSocket(name){
    const v = Types.members[name];
    if(v){
        return v.reteSocket;
    }else{
        console.log("Unknown Socket Type > "+name)
        asd
        return null;
    }
}

defineTypes();
postProcess();

export {getSocket};







