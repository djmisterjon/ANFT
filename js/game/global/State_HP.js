// data2/System/states/SOURCE/images/st_hp.png
/**@class indicateur de vitaliter du battler */
class _State_hp extends _StateBase {
    constructor(sourceId,targetId,contextId) {
        super(sourceId,targetId,contextId);
    };
    /** list optimiser des states Influers qui peuve affecter ce states */
    static get getInfluersClass() {return []}
    /** @param from {_statesManager._StateBase} - Le state Parent, @param Boosters {_statesManager._StateBase} - Les items */
    static checkInfluersContext(from,Boosters){
        
    };
    /** return la desciptions */
    descriptions(from,contextID=this._contextId,source=this.source,target=this.target){
        switch (contextID) { //TODO: UTILISE LES LA CLASS $TEXTS
            case 1: break;
            default : return `(${this.name}): Indicateur de survie. Lorsque a 0, provoque une mort temporaire et cout des ressources`; break;
        };
    }
}