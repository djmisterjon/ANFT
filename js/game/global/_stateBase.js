/** Base dun state */
class _StateBase extends _StateSprite{
    //#region [Static]
    /** Stock les Tracking values */ 
    static BUFFER = [];//todo: voir si ca peut fucker, si ont utilise un compute multicore cpu ascyn, pour + de perf
    //#endregion

    /**
     * @param {_battler} source - Source player | monster
     * @param {_battler} target - target player | monster
     * @param {number} value - passer une valeur static seulment pour les (Status)
     * @param {OPERATOR} operator - passer une valeur static seulment pour les (Status)
     * 
    */
    constructor(source,target,value,operator) {
        super();
        this.source = source;
        this.target = target;
        this._value = value;
        this._operator = operator;
        this._contextId = `${this.name}_${source.constructor.name}`;   
        /** @type {{ 'AA':, 'BB':, 'CC':, 'DD':, 'EE':, 'FF':, }} */          
        this.child = null;
    }
    //#region [GetterSetter]
    get BUFFER (){
        return _StateBase.BUFFER
    }
    /**@returns {number} Return soi une valeur predefenie dans la superClass ou la valeur evo de la source */
    get value(){
        return this._value ?? this.source.getEvoValue(this.name);
    }
    //#endregion


    //#region [Method]
    /** 
     * @typedef {"+"|"-"|"*"|"/"} OPERATOR - list dynamic math computing operator
     * @param {OPERATOR} sign
    */
    operators(sign,a,b){
        switch (sign) {
            case '+':return a + b ;break;
            case '-':return a - b ;break;
            case '*':return a * b ;break;
            default:return 0;break;
        }
    };
    /** return un tracking values pour les math */
    getTrackingValues(parent,priority) {
        if(!this.value){throw 'Error, aucun value asigner TODO:'}
        return {
            parent:parent,
            _priority:priority, // sort reverse
            _name:this.name,
            _value:this.value,
            _operator:this._operator,
            Influer:[]
        }
    }
    /** Calcul une valeur incluant les Influenceur 
     * @returns {number}
    */
    getReelValue(parent=null,priority=-1){
        let value = this.getTrackingValues(parent,++priority);
        !parent && this.BUFFER.clear();
        this.BUFFER.push(value);
        // valeur evo + influers
        this.getInfluer().forEach(state => {
            value.Influer.push(state.getReelValue(this,priority))
        })
        if(!parent){ // calcul en reverse et pour donner une valeur influencer
           return this.computeTracking(this.BUFFER.sort((a,b)=>b._priority-a._priority));
        }
        return value;
    }

    
    /**@returns {number} */
    computeTracking(ReverseBuffer){ // todo: reverse, et ajouter le parent, pour permet els pourcentage sur parent
        let value = this.value; // start
        ReverseBuffer.forEach(tracking => {
            if(tracking.parent){
                value+=this.operators(tracking._operator, tracking.parent.value, tracking.value)
            }
        });
        return Math.abs(Math.ceil(value));
    }
    //#endregion

}
        