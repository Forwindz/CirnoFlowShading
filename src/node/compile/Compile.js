
/**
 * A simple text replacer
 * @param {Dictionary} inputs {a:1,b:"vec2(0.5,1.0)"}
 * @param {string} grammar something like "#a#+vec3(1.0,#bvar#)"
 * @param {string} presufix a => ${presufix}a${presufix}
 * @returns replace all inputs with corresponding values "1+vec3(1.0,vec2(0.5,1.0))"
 */
function textWorker(inputs,grammar,presufix="#"){
    let t = grammar;
    for(let k in inputs){
        t = t.replace(presufix+k+presufix,inputs[k].toString())
    }
    return t;
}


/**
 * An advanced replacer, for Variables
 * 
 * @param {*} inputs 
 * @param {*} grammar 
 * @param {*} presufix 
 * @returns 
 */
function varWorker(inputs,grammar,presufix="#"){
    let t = grammar;
    for(let k in inputs){
        t = t.replace(presufix+k+presufix,inputs[k].toString())
        //TODO: a better generator, current is tooooooo bruteforce and inflexible!
        //Although we do not do the code analysis, but at least make it not too long for glsl compiler.
    }
    return t;
}


export {textWorker, varWorker}