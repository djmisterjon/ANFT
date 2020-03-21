// data2/System/states/SOURCE/images/st_expl.png
/**@class indicateur de vitaliter du battler */
class _State_expl extends _StateBase {
    /**@param {_battler} source */
    constructor(source,target) {
        super(source,target,'+');
        this.name = 'expl';
    }

    /** return la list des influenceur max hp */
    getInfluer(){
        const influers = [
        ].flat().remove();
        return influers;
    }
}