/** Les instances de combat Command */
class _CombatCommands extends PIXI.Container{
    static MIN_WIDTH = 220;
    constructor(command) {
        super();
        /** Indicateur command pour $systems.BATTLECOMMAND*/
        this._command = command;
        /** @type {{ 'TxtCommand':PIXI.Text, 'BgSelect':PIXI.Sprite, }} */
        this.child = null;
        this.initialize();
    }
    /** return le parent qui a creer goupCommand=>command */
    get BattlersCommands() {
        return $gui.BattlersCommands;
    }
    //#region [Initialize]
    initialize() {
        this.initialize_base()
        this.child = this.childrenToName();
        this.initialize_interactions()
        //this.child = this.childrenToName()
    }
        
    initialize_base() {
        const style =  { fill: "white", fontFamily: "Comic Sans MS", fontSize: 22, fontWeight: "bolder" } //style
        const TxtCommand = new PIXI.Text(this._command.toUpperCase(),style).setName('TxtCommand');
        const BgSelect = new PIXI.Sprite(PIXI.Texture.WHITE).setName('BgSelect');
        BgSelect.alpha = 0;
        BgSelect.width = 220;
        BgSelect.height = TxtCommand.height;
        this.addChild(BgSelect,TxtCommand);
    }
    initialize_interactions() {
        this.interactive = true;
        this.on('pointerover' , this.pointerover_command , this);
        this.on('pointerout'  , this.pointerout_command  , this);
        this.on('pointerup'   , this.pointerup_command   , this);
    };
    //#endregion
    
    //#region [Interactive]
    pointerover_command(e){
        gsap.to(this.child.BgSelect, {alpha:0.2});
        this.previewCommand();
    }
    pointerout_command(e){
        gsap.to(this.child.BgSelect, 0.6,{alpha:0})
    }
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerup_command(e){
        this.BattlersCommands.addCommand(this._command);
    }
    //#endregion
    //#region [Method]
    show(){

    }
    /** execute event selon le type de command */
    previewCommand(){
        if(this.parent.name === 'commandGroup_Actions'){
            $gui.Travel.swapActiveCommand(this._command);
        }
        if(this.parent.name === 'commandGroup_Battlers'){
            _Combats.Active.focusOnBattler(+this._command)
        }
    }

    //#endregion

};