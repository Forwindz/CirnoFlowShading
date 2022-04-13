import { Method } from "./DataDefine";
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
        "float","vec2","vec3","vec4"
    ]
    const grammar = "#UPTYPE1#(#num#)"+singleOpText+"#UPTYPE2#(#num2#)";
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
        methodLists.push(template.specialize({"IT1":tp,"IT2":tp,"IT3":tp,"UPTYPE1":'',"UPTYPE2":''}))
    }

    const acceptTypeComplex=[
        "vec2","vec3","vec4"
    ]
    for(const tp of acceptTypeComplex){
        methodLists.push(template.specialize({"IT1":tp,"IT2":"float","IT3":tp,"UPTYPE1":'',"UPTYPE2":tp}));
        //methodLists.push(template.specialize({"IT1":tp,"IT2":"int","IT3":tp}));
        if(singleOpText!='/'){
            methodLists.push(template.specialize({"IT1":"float","IT2":tp,"IT3":tp,"UPTYPE1":tp,"UPTYPE2":''}));
            //methodLists.push(template.specialize({"IT1":"int","IT2":tp,"IT3":tp}));
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

const _fetchIndex2TextList = "rgba";
function fetchIndex2Text(fetchIndex){
    let s=""
    for(let i of fetchIndex){
        s+=_fetchIndex2TextList[i];
    }
    return s;
}
function generateBreakDownMethod(namePrefix,fetchIndex){
    const grammar = "#v#.#s#";
    const fetchName = fetchIndex2Text(fetchIndex);
    const name = namePrefix+"_"+fetchName;
    let outputType = "float"
    if(fetchName.length>1){
        outputType = `vec${fetchName.length}`;
    }
    let template = new MethodTemplate(
        name,
        {"v":"#IT#"},
        "#OT#",
        (v)=>{
            result = [];
            for (i of fetchIndex)
            {
                result.push(v[fetchIndex]);
            }
            return result;
        },
        grammar
    );

    let inputs=[];
    const maxv = Math.max(2,Math.max(...fetchIndex)+1);
    for(let i =4;i>=maxv;i--){
        inputs.push(`vec${i}`);
    }

    let methodList = [];
    for(let i of inputs){
        methodList.push(template.specialize({"s":fetchName,"IT":i,"OT":outputType}));
    }
    return methodList;
    
}

function genFetchIndexes(fetchIndexes = [], layer=0){
    if(layer<0){
        return fetchIndexes;
    }
    let result=[]
    for(let i=0;i<4;i++){
        for(let f of fetchIndexes){
            result.push(f.concat([i]));
        }
    }
    return genFetchIndexes(result,layer-1);
    
}

function moveArray(froma, toa){
    for(const i of toa){
        froma.push(i)
    }
    return froma;
}

function defineBreakDownMethods(methods_){
    let fetchIndexes = []
    const basicIndexes=[[0],[1],[2],[3]]
    fetchIndexes = moveArray(fetchIndexes,genFetchIndexes(basicIndexes,-1));
    fetchIndexes = moveArray(fetchIndexes,genFetchIndexes(basicIndexes,0));
    fetchIndexes = moveArray(fetchIndexes,genFetchIndexes(basicIndexes,1));
    fetchIndexes = moveArray(fetchIndexes,genFetchIndexes(basicIndexes,2));
    let methods = [];
    for(let i of fetchIndexes){
        methods = moveArray(methods,generateBreakDownMethod("extract",i));
    }
    methods_["extract"] = methods;
}

var methods= {}
defineOpMethods(methods)
defineBreakDownMethods(methods);
console.log(methods);

export {methods}