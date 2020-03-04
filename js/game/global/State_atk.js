// data2/System/states/SOURCE/images/st_atk.png
/**@class indicateur de vitaliter du battler */
class _State_atk extends _StateBase {
    /**@param {_battler} source */
    constructor(source) {
        super(source,null,null);
        this.name = 'atk';
    }

    /** return la list des influenceur max hp */
    getInfluer(){
        const influers = [
            this.source.status.deshydrate,
        ].remove();
        return influers;
    }
}