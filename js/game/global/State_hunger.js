// data2/System/states/SOURCE/images/st_hunger.png
/**@class Status de famine, reduit MaxHp */
class _State_hunger extends _StateBase {
    constructor(source,target) {
        super(source,target,-0.5,"*");
        this.name = 'hunger';
    }

    /** return la list des influenceur max hp */
    getInfluer(){
        const influers = [
            //this.source.status.hunger,
        ].remove();
        return influers;
    }
}