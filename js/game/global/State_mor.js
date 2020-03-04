// data2/System/states/SOURCE/images/st_mor.png
/**@class indicateur de vitaliter du battler */
class _State_mor extends _StateBase {
    /**@param {_battler} source */
    constructor(source) {
        super(source,null,null);
        this.name = 'mor';
    }
    /** return la list des influenceur max hp */
    getInfluer(){
        const influers = [
            this.source.status.hunger,
            this.source.status.deshydrate,
        ].remove();
        return influers;
    }
}