// data2/System/states/SOURCE/images/st_def.png
/**@class indicateur de vitaliter du battler */
class _State_def extends _StateBase {
    /**@param {_battler} source */
    constructor(source) {
        super(source,null,null);
        this.name = 'def';
    }
    /** return la list des influenceur max hp */
    getInfluer(){
        const influers = [
            this.source.status.hunger,
        ].remove();
        return influers;
    }
}