
// data2/System/states/SOURCE/images/st_hp.png
/**@class indicateur de vitaliter du battler */
class _State_hp extends _StateBase {
    /**@param {_battler|_StateBase} source */
    constructor(source,target) {
        super(source,target,'+');
        this.name = 'hp';
    }
    add(value){
        this.source._currentHP = (this.source._currentHP+value).clamp(0, this.source.HP);
        this.update(true);
    }

    /** list des influenceur connecter a ce state */
    getInfluer(){
        const influers = [
            $statesManager.getStatesTarget(_State_hunger, this.source),
        ].flat().remove();
        return influers;
    }
}