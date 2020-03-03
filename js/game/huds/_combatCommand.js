/** Les instances de combat Command */
class _CombatCommands extends PIXI.Container{
    static MIN_WIDTH = 220;
    constructor(command) {
        super();
        /** si la command est sur selected */
        this._selected = false;
        /** Indicateur command pour $systems.BATTLECOMMAND*/
        this._commandName = command;
        /** @type {{ 'TxtCommand':PIXI.Text, 'BgSelect':PIXI.Sprite, }} */
        this.child = null;
        this.initialize();
    }
    /** renvoi le nom du goup auquel appartien la command */
    get groupName(){
        return this.parent.name;
    }
    /** return le parent qui a creer goupCommand=>command */
    get BattlersCommands() {
        return $gui.BattlersCommands;
    }
    /**@returns {_CommandGroups} - le commandGroup appartenant cette command*/
    get CommandGroup(){
        // @ts-ignore
        return this.parent;
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
        const TxtCommand = new PIXI.Text(this._commandName.toUpperCase(),style).setName('TxtCommand');
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
        !this._selected && gsap.to(this.child.BgSelect, {alpha:0.2});
        this.BattlersCommands.onOverCommand(this);
    }
    pointerout_command(e){
        !this._selected && gsap.to(this.child.BgSelect, 0.6,{alpha:0});
        this.BattlersCommands.onOutCommand(this);
    }
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerup_command(e){
        gsap.fromTo(this.child.TxtCommand.scale, 0.2,{x:0.9},{x:1});
        this.BattlersCommands.onSelectCommand(this);
    }
    //#endregion
    //#region [Method]
    select(value){
        this._selected = value;
        value?gsap.to(this.child.BgSelect, 0.4,{alpha:0.6}):gsap.to(this.child.BgSelect, 0.4,{alpha:0})
    }

    //#endregion

};