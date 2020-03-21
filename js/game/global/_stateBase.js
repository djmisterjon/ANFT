/**
 *
 *
 * @class _StateBase
 * @extends {_StateSprite}
 */
class _StateBase extends _StateSprite{
    //#region [Static]
    //#endregion

    /**
     * @param {_battler} source - Source player | monster
     * @param {_battler} target - target player | monster
     * @param {number} value - passer une valeur static seulment pour les (Status)
     * @param {OPERATOR} operator - passer une valeur static seulment pour les (Status)
    */
    constructor(source,target,operator) {
        super();
        /** source qui a creer le state */
        this.source = source;
        /** la cible que le state affect*/ //todo: pourra eventuelement etre true, pour cibler touslmonde
        this.target = target;
        this._valueCache = null;
        this._operator = operator;
        /** calcul cache effectuer selon updateid du stateManager */
        this._updateId = 0;
        this.Influers =  [];
        /** @type {Array.<_StateBase>} */
        this.Infligers = [];
        /** @type {{ 'AA':, 'BB':, 'CC':, 'DD':, 'EE':, 'FF':, }} */          
        this.child = null;
    }
    //#region [GetterSetter]
    /** return la liste des class Influer attacher au state */
    get INFLUER() {
        return [];
    }
    /** return un operator selon le context */
    get updateNeed(){
        return this._updateId===$statesManager.__updateId;
    }
    get contextId(){//TODO: creer une static ?
        return `${this.name} ${this.source?.constructor.name} ${this.target?.constructor.name}`;
    }
    get POOL (){
        return _statesManager.POOL;
    }
    /**@returns {number} Return soi une valeur math predefenie dans le constructor parent ou la valeur evo de la source */
    get value(){
        return this._value ?? this.source?.getEvoValue(this.name);
    }
    //#endregion

    //#region [Method]
    /** list des influenceur connecter a ce state */
    getInfluer(){
        return [];
    }
    getInfliger(){
        return [];
    }
    /** chance effectif */
    getChance(min,max){
    }
    /**
     * @param {_TrackingStates} from provenance du tracking
     * @returns {OPERATOR}  */
    getOperatorContext(from){
       
    }
    /**
     * @param {_TrackingStates} from provenance du tracking
     * @returns {number}  */
    getValueContext(from){

    }

    /** Calcul une valeur incluant les Influenceur
     * @param {_TrackingStates} from Suivie de tracking pour obtenir une ContextValue
     * @returns {number}
    */
    getReelValue(from){
        const Tracking = new _TrackingStates(this);
        const value = Tracking.computeTracking(from);
        return value;
    }

    /**@returns {number} */
    computeTracking(min,max,TrackingPOOL){ 
        // todo: faire un update qui stock tous les tacking et precalcul les values cache
        //todo: psk aussi les _operator peut etre dinamyque , selon le context
        let value = this.value;//this.value; // start
        TrackingPOOL.sort((a,b)=>b._priority-a._priority).forEach(tracking => {
            TrackingPOOL;
            const a = value//tracking.parent?._value;
            const b = tracking.thats.getReelValue(min,max);
            const l = this.getChance(min,max);
            value=this.operators(tracking._operator, a,b)
        })
        return value;//Math.max(Math.ceil(value),0);
    }

    /** update le states quand un changement est operer
     * On met en cache tous les infliger, et influer
     * Ensuite on preCalcul les reelValue
     * @param {boolean} forceGlobalUpdate - lorsque ont change des state hp,mp,hg...
    */
    update(forceGlobalUpdate){
        if(!this._destroyed){ // si pas deja destroyed par Ingliger ?
            const Influers = this.getInfluer();
            const Infligers = this.getInfliger();
            this.Infligers.forEach(Infliger => {
                // clear les infligers qui ne sont plus actif
                if(!Infligers.contains(Infliger)){
                    Infliger.Destroy();
                }
            });
            this.Influers = Influers;
            this.Infligers = Infligers;
        }
        if(forceGlobalUpdate){
            $statesManager._updateBuffer.push(this.contextId);
        }
    }
    
    /** supprime les ref */
    Destroy(){
        this._destroyed = true;
        delete $statesManager.POOL[this.contextId];
        this.source = null;
        this.target = null;
        gsap.to(this, 1,{y:"+=20",alpha:0}).eventCallback("onComplete", ()=>this.destroy());
        $statesManager._updateBuffer.push(this.contextId);
    }
    //#endregion

}