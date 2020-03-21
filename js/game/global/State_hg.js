// data2/System/states/SOURCE/images/st_hg.png
/**@class indicateur de vitaliter du battler */
class _State_hg extends _StateBase {
    /**@param {_battler} source */
    constructor(source,target) {
        super(source,target,'+');
        this.name = 'hg';
    }
    add(value=0){
        this.source._currentHG = (this.source._currentHG+value).clamp(0, this.source.HG);
        this.update(true);
    }

    getInfliger(){
        const Infligers = [
            _State_hunger.INFLIGE(this),
        ].remove();
        return Infligers;
    }
}