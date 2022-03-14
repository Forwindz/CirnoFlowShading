import { textWorker, varWorker } from "./Compile";
function convertToEnumType(name) {
    if (typeof name == "string") {
        const v = Types.members[name];
        if (v) {
            return v;
        } else {
            console.log("Undefined type enum > " + name);
            return null;
        }
    }
    //debug code:
    if(!name){
        console.log("<Undefined Value> for type name");
        return null;
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
        this.isConstValue = typeof value != "string";
    }

    toString(){
        return `${this._value}`
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

}

class Types {
    constructor(name) {
        this.name = name;
        this.implicitTransform = {}
        //this.father = Set();
        //this.children = Set();
        Types.members[name] = this;
    }

    // transform from the type
    // for grammar, we use #value# as input 
    addImplicitTransform(name, func, grammar) {
        this.implicitTransform[convertToStringType(name)] = 
            new Method("$"+name+">"+this.name,{"input":name},this,func,grammar);
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

Types.define = function (name) {
    new Types(name);
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
            console.log(m);
            console.log(inputs);
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