
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
export {string2Float, vecString2Float, extractMeshBufferType, emptyDom, bindFunction}