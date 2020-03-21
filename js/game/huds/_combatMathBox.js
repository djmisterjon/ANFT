/** class qui manage les states formula de commands */
class _CombatMathBox extends PIXI.Container {
    /**@param {number} sourceId - la source qui apelle les commands
     * @param {number} targetId - le target commands
     * @param {Array.<number>} boosters - les boosters commands
    */
    constructor(source,target,actionType,boosters) {
        super();
        this.source = source;
        this.target = target;
        this._boosters = boosters;
        this._actionType = actionType;
        this.stateFormula = null;
        /** @type {{ 'BG':PIXI.Sprite, 'TxtDmg':PIXI.Text, 'CC':, 'DD':, 'EE':, 'FF':, }} */
        this.child = null;
        this.initialize();
    }
    //#region [GetterSetter]

    //#endregion

    //#region [Initialize]
    initialize() {
        this.initialize_base();
        this.initialize_states();
        this.child = this.childrenToName()
        this.compute()
        this.show()
        //this.initialize_interactions()
        //this.child = this.childrenToName()
    }
    initialize_base(){
        const BG = new PIXI.Sprite($app.renderer.generateTexture(
            new PIXI.Graphics().beginFill(0x212121).drawRoundedRect(0, 0, 2, 50,10).endFill()
        )).setName('BG')
        BG.anchor.set(0,0.5);
        BG.parentGroup = $displayGroup.DiffuseGroup;
        const TxtDmg = new PIXI.Text('999',{ fill: "white", fontFamily: "Comic Sans MS", fontSize: 24, fontWeight: "bolder" } ).setName('TxtDmg');
        TxtDmg.anchor.set(0,0.5)
        this.addChild(BG,TxtDmg);
    }

    /** update les states,math dans le frame */
    initialize_states(){
        //!Action
        // ont creer la formule selon le actionType: atk,def,magic...
        const stateFormula = this.stateFormula = $statesManager.createStatesForumla(
            this.source, this.target, this._actionType, this._boosters
            );
        Object.values(stateFormula).forEach((State,i) => {
            State.position.x = 45*i;
            this.addChild(State);
        });
    }
    //#endregion
    //#region [Method]
    /** positionne et affiche  */
    show(){
        const TxtDmg = this.child.TxtDmg
        const BG = this.child.BG;
        const width = this.width;
        TxtDmg.x = width;
        BG.width = width+TxtDmg.width;

    }
    compute(){
        const TxtDmg = this.child.TxtDmg
        const value = this.getMinValue();
        TxtDmg.text = `~${value}`
    }
    /** obtien le resulta minimal de la formule */
    getMinValue(){
        const base = this.stateFormula.base.getReelValue();
        return base;
    }
    /** obtien le resulta maximal de la formule */
    getMaxValue(){

    }
    //#endregion
};