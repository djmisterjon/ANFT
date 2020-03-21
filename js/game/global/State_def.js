// data2/System/states/SOURCE/images/st_def.png
/**@class indicateur de vitaliter du battler */
class _State_def extends _StateBase {
    /**@param {_battler} source */
    constructor(source,target) {
        super(source,target,"-");
        this.name = 'def';
    }


    /** return la desciptions */
    //TODO: RENDU ICI, DEF A 50% CHANCE DE BLOKER
    getDescriptions(from){
        if(from===this){
            return `${this.name}): Chance de bloquer et reduire les dammage physic de 50%\n Reduit les dammages spontaner des events`;
        }
        if(from.constructor===_State_atk){
            //TODO: PEUT ETRE ALLER CHERCHE AUSI LES INFLUGER SUB DESCRIPTIONS, FACILE
            return `(${this.source.name})(${this.name}): a (${from.target.DEF/10})% chance de bloquer (${from.name}):`;
        }
    }
}