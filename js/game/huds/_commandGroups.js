/** class de Regroupement d'une  list de commands _CombatCommands */
class _CommandGroups extends PIXI.Container{
    /**@param {Array.<String>} commandList list des commands */
    constructor(commandList,title,allowMultiCommand=false) {
        super();
        this._title = title;
        /** @type {Array.<_CombatCommands>} */
        this.commandSelected = [];
        /** permet les choix de command multiple */
        this._allowMultiCommand = allowMultiCommand;
        this.commandList = commandList;
        /** @type {{ 'TxtCommand':Array.<_CombatCommands>, 'ActivePointSelect':PIXI.Sprite, 'CC':, 'DD':, 'EE':, 'FF':, }} */
        this.child = null;
        this.initialize();
    }

    get BattlersCommands() {
        return $gui.BattlersCommands;
    }
    get haveCommands() {
        return !!this.commandSelected.length
    }
    //#region [Initialize]
    initialize() {
        this.initialize_base()
        this.initialize_commands()
        this.child = this.childrenToName();
        this.initialize_interactions()
        //this.child = this.childrenToName()
    }
        
    initialize_base() {
        //! background
        const Bg = new PIXI.Sprite(PIXI.Texture.WHITE).setName('Bg');
            [Bg.width,Bg.height] = [220,this.commandList.length*34];
            Bg.tint = 0x212121;
        //! background Select txt
        const ActivePointSelect = new PIXI.Sprite(PIXI.Texture.WHITE).setName('ActivePointSelect');
            ActivePointSelect.tint = 0xffffff;
            ActivePointSelect.alpha = 0.3;
            ActivePointSelect.pivot.set(14,-10)
        //!title group
        const style =  { fill: "white", fontFamily: "Comic Sans MS", fontSize: 16, fontWeight: "bolder" } //style
        const TxtTitle = new PIXI.Text(this._title.toUpperCase(),style).setName('TxtTitle');
            TxtTitle.anchor.set(0,1);
        this.addChild(Bg,ActivePointSelect,TxtTitle);
    }
    /** init les commands de ce groups */
    initialize_commands(){
        const Commands = [];
        for (let i=0, l=this.commandList.length; i<l; i++) {
            const commandName = this.commandList[i];
            const TxtCommand = new _CombatCommands(commandName,this).setName('TxtCommand');
            TxtCommand.y = i*34;
            Commands.push(TxtCommand);
        };
        this.addChild(...Commands);
    }
    
    initialize_interactions() {
        this.child.TxtCommand.forEach(TxtCommand => {
            TxtCommand.on('pointerover' , this.pointerover_commandGroup , this);
        })
    };
    //#endregion
    
    //#region [Interactive]
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerover_commandGroup(e){
        const currentTarget = e.currentTarget;
        const ActivePointSelect = this.child.ActivePointSelect;
        gsap.to(ActivePointSelect.position, {y:currentTarget.y});
    }

    //#endregion
    //#region [Method]
    /** disable le groups, lorsque focus un autre group */
    disable(){
        this.renderable = false;
        this.interactiveChildren = false;
        this.alpha = 0.5;
    }
    enable(){
        this.renderable = true;
        this.interactiveChildren = true;
        this.alpha = 1;
    }

    updateCommand(Commands){
        const wasIn = this.commandSelected.contains(Commands);
        if(!this._allowMultiCommand){
            this.commandSelected.forEach(cmd => {
                cmd.select(false);
            })
            this.commandSelected.clear();
        }
        if(!wasIn){
            this.commandSelected.push(Commands);
            Commands.select(true);
        }else{
            this.commandSelected.remove(Commands)
            Commands.select(false); 
        }
        this.BattlersCommands.updateGroup();
    }
    //#endregion

};