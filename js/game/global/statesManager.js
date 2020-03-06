

/**Le states math manager permet de creer asigner distribruer les states qui permet des calcule math selon leur source et target */
class _statesManager {
    static POOL = {}
    constructor() {
        /** current updateId */
        this._updateId = 0;
        /** last update, lorsque obsolete, doit etre egal au current */
        this.__updateId = 0;
    }

    /** creer un states 
     * @param stateName {String} - Nom de la class State
     * @param source {_battler} - ID de la source battler
     * @param target {_battler} - ID du target battler
    */
    create(stateName,source,target){
        let State;
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

            case 'hunger'  : State= new _State_hunger (source) ; break; //data2\System\states\SOURCE\images\st_mor.png
            default: throw `FATAL Error ${stateName} class not exist!`; break;
        }
        _statesManager.POOL[State._contextId] = State;
        return State;
    }

    /** @returns {_statesManager._StateBase } Return un state du pool*/
    getState(contextId){
        return _statesManager.POOL[contextId];
    };

    /** verify les INFLIGERSLIST invok summon list des states appliquer selon certain context global, lorsque des changement on operer */
    update(){
        if(this.__updateId!==this._updateId){
            this.__updateId = this._updateId; // doi ateindre __updateId;
            for (let i=0,contextId = Object.keys(this.PoolStates), l=contextId.length; i<l; i++) {
                const context = this.PoolStates[contextId[i]];
                context.update(this._updateId);
            };
            $players.updateStates();// todo: update des status, player aura getter de status lier a PoolStates ?
            $gui.States && $gui.States.refresh(); // todo: add un arg pour isoler et cibler un state
        };
    }
    /** creer une formule states  pour un target selon les commands
     * @param {"attack"| "defense"| "cBook"| "move"| "asimilation"| "identification"} actionType
    */
    createStatesForumla(source, target, actionType, boosters){
        const stateName = $systems.BATTLECOMMAND[actionType].sIcon;
        const a = this.create(stateName,source,target);
        const test = a.getReelValue();
        console.log('test: ', test);
    }
}


let $statesManager = new _statesManager();
console.log1('$statesManager', $statesManager);
