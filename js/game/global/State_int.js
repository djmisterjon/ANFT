// data2/System/states/SOURCE/images/st_int.png
/**@class indicateur de vitaliter du battler */
class _State_int extends _StateBase {
    /**@param {_battler} source */
    constructor(source,target) {
        super(source,target,null,null);
        this.name = 'int';
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