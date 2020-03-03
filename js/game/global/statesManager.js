/**Le states math manager permet de creer asigner distribruer les states qui permet des calcule math selon leur source et target
*/

class _statesManager {
    constructor() {
        /** current updateId */
        this._updateId = 0;
        /** last update, lorsque obsolete, doit etre egal au current */
        this.__updateId = 0;
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
