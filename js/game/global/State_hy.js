// data2/System/states/SOURCE/images/st_hy.png
/**@class indicateur de vitaliter du battler */
class _State_hy extends _StateBase {
    /**@param {_battler} source */
    constructor(source,target) {
        super(source,target,'+');
        this.name = 'hy';
    }
    add(value){
        this.source._currentHY = (this.source._currentHY+value).clamp(0, this.source.HY);
        this.update(true);
    }
}