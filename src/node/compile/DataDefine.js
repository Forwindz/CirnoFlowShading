import { deepClone } from "../utility/utility";
import { varWorker } from "./Compile";
function convertToEnumType(name) {
    if (typeof name == "string") {
        const v = Types.members[name];
        if (v) {
            return v;
        } else {
            console.log("Undefined type enum > " + name);
            return Types.members['null'];
        }
    }
    //debug code:
    if(!name){
        console.log("<Undefined Value> for type name");
        let a=null;
        a.b.c=1;
        return Types.members['null'];
    }
    return name;
}

function convertToStringType(name){
    if(typeof name=="string"){
        return name;
    }else{
        return name.name;
    }
}

class Variable {
    constructor(type, value = null) {
        this.type = convertToEnumType(type)
        this._value = value;
        this.isConstValue = typeof value != "string"; //if is constant, we will compute directly, otherwise, use shader to compute
    }

    toString(){
        return this.type.turnVar2String(this);
    }

    clone(){
        return new Variable(this.type,deepClone(this.value));
    }

    get value() {
        return this._value
    }

    set value(v) {
        if (this._value != v) {
            this._value = v;
            this.isConstValue= typeof value != "string";
        }
    }

    isEquals(v){
        return v instanceof Variable && v.value==this.value && this.type == v.type
    }

}

class Types {
    constructor(name,toStringFunc = null) {
        this.name = name;
        this.implicitTransform = {}
        //this.father = Set();
        //this.children = Set();
        Types.members[name] = this;
        this.toStringFunc = toStringFunc;
    }

    turnVar2String(v){
        const vv = v.value;
        if(typeof vv =="string"){
            return vv;
        }
        if(this.toStringFunc){
            return this.toStringFunc(vv);
        }else{
            return `${vv}`;
        }
       
    }

    // transform from the type
    // for grammar, we use #value# as input 
    addImplicitTransform(name, func, grammar) {
        this.implicitTransform[convertToStringType(name)] = 
            new Method("$"+name+">"+this.name,{"input":name},this,func,grammar);
    }

    toString(){
        return this.name;
    }

    tryTransform(v) {
        let it = this.implicitTransform[v.type];
        if (it) {
            return it.execute({"input":v});
        }
        return null;
    }
    /*
        addFather(name){
            this.father.add(name)
            Types.members[name].children.add(name);
        }
    
        addChild(name){
            Types.members[name].addFather(name);
        }
    
        isFather(name){
            //TODO: optimize with cache or id to lower memory usage
            if (this.children.has(name)){
                return true;
            }else{
                for(let i of this.children){
                    const tp = Types.members[i];
                    const result = tp.isFather(name);
                    if(result){
                        return true;
                    }
                }
            }
            return false;
        }*/
}
Types.members = {}
Types.isCompact = function (a, b) {
    if (convertToEnumType(a).implicitTransform[convertToStringType(b)]) {
        return true;
    }
    return false;
}

Types.define = function (name, toStringFunc) {
    new Types(name, toStringFunc);
}

Types.defineImplicit = function (fromName, toName, func, grammar) {
    Types.members[toName].addImplicitTransform(fromName, func, grammar);
}

class Method{
    constructor(name,inputs,outputType,func,grammar){
        this.name = name;
        this.inputs = inputs; // dictionary of types
        for(let i in this.inputs){
            this.inputs[i] = convertToEnumType(this.inputs[i]);
        }
        this.outputType = convertToEnumType(outputType); // output type
        this.func = func;
        this.grammar = grammar;
    }

    execute(inputs){
        return tryCompute(inputs,this.func,this.outputType,this.grammar);
    }


}

//TODO: implicit match is not implement!
Method.matchMethod = function(methods,name,inputs){
    for(const m of methods){
        if(m.name==name){
            let flag=true;
            for(const i in inputs){
                const a = convertToEnumType(inputs[i].type);
                const b = convertToEnumType(m.inputs[i]);
                if(typeof a == undefined || typeof b == undefined){
                    flag=false;
                    break;
                }
                if(a!=b){
                    flag=false;
                    break;
                }
            }
            if(flag){
                return m;
            }
        }
    }
    return null;
}

Method.matchMethods = function(methods,name,inputs){
    let result = []
    for(const m of methods){
        if(m.name==name){
            let flag=true;
            for(const i in inputs){
                const a = convertToEnumType(inputs[i].type);
                const b = convertToEnumType(m.inputs[i]);
                if(typeof a == undefined || typeof b == undefined){
                    flag=false;
                    break;
                }
                if(a!=b){
                    flag=false;
                    break;
                }
            }
            if(flag){
                result.push(m);
            }
        }
    }
    return result;
}

// null will match every thing, extra inputs does not affect this
// a more flexible version for matching methods
Method.matchPartMethods = function(methods,name,inputs){
    let resultFullMatch = []
    let resultNullMatch = []
    for(const m of methods){
        if(m.name==name || name == null){ // if name is null, then match all methods
            let flagMatch=true;
            let flagNull=false;
            for(const i in m.inputs){ //extra inputs will be ignored!
                if(!inputs[i]){ //input not exists
                    flagNull=true;
                    continue;
                }
                const a = convertToEnumType(inputs[i].type);
                const b = convertToEnumType(m.inputs[i]);
                if(typeof a == undefined || typeof b == undefined){
                    flagMatch=false;
                    break;
                }
                flagNull = flagNull || a.name=='null'
                if(a!=b && a.name!='null'){
                    flagMatch=false;
                    break;
                }
            }
            if(flagMatch){
                if(flagNull){
                    resultNullMatch.push(m)
                }else{
                    resultFullMatch.push(m)
                }
            }
        }
    }
    return {
        fullMatch:resultFullMatch,
        nullMatch:resultNullMatch
    };
}

//gather types of the specific input keys
//input '' to gather output types
Method.gatherMethodsTypeSet = function(methods,parameterPosition){
    let result = new Set();
    let tp;
    for(const m of methods){
        if(parameterPosition==''){
           tp = m.outputType
        }else{
            tp = m.inputs[parameterPosition]
        }
        if(tp){
            result.add(tp.name)
        }
    }
    return result;
}

function tryCompute(vars, lambda, resultType, grammar) {
    console.log(vars);
    console.log(Object.values(vars));
    let values = Object.values(vars);
    for (let i of values) {
        if (!i.isConstValue) {
            return new Variable(resultType,varWorker(vars,grammar))
        }
    }
    return new Variable(resultType, lambda(...values.map((v)=>v.value)));
}


export { Variable, tryCompute, Types, Method };