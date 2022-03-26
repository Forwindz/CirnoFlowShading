
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

export {string2Float, vecString2Float}