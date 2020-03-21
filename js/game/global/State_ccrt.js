// data2/System/states/SOURCE/images/st_ccrt.png
/**@class Status chance des coup critique  */
class _State_ccrt extends _StateBase {
    /** verify context ou on peut infliger hunger? 
     * @param {_StateBase} from
     * @param {_battler} source
     * @param {_battler} target
    */
    static INFLIGE(from){

    }
    /** extract tous les influenceur selon context 
     * @param {_StateBase} from
    */
    static INFLUER(from){

    }
    constructor(source,target) {
        super(source,target,"*");
        this.name = 'ccrt';
    }

    /** return la list des influenceur max hp */
    getInfluer(){
        const influers = [
            
        ].flat().remove();
        return influers;
    }

    /** return une desciption selon le contextID */
    getDescriptions(from,contextID=this._contextId,source=this.source,target=this.target){
       
    }
}