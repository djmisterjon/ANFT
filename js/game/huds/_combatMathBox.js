/** class qui manage les huds de combat selection en combat */
class _CombatMathBox extends PIXI.Container {
    /**@param {number} sourceId - la source qui apelle les commands
     * @param {number} targetId - le target commands
     * @param {Array.<number>} boosters - les boosters commands
    */
    constructor(sourceId,targetId,boosters) {
        super();
        this._sourceId = sourceId;
        this._targetId = targetId;
        this.boosters = boosters;
        this.child = null;
        this.initialize();
    }
    //#region [GetterSetter]

    //#endregion

    //#region [Initialize]
    initialize() {
        this.initialize_base();
        this.initialize_states();
        //this.initialize_interactions()
        //this.child = this.childrenToName()
    }
    initialize_base(){
        const bg = new PIXI.Graphics().beginFill(0x212121).drawRoundedRect(0, 0, 400, 200,10).endFill();
        const TxtDmg = new PIXI.Text('999');
        this.addChild(bg,TxtDmg);
    }

    /** update les states,math dans le frame */
    initialize_states(){
        //!Action
        // ont creer la formule selon le actionType: atk,def,magic...
        const stateFormula = $statesManager.createStatesForumla (combatAction,sourceId, targetId);
      
    }
    //#endregion
    
};