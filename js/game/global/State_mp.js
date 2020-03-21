// data2/System/states/SOURCE/images/st_mp.png
/**@class indicateur de vitaliter du battler */

class _State_mp extends _StateBase {
    /**@param {_battler} source */
    constructor(source,target) {
        super(source,target,'+');
        this.name = 'mp';
    }
    add(value){
        this.source._currentMP = (this.source._currentMP+value).clamp(0, this.source.MP);
        this.update(true);
    }
}