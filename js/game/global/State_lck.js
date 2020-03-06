// data2/System/states/SOURCE/images/st_lck.png
/**@class indicateur de vitaliter du battler */
class _State_lck extends _StateBase {
    /**@param {_battler} source */
    constructor(source,target) {
        super(source,target,null,null);
        this.name = 'lck';
    }

    /** return la list des influenceur max hp */
    getInfluer(){
        const influers = [
        ].remove();
        return influers;
    }
}