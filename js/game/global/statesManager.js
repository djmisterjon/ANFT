

/**Le states math manager permet de creer asigner distribruer les states qui permet des calcule math selon leur source et target */
class _statesManager {
    /** @type {Object.<string, _StateBase>} */
    static POOL = {}
    constructor() {
        /** @type {Array.<string>} - contien le nom des states qui apelle a un nouveau update */
        this._updateBuffer = []
    }
    get POOL() {
        return _statesManager.POOL;
    }
    /** creer un states 
     * @param stateName {String|typeof _StateBase} - Nom de la class State, string ou class permit
     * @param source {_battler|_StateBase} - ID de la source battler
     * @param target {_battler|_StateBase} - ID du target battler
    */
    create(stateName,source,target){
        if(stateName.name){// si on passe une class State, on va chercher son nom
            stateName = stateName.name.split('_State_')[1];
        }
        const contextId = `${stateName} ${source?.constructor.name} ${target?.constructor.name}`;
        let State = this.getState(contextId);
        if(State){ // si le contextId existe deja , ont creer pas mais return
            return State;
        }else{
            switch (stateName) {
                case 'hp'   : State = new _State_hp  (source,target) ; break; //data2\System\states\SOURCE\images\st_hp.png
                case 'mp'   : State = new _State_mp  (source,target) ; break; //data2\System\states\SOURCE\images\st_mp.png
                case 'hg'   : State = new _State_hg  (source,target) ; break; //data2\System\states\SOURCE\images\st_hg.png
                case 'hy'   : State = new _State_hy  (source,target) ; break; //data2\System\states\SOURCE\images\st_hy.png
                case 'atk'  : State = new _State_atk (source,target) ; break; //data2\System\states\SOURCE\images\st_atk.png
                case 'def'  : State = new _State_def (source,target) ; break; //data2\System\states\SOURCE\images\st_def.png
                case 'sta'  : State = new _State_sta (source,target) ; break; //data2\System\states\SOURCE\images\st_sta.png
                case 'lck'  : State = new _State_lck (source,target) ; break; //data2\System\states\SOURCE\images\st_lck.png
                case 'int'  : State = new _State_int (source,target) ; break; //data2\System\states\SOURCE\images\st_int.png
                case 'expl' : State = new _State_expl(source,target) ; break; //data2\System\states\SOURCE\images\st_expl.png
                case 'mor'  : State = new _State_mor (source,target) ; break; //data2\System\states\SOURCE\images\st_mor.png
    
                case 'hunger': State = new _State_hunger(source,target); break; //data2\System\states\SOURCE\images\st_hunger.png
                case 'amphetamine': State = new _State_amphetamine(source,target); break; //data2\System\states\SOURCE\images\st_amphetamine.png
                default: throw `FATAL Error ${stateName} class not exist!`; break;
            }
            this.POOL[contextId] = State;
            this._updateBuffer.push(contextId);
            return State;
        }
    }

    /** @returns {_StateBase} Return un state du pool*/
    getState(contextId){
        return this.POOL[contextId];
    };

    /** verify les INFLIGERSLIST invok summon list des states appliquer selon certain context global, lorsque des changement on operer */
    update(){
        // Experimental, car plus simpel a debug, ont peut voir les state qui ont apeller le update
        if(this._updateBuffer.length){
            for (let i=0, States = Object.values(this.POOL), l=States.length; i<l; i++) {
                const State = States[i];
                State.update();
            };
            this._updateBuffer.clear();
            //$players.updateStates();// todo: update des status, player aura getter de status lier a PoolStates ?
            $gui.States.update(); // todo: add un arg pour isoler et cibler un state
        }
    }
    
    /** creer une formule states  pour un target selon les commands
     * @param {"attack"| "defense"| "cBook"| "move"| "asimilation"| "identification"} actionType
    */
    createStatesForumla(source, target, actionType, boosters){
        const stateName = $systems.BATTLECOMMAND[actionType].sIcon;
        const base = this.create(stateName,source,target);
        base.getReelValue();
        return {base}
    }

    /**
     * Extrai tous les states qui existe de la meme CLASS et cible
     * @param {typeof _StateBase} ClassState - Class de la state a comparer
     * @param {_battler|_StateBase} target - target affectation //todo: target peut etre true pour global ? example un status de jeux
     * @returns {Array.<_StateBase>} List des states*/
    getStatesTarget(ClassState,target){
        return Object.values(this.POOL).filter(State => {
            return (State.constructor === ClassState  && State.target===target);
        })
    }
}


let $statesManager = new _statesManager();
console.log1('$statesManager', $statesManager);
