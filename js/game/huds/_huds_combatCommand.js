/** Class des action command pour pendant turn combat */
class _Huds_BattlersCommands extends _Huds_Base {
    constructor() {
        super();
        /** La ou les command choisis par group */
        this.selected_commandGroup_Actions = [];
        /** La ou les command choisis par group */
        this.selected_commandGroup_Battlers = [];
        /** La ou les command choisis par group */
        this.selected_commandGroup_Boosters = [];

        /** width du dernier group de command */
        this._boundX = 0;
        /** @type {_CommandGroups} le group actuelement active pour selecteur*/
        this.ActiveGroup = null;
        /** @type {{ 'commandGroup_Actions':_CommandGroups, commandGroup_Battlers:_CommandGroups, commandGroup_Boosters:_CommandGroups,  
         *'SceneSelector':PIXI.projection.Sprite3d }} */
        this.child = null;
    }
    /** return le tree id progression des choix de command */

    //#region [Initialize]
    initialize() {
        this.initialize_base();
        this.initialize_interactions()
        this.position.setZero(1580,870);
    }
    initialize_base(){
        //!data2\System\Selectors\SOURCE\images\selector_bigCircle.png
        // quand show, addChild vers scene 
        //TODO: revoir, car si plusieur selectors! multi target, ca peut fucker
        const dataBase = $loader.DATA2.Selectors;
        const SceneSelector = new PIXI.projection.Sprite3d(dataBase.textures.selector_bigCircle).setName('SceneSelector');
        SceneSelector.anchor.set(0.5);
        SceneSelector.parentGroup = $displayGroup.DiffuseGroup;
        SceneSelector.euler.x = -Math.PI/2;
        SceneSelector.renderable = false;
        this.addChild(SceneSelector);
    }

    initialize_interactions() {
        
    };
    
    //#endregion
    //#region [Interactive]
    get Battlers(){
        return _Combats.Active.Battlers
    }
    //#endregion
    //#region [Method]
    /** show un list de battlers, initialize leur icons */
    show(){
        $gui.Travel.hide();
        this.showCommand_Actions ();
        this.showCommand_Battlers();
        this.showCommand_Boosters();
        this.child = this.childrenToName();
        $stage.scene.addChild(this.child.SceneSelector);
        this.renderable = true;
        Inspectors.DisplayObj(this.child.SceneSelector)
        this.updateGroup();

    }
    updateGroup(){
       const Group_Actions  = this.child.commandGroup_Actions ;
       const Group_Battlers = this.child.commandGroup_Battlers;
       const Group_Boosters = this.child.commandGroup_Boosters;
       const cmdActions = Group_Actions.commandSelected.length;
       const cmdBattlers = Group_Battlers.commandSelected.length;
       cmdActions ? Group_Battlers.enable():Group_Battlers.disable()
       cmdActions && cmdBattlers? Group_Boosters.enable():Group_Boosters.disable()
    }


    //#endregion
    
    showCommand_Actions(){
        const commands = $systems.BATTLECOMMAND.keys;
        const title = 'Select action';
        const CommandGroups = new _CommandGroups(commands,title).setName('commandGroup_Actions');
        gsap.fromTo(CommandGroups, 0.4,{x:0,alpha:0}, {x:-this._boundX,alpha:1})
        this._boundX+=CommandGroups.width+4;
        this.addChild(CommandGroups);
        CommandGroups.enable();
    }
    showCommand_Battlers(){
        const title = 'Select target';
        const commands = _Combats.Active.Monsters.map(m=>String(m._battlerID));
        const CommandGroups = new _CommandGroups(commands,title).setName('commandGroup_Battlers');
        gsap.fromTo(CommandGroups, 0.4,{x:0,alpha:0}, {x:-this._boundX,alpha:1})
        this._boundX+=CommandGroups.width+4;
        this.addChild(CommandGroups);
        CommandGroups.disable();
    }
    showCommand_Boosters(){
        const title = 'Select boosters';
        const CommandGroups = new _CommandGroups(['item1','item2','item3','item4','item5','item6','item7'],title,true).setName('commandGroup_Boosters');
        gsap.fromTo(CommandGroups, 0.4,{x:0,alpha:0}, {x:-this._boundX,alpha:1})
        this.addChild(CommandGroups);
        this._boundX+=CommandGroups.width+4;
        CommandGroups.disable();
    }

    /** event lorsque over une command 
     * @param {_CombatCommands} Command 
    */
    onOverCommand(Command){
        if(Command.groupName === 'commandGroup_Actions'){
            $gui.Travel.swapActiveCommand(Command._commandName);
        }
        if(Command.groupName === 'commandGroup_Battlers'){
            if(!Command.CommandGroup.haveCommands){
                // si aucune command selected, allow selectorTarget
                this.selectorTarget(+Command._commandName)
            }
        }
        if(Command.groupName === 'commandGroup_Boosters'){
        }
    }

    /** event lorsque out une command 
     * @param {_CombatCommands} Command 
     * 
    */
    onOutCommand(Command){
    }

    /** event lorsque select une command
     * @param {_CombatCommands} Command 
     * 
    */
    onSelectCommand(Command){
        Command.CommandGroup.updateCommand(Command);
        if(Command.groupName === 'commandGroup_Actions'){
        }
        if(Command.groupName === 'commandGroup_Battlers'){
            this.selectorTarget(+Command._commandName,true)
        }
        if(Command.groupName === 'commandGroup_Boosters'){
        }
    }

    /**@param {number} battlerID - le id static du battler dans combat
    /**@param {boolean} select - si provient d'un command select, allow camera focus
    */
    selectorTarget(battlerID,select=false){
        const Battler = this.Battlers[battlerID];
        const SceneSelector = this.child.SceneSelector;
        SceneSelector.renderable = true;
        SceneSelector.position3d.copy(Battler.p.position3d);
        gsap.fromTo(SceneSelector.scale3d, 0.4, {x:0,y:0},{x:0.6,y:0.6, ease:Back.easeOut.config(1.7)})
        gsap.fromTo(SceneSelector.proj.euler, 4, {z:-Math.PI},{z:Math.PI, ease:Linear.easeNone, repeat:-1});
        select && $camera.moveToTarget(Battler,0.2,Power4.easeOut,'combat2');

        const sourceId = _Combats.Active.currentBattlerTurn._battlerID;
        const targetId = battlerID//this.child.commandGroup_Battlers.commandSelected;
        const actionType = this.child.commandGroup_Actions.commandSelected[0]._commandName;
        const boosters = this.child.commandGroup_Boosters.commandSelected;
        if(_Combats.Active){
            const source = _Combats.Active.Battlers[sourceId];
            const target = _Combats.Active.Battlers[targetId];
            
            $gui.BattlersSelectors.showCombatMathBox(source,target,actionType,boosters);
        }
        
    }
}
