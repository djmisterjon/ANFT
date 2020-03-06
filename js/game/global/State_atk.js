// data2/System/states/SOURCE/images/st_atk.png
/**@class indicateur de vitaliter du battler */
class _State_atk extends _StateBase {
    /**@param {_battler} source */
    constructor(source,target) {
        super(source,target,null,null);
        this.name = 'atk';
    }

    /** return la list des influenceur max hp */
    getInfluer(){
        const influers = [
            this.source.status.deshydrate,
            this.target?.states.def,
        ].remove();
        return influers;
    }
}