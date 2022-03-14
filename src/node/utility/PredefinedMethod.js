import { Method } from "../utility/DataDefine";
import { textWorker } from "./Compile";
class MethodTemplate{
    constructor(name,inputs,outputType,func,grammar,templateVar){
        this.name = name;
        this.inputs = inputs; // dictionary of types
        this.outputType = outputType; // output type
        this.func = func;
        this.grammar = grammar;
        this.templateVar = templateVar
    }

    specialize(vars){
        //let method = new Method()
        let inputs={};
        for(let i in this.inputs){
            inputs[i] = textWorker(vars,this.inputs[i])
        }
        let outputType = textWorker(vars,this.outputType)
        let grammar = textWorker(vars,this.grammar);
        return new Method(this.name,inputs,outputType,this.func,grammar);
    }

    
}

function generateOperationMethod(name,singleOp,singleOpText){
    const acceptType=[
        "float","int","vec2","vec3","vec4"
    ]
    const grammar = "a"+singleOpText+"b";
    let template = new MethodTemplate(
        name,
        {"num":"#IT1#","num2":"#IT2#"},
        "#IT3#",
        (a,b)=>{
            console.log(a)
            console.log(b)
            if(a.length && b.length){
                let r = []
                for(let i in a){
                    r[i] = singleOp(a[i],b[i])
                }
                return r;
            }
            return singleOp(a,b);
        },
        grammar
    );

    let methodLists=[]
    for(const tp of acceptType){
        methodLists.push(template.specialize({"IT1":tp,"IT2":tp,"IT3":tp}))
    }

    const acceptTypeComplex=[
        "vec2","vec3","vec4"
    ]
    for(const tp of acceptTypeComplex){
        methodLists.push(template.specialize({"IT1":tp,"IT2":"float","IT3":tp}));
        methodLists.push(template.specialize({"IT1":tp,"IT2":"int","IT3":tp}));
        if(singleOpText!='/'){
            methodLists.push(template.specialize({"IT1":"float","IT2":tp,"IT3":tp}));
            methodLists.push(template.specialize({"IT1":"int","IT2":tp,"IT3":tp}));
        }
    }
    return methodLists;
}

function defineOpMethods(methods){
    methods["add"] = generateOperationMethod("add",(a,b)=>{return a+b},"+");
    methods["minus"] = generateOperationMethod("minus",(a,b)=>{return a-b},"-");
    methods["mult"] = generateOperationMethod("mult",(a,b)=>{return a*b},"*");
    methods["div"] = generateOperationMethod("div",(a,b)=>{return a/b},"/");
}

var methods= {}
defineOpMethods(methods)
console.log(methods);

export {methods}