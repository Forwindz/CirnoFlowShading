
import {Float32BufferAttribute} from "three"

function string2Float(x){
    if(typeof x=="number"){
        return x;
    }
    if (process.env.NODE_ENV === "development") {
        //debug code
        if(typeof x!="string"){
            console.log("Error while parsing x to float")
            console.log(x);
        }
    }
    const r = parseFloat(x);
    if(r){
        return r;
    }else{
        return 0;
    }
}

function vecString2Float(x){
    let newv=[]
    for(const i in x){
        newv[i] = string2Float(x[i]);
    }
    return newv;
}

//input mesh.geometry each buffer input
//return a type name in glsl
function extractMeshBufferType(v){
    let typeName = null;
    if(v instanceof Float32BufferAttribute){
        switch(v.itemSize){
            case 1:
                typeName=`float`;
                break;
            case 2:
            case 3:
            case 4:
                typeName=`vec${v.itemSize}`
                break;
            default:
                console.log("buffer itemSize>4, this should not happen >"+v.itemSize);
                console.log(v);
                break;
        }
    }else{
        console.log("Not implemented! for other type of buffer attribute");
    }
    return typeName;
}

function emptyDom(element) {
    while(element.firstElementChild) {
       element.firstElementChild.remove();
    }
}

// some issues with core.js settings, I cannot use function.bind(variables), so I write an own version
// just to make sure the project is able to run.
function bindFunction(func,...vars){
    return ()=>{func(...vars)};
}

// convert number to 0.0f format, to indicate it is a float number.
function float2PointString(v){
    let r = v.toString();
    if(r.indexOf(".")==-1){
        r+=".0f";
    }else{
        r+="f";
    }
    return r;
}

// return linear interperation
function lerp(a,b,t){
    return (b-a)*t+a
}

function arrayLerp(a,b,t){
    result = []
    const l = a.length()
    for(let i=0;i<l;i++){
        result.push(lerp(a[i],b[i],t))
    }
    return result;
}

function deepClone(obj, hash = new WeakMap()) {
    if (Object(obj) !== obj) return obj; // primitives
    if (hash.has(obj)) return hash.get(obj); // cyclic reference
    let result =   obj instanceof Set ? new Set(obj) 
                 : obj instanceof Map ? new Map(Array.from(obj, ([key, val]) => 
                                        [key, deepClone(val, hash)])) 
                 : obj instanceof Date ? new Date(obj)
                 : obj instanceof RegExp ? new RegExp(obj.source, obj.flags):null;
    if(!result){//left cases
        if (typeof obj.clone=="function"){
            result = obj.clone() // customized method
            hash.set(obj, result);
            return result;
        }else if (obj.constructor){
            result = new obj.constructor();
        }else{
            result = Object.create(null)
        }
    }
    hash.set(obj, result);
    return Object.assign(result, ...Object.keys(obj).map(
        key => ({ [key]: deepClone(obj[key], hash) }) ));
}

const kebabize = (str) => str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase())

function pointDistance(a,b){
    const dx = a[0]-b[0];
    const dy = a[1]-b[1];
    return Math.pow(dx*dx+dy*dy,0.5)
}
export {string2Float, vecString2Float, extractMeshBufferType, 
    emptyDom, bindFunction, float2PointString, lerp, arrayLerp, deepClone, kebabize,
    pointDistance
}