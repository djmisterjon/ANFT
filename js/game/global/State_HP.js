
// data2/System/states/SOURCE/images/st_hp.png
/**@class indicateur de vitaliter du battler */
class _State_hp extends _StateBase {
    /**@param {_battler} source */
    constructor(source,target) {
        super(source,target,null,null);
        this.name = 'hp';
    }

    /** return la list des influenceur max hp */
    getInfluer(){
        const influers = [
            this.source.status.hunger,
        ].remove();
        return influers;
    }
}