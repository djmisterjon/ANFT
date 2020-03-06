// data2/System/states/SOURCE/images/st_mp.png
/**@class indicateur de vitaliter du battler */

class _State_mp extends _StateBase {
    /**@param {_battler} source */
    constructor(source,target) {
        super(source,target,null,null);
        this.name = 'mp';
    }
    /** return la list des influenceur max hp */
    getInfluer(){
        const influers = [
            this.source.status.deshydrate,
        ].remove();
        return influers;
    }
}