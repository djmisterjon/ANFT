// data2/System/states/SOURCE/images/st_hg.png
/**@class indicateur de vitaliter du battler */
class _State_hg extends _StateBase {
    /**@param {_battler} source */
    constructor(source) {
        super(source,null,null);
        this.name = 'hg';
    }
    /** return la list des influenceur max hp */
    getInfluer(){
        const influers = [
        ].remove();
        return influers;
    }
}