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
            //console.log(a)
            //console.log(b)
            if(a.length && b.length){
                let r = []
                for(let i in a){
                    r[i] = singleOp(a[i],b[i])
                }
                return r;
            }
            if(!a.length){
                if(!b.length){
                    return singleOp(a,b)
                }
                let r =[]
                for(let i in b){
                    r[i]=singleOp(a,b[i])
                }
                return r
            }else if (!b.length){
                let r =[]
                for(let i in a){
                    r[i]=singleOp(a[i],b)
                }
                return r
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
            let result = [];
            for (let i of fetchIndex)
            {
                result.push(v[i]);
            }
            if(result.length==1){
                return result[0];
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
    //fetchIndexes = moveArray(fetchIndexes,genFetchIndexes(basicIndexes,0));
    //fetchIndexes = moveArray(fetchIndexes,genFetchIndexes(basicIndexes,1));
    //fetchIndexes = moveArray(fetchIndexes,genFetchIndexes(basicIndexes,2));
    let methods = [];
    for(let i of fetchIndexes){
        methods = moveArray(methods,generateBreakDownMethod("extract",i));
    }
    methods_["extract"] = methods;
}

function defineVariesFunction(methods_){
    let methods = []
    
    methods.push(new Method('numberToVec2',
    {  
        "r":"float",
        "g":"float"
    },"vec2",
    (r,g)=>{return [r,g]},
    "vec2(#r#,#g#)"
    ))
    methods.push(new Method('numberToVec3',
    {  
        "r":"float",
        "g":"float",
        "b":"float"
    },"vec3",
    (r,g,b)=>{return [r,g,b]},
    "vec3(#r#,#g#,#b#)"
    ))

    methods.push(new Method('numberToVec4',
    {  
        "r":"float",
        "g":"float",
        "b":"float",
        "a":"float"
    },"vec4",
    (r,g,b,a)=>{return [r,g,b,a]},
    "vec4(#r#,#g#,#b#,#a#)"
    ))
/*
    methods.push(new Method('fetchX',
    {  
        "v":"vec2"
    },"float",
    (v)=>{return v[0]},
    "(#v#.r)"
    ))
*/
    methods_["varying"] = methods;
}

function dot(a,b){
    let v = 0
    for(let i=0;i<a.length;i++){
        v+=a[i]*b[i]
    }
    return v;
}

function defineDot(methods_){
    let methods = []
    
    methods.push(new Method('dot',
    {  
        "a":"float",
        "b":"float"
    },"float",
    (a,b)=>{return a*b},
    "#a#*#b#"
    ));

    methods.push(new Method('dot',
    {  
        "a":"vec2",
        "b":"vec2"
    },"float",
    (a,b)=>{return dot(a,b)},
    "dot(#a#,#b#)"
    ));

    methods.push(new Method('dot',
    {  
        "a":"vec3",
        "b":"vec3"
    },"float",
    (a,b)=>{return dot(a,b)},
    "dot(#a#,#b#)"
    ));

    methods.push(new Method('dot',
    {  
        "a":"vec4",
        "b":"vec4"
    },"float",
    (a,b)=>{return dot(a,b)},
    "dot(#a#,#b#)"
    ));
    methods_["dot"] = methods
}

function defineStep(methods_){
    let template = new MethodTemplate(
        'setp',
        {
            "v1":"#IT1#",
            "v2":"#IT2#"
        },
        "#OT#",
        (v1,v2)=>{
            if(!v1.length && !v2.length){
                return v1>v2?1.0:0.0
            }
            let result=[]
            if(v1.length && v2.length){
                for(let i=0;i<v1.length;i++){
                    result.push(v1[i]>v2[i]?1.0:0.0)
                }
            }
            if(!v1.length && v2.length){
                for(let i=0;i<v2.length;i++){
                    result.push(v1>v2[i]?1.0:0.0)
                }
            }
            if(v1.length && !v2.length){
                for(let i=0;i<v1.length;i++){
                    result.push(v1[i]>v2?1.0:0.0)
                }
            }
            return result;
        },
        'step(#v1#,#v2#)'
    );

    const list = ['float','vec2','vec3','vec4'];
    const slist = ['vec2','vec3','vec4'];
    let result = []
    for(let input1 of list){
        result.push(template.specialize({"IT1":input1,"IT2":input1,"OT":input1}))

    }
    for(let input1 of slist){
        result.push(template.specialize({"IT1":'float',"IT2":input1,"OT":input1}))
    }
    methods_['step'] = result
}


function defineMix(methods_){
    const interp = function(x,y,v){
        return x*(1-v)+y*v
    }
    let template = new MethodTemplate(
        'mix',
        {
            "v1":"#IT1#",
            "v2":"#IT2#",
            "v3":"#IT3#"
        },
        "#OT#",
        (v1,v2,v3)=>{
            if(!v1.length && !v2.length && !v3.length){
                return interp(v1,v2,v3)
            }
            let result=[]
            if(v1.length && v2.length && v3.length){
                for(let i=0;i<v1.length;i++){
                    result.push(interp(v1[i],v2[i],v3[i]))
                }
            }
            if(v1.length && v2.length && !v3.length){
                for(let i=0;i<v1.length;i++){
                    result.push(interp(v1[i],v2[i],v3))
                }
            }
            return result
        },
        'mix(#v1#,#v2#,#v3#)'
    );

    const list = ['float','vec2','vec3','vec4'];
    const slist = ['vec2','vec3','vec4'];
    let result = []
    for(let input1 of list){
        result.push(template.specialize({"IT1":input1,"IT2":input1,'IT3':input1,"OT":input1}))

    }
    for(let input1 of slist){
        result.push(template.specialize({"IT1":input1,"IT2":input1,'IT3':'float',"OT":input1}))
    }
    methods_['mix'] = result
}



function defineMax(methods_){
    let template = new MethodTemplate(
        'max',
        {
            "v1":"#IT1#",
            "v2":"#IT2#"
        },
        "#OT#",
        (v1,v2)=>{
            if(!v1.length && !v2.length){
                return v1>v2?v1:v2
            }
            let result=[]
            if(v1.length && v2.length){
                for(let i=0;i<v1.length;i++){
                    result.push(v1[i]>v2[i]?v1[i]:v2[i])
                }
            }
            if(!v1.length && v2.length){
                for(let i=0;i<v2.length;i++){
                    result.push(v1>v2[i]?v1:v2[i])
                }
            }
            if(v1.length && !v2.length){
                for(let i=0;i<v1.length;i++){
                    result.push(v1[i]>v2?v1[i]:v2)
                }
            }
            return result;
        },
        'max(#v1#,#v2#)'
    );

    const list = ['float','vec2','vec3','vec4'];
    const slist = ['vec2','vec3','vec4'];
    let result = []
    for(let input1 of list){
        result.push(template.specialize({"IT1":input1,"IT2":input1,"OT":input1}))

    }
    for(let input1 of slist){
        result.push(template.specialize({"IT1":input1,"IT2":'float',"OT":input1}))
    }
    methods_['max'] = result
}


function defineMin(methods_){
    let template = new MethodTemplate(
        'min',
        {
            "v1":"#IT1#",
            "v2":"#IT2#"
        },
        "#OT#",
        (v1,v2)=>{
            if(!v1.length && !v2.length){
                return v1<v2?v1:v2
            }
            let result=[]
            if(v1.length && v2.length){
                for(let i=0;i<v1.length;i++){
                    result.push(v1[i]<v2[i]?v1[i]:v2[i])
                }
            }
            if(!v1.length && v2.length){
                for(let i=0;i<v2.length;i++){
                    result.push(v1<v2[i]?v1:v2[i])
                }
            }
            if(v1.length && !v2.length){
                for(let i=0;i<v1.length;i++){
                    result.push(v1[i]<v2?v1[i]:v2)
                }
            }
            return result;
        },
        'min(#v1#,#v2#)'
    );

    const list = ['float','vec2','vec3','vec4'];
    const slist = ['vec2','vec3','vec4'];
    let result = []
    for(let input1 of list){
        result.push(template.specialize({"IT1":input1,"IT2":input1,"OT":input1}))

    }
    for(let input1 of slist){
        result.push(template.specialize({"IT1":input1,"IT2":'float',"OT":input1}))
    }
    methods_['min'] = result
}

var methods= {}
defineOpMethods(methods)
defineBreakDownMethods(methods);
defineVariesFunction(methods);
defineDot(methods)
defineStep(methods)
defineMix(methods)
defineMax(methods)
defineMin(methods)

console.log("FullMethods",methods);

export {methods}