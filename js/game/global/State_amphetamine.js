// data2/System/states/SOURCE/images/st_amphetamine.png
/**@class Status amphetamine  */
class _State_amphetamine extends _StateBase {
    /** verify context ou on peut infliger hunger? 
     * @param {_StateBase} from
     * @param {_battler} source
     * @param {_battler} target
    */
    constructor(source,target) {
        super(source,target,"*");
        this.name = 'amphetamine';
    }
    /** Obtien la value du state , celon context
     * @param {_TrackingStates} from provenance du tracking
     * @returns {number}  */
    getValueContext(from){
        switch (from.current.constructor) {
            case _State_hunger: return void 0; break; // anilation
            default: throw 'ERROR, VALUE CONTEXT INCONU' ;break;
        }
    }
    /**
     * @param {_TrackingStates} from provenance du tracking
     * @returns {OPERATOR}  */
    getOperatorContext(from){
        switch (from.current.constructor) {
            case _State_hunger: return '*'; break;
            default: throw 'ERROR OPERATEUR CONTEXT INCONNU' ;break;
        }
    }
    /** return la list des influenceur max hp */
    getInfluer(){
        const influers = [
            
        ].flat().remove();
        return influers;
    }

    /** return une desciption selon le contextID */
    getDescriptions(from,contextID=this._contextId,source=this.source,target=this.target){
        switch (from?.current.constructor) {
            case _State_hunger: return `(${this.name}): Anille les effect de (${from.current.name}).`;break;
            default: return `(${this.name}):`;break;
        }
    }
}