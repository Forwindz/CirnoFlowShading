
function textWorker(inputs,grammar,presufix="#"){
    let t = grammar;
    for(let k in inputs){
        t = t.replace(presufix+k+presufix,inputs[k].toString())
    }
    return t;
}

function varWorker(inputs,grammar,presufix="#"){
    let t = grammar;
    for(let k in inputs){
        t = t.replace(presufix+k+presufix,inputs[k].value.toString())
    }
    return t;
}

export {textWorker, varWorker}