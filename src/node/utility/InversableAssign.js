function defaultAssign(ref,assignValue){
    Object.assign(ref,assignValue)
}

function defaultUndo(ref,assignValue){
    Object.assign(assignValue,ref)
}

class InverseSet{
    constructor(org, assignValue, doFunc = defaultAssign, undoFunc = defaultUndo){
        this.orgValue = org;
        this.assignValue = assignValue
        this.undoFunc = undoFunc;
        this.doFunc = doFunc;
        this.execute();
    }

    execute(){
        this.doFunc(this.org,this.assignValue);
    }
        
    undo(){
        this.undoFunc(this.org,this.assignValue);
    }
}


export default InverseSet;