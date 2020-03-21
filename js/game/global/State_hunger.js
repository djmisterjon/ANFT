// data2/System/states/SOURCE/images/st_hunger.png
class _State_hunger extends _StateBase {
    //TODO: POUR CHAQUE COND, CREER ou GET HUNGER CONTEXT
    /** verify context ou on peut infliger hunger? 
     * @param {_StateBase} from
     * @param {_battler} source
     * @param {_battler} target
    */
    static INFLIGE(from){
        if( (from.source._currentHG/from.source.HG)<0.5 ){
            return $statesManager.create(_State_hunger, from, from.source);
        }
    }
    /** extract tous les influenceur selon context 
     * @param {_StateBase} from
    */
    static INFLUER(from){
        // extrai tous les hunger qui target le player ?
        return Object.values(_statesManager.POOL).filter(state=>state.target===from.source)
    }
    constructor(source,target) {
        super(source,target,"*");
        this.name = 'hunger';
        this._value = 0.5;
    }
    /** Obtien la value du state , celon context
     * @param {_TrackingStates} from provenance du tracking
     * @returns {number}  */
    getValueContext(from){
        switch (from.current.constructor) {
            case _State_atk: return 0.5; break;
            case _State_def: return 0.5; break;
            case _State_hp: return 0.1; break;
            default: throw 'ERROR, VALUE CONTEXT INCONU' ;break;
        }
    }
    /**
     * @param {_TrackingStates} from provenance du tracking
     * @returns {OPERATOR}  */
    getOperatorContext(from){
        switch (from.current.constructor) {
            case _State_atk: return '*-'; break;
            case _State_hp: return '*-'; break;
            default: throw 'ERROR OPERATEUR CONTEXT INCONNU' ;break;
        }
    }
    /** return la list des influenceur max hp */
    getInfluer(){
        const influers = [
            $statesManager.getStatesTarget(_State_amphetamine, this.target),
        ].flat().remove();
        return influers;
    }

    /** return une desciption selon le contextID */
    getDescriptions(from,contextID=this._contextId,source=this.source,target=this.target){
        switch (from?.current.constructor) {
            case _State_atk: return `(${this.name}):Reduit (${from.current.name}) de 10%.`;break;
            default: return `(${this.name}):
            Reduit votre atk de 10% au maximum 50% selon la famine<50%
            Reduit votre def de 10% au maximum 50% selon la famine<50%
            Famine peut etre aniler par amphetamine
            `;break;
        }
       
        
        if(from.name==='atk'){
            return `(${this.name}):reduit votre (atk:${from.source.atk}) de (${+this.getValue(from)}) : %rate:${(this.source.hgHG-0.5)*100}}%`; 
        }
        if(from.name==='sta'){
            return `(${this.name}):reduit votre sta:(${from.source.sta}) de (${+this.getValue(from)}) : %rate:${(this.source.hgHG-0.5)*100}}%`; 
        }
        if(from.name==='hg'){
            return `(${this.name}): vous ete en famine vos ressource sont reduite `; 
        }
    }
}