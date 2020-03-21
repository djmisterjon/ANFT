// data2/System/states/SOURCE/images/st_atk.png
/**@class indicateur de vitaliter du battler */
class _State_atk extends _StateBase {
    /**@param {_battler} source */
    constructor(source,target) {
        super(source,target,'+');
        this.name = 'atk';
    }

    /** return la list des influenceur max hp */
    getInfluer(){
        const influers = [
            $statesManager.getStatesTarget(_State_hunger, this.source),
        ].flat().remove();
        return influers;
    }

    /** return la desciptions selon contextID */
    getDescriptions(from){
        switch (from?.current.constructor) {
            default: return `(${this.name}): Degat physic de base (${this.source.atk}):`;break;
        }
        if(from===this){
            return `(${this.name}): Affect les dammage physic de base\nAugmente votre limite a porter des objets lourd`;
        }
        if(target){
            return `(${this.name}): Inflige des degat physic de (${source.atk}):`;// ont peut utiliser ATK, car ce base sur la source sans target, donc la propagation est lier au source
        }
    }
}