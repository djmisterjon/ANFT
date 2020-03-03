/**Le states math manager permet de creer asigner distribruer les states qui permet des calcule math selon leur source et target
*/

class _statesManager {
    constructor() {
        /** current updateId */
        this._updateId = 0;
        /** last update, lorsque obsolete, doit etre egal au current */
        this.__updateId = 0;
    }
    getClass(stateName){
        switch (stateName) {
            case 'hp'   : return _State_hp   ; break; //data2\System\states\SOURCE\images\st_hp.png
            case 'mp'   : return _State_mp   ; break; //data2\System\states\SOURCE\images\st_mp.png
            case 'hg'   : return _State_hg   ; break; //data2\System\states\SOURCE\images\st_hg.png
            case 'hy'   : return _State_hy   ; break; //data2\System\states\SOURCE\images\st_hy.png
            case 'atk'  : return _State_atk  ; break; //data2\System\states\SOURCE\images\st_atk.png
            case 'def'  : return _State_def  ; break; //data2\System\states\SOURCE\images\st_def.png
            case 'sta'  : return _State_sta  ; break; //data2\System\states\SOURCE\images\st_sta.png
            case 'lck'  : return _State_lck  ; break; //data2\System\states\SOURCE\images\st_lck.png
            case 'int'  : return _State_int  ; break; //data2\System\states\SOURCE\images\st_int.png
            case 'expl' : return _State_expl ; break; //data2\System\states\SOURCE\images\st_expl.png
            case 'mor'  : return _State_mor  ; break; //data2\System\states\SOURCE\images\st_mor.png
            default: throw `FATAL Error ${stateName} class not exist!`; break;
        }


    }
    /** creer un states 
     * @param stateName {String} - Nom de la class State
     * @param sourceId {Number} - ID de la source battler
     * @return {_statesManager._StateSetting} - Le state dans le POOL
    */
    create(stateName,sourceId){
        const State = new _statesManager[type](sourceId,targetId,parentId,options);
        this.addToPool(State);
    }

    /** verify les INFLIGERSLIST invok summon list des states appliquer selon certain context global, lorsque des changement on operer */
    update(){
        if(this.__updateId!==this._updateId){
            console.log('this.__updateId: ', this.__updateId,this._updateId);
            this.__updateId = this._updateId; // doi ateindre __updateId;
            for (let i=0,contextId = Object.keys(this.PoolStates), l=contextId.length; i<l; i++) {
                const context = this.PoolStates[contextId[i]];
                context.update(this._updateId);
            };
            $players.updateStates();// todo: update des status, player aura getter de status lier a PoolStates ?
            $gui.States && $gui.States.refresh(); // todo: add un arg pour isoler et cibler un state
        };
    }

}


let $statesManager = new _statesManager();
console.log1('$statesManager', $statesManager);
