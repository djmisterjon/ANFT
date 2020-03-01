/** Class des action command pour pendant turn combat */
class _Huds_BattlersCommands extends _Huds_Base {
    constructor() {
        super();
        /** @type {Array.<String>} - tree List des commands choisis*/
        this.SelectedCommands = [];
        /** width du dernier group de command */
        this._boundX = 0;
        /** @type {_CommandGroups} le group actuelement active pour selecteur*/
        this.ActiveGroup = null;
        /** @type {{ 'commandGroup_Actions':_CommandGroups,commandGroup_Battlers:_CommandGroups  }} */
        this.child = null;
    }
    /** return le tree id progression des choix de command */
    get commandTreeId() {
        return this.SelectedCommands.length;
    }
    //#region [Initialize]
    initialize() {
        this.initialize_base();
        this.child = this.childrenToName();
        this.initialize_interactions()
        this.position.setZero(420,870);
    }
    initialize_base(){

    }

    initialize_interactions() {
        
    };
    
    //#endregion
    //#region [Interactive]

    //#endregion
    //#region [Method]
    /** show un list de battlers, initialize leur icons */
    show(){
        this.renderable = true;
        $gui.Travel.hide();
        this.showNextGroup();
    }
    showNextGroup(){
        this.ActiveGroup?.disable();
        switch (this.commandTreeId) {
            case 0: this.showCommand_Actions(); break;
            case 1: this.showCommand_Battlers(); break;
            case 2: this.showCommand_Boosters(); break;
            default:
                break;
        }
        this.ActiveGroup.enable();
        this._boundX+=this.width+4;
    }
    addCommand(command){
        this.SelectedCommands.push(command)

        this.showNextGroup();
    }


    //#endregion
    
    showCommand_Actions(){
        const commands = $systems.BATTLECOMMAND.keys;
        const title = 'Select action';
        const commandGroup_Actions = new _CommandGroups(commands,title).setName('commandGroup_Actions');
        gsap.fromTo(commandGroup_Actions, 0.4,{x:0,alpha:0}, {x:this._boundX,alpha:1})
        this.addChild(commandGroup_Actions);
        this.ActiveGroup = commandGroup_Actions;
    }
    showCommand_Battlers(){
        const title = 'Select target';
        const commands = _Combats.Active.Monsters.map(m=>String(m._battlerID));
        const commandGroup_Battlers = new _CommandGroups(commands,title).setName('commandGroup_Battlers');
        gsap.fromTo(commandGroup_Battlers, 0.4,{x:0,alpha:0}, {x:this._boundX,alpha:1})
        this.addChild(commandGroup_Battlers);
        this.ActiveGroup = commandGroup_Battlers;
    }
    showCommand_Boosters(){
        const title = 'Select boosters';
        const commandGroup_Boosters = new _CommandGroups(['item1','item2','item3','item4','item5','item6','item7'],title).setName('commandGroup_Boosters');
        gsap.fromTo(commandGroup_Boosters, 0.4,{x:0,alpha:0}, {x:this._boundX,alpha:1})
        this.addChild(commandGroup_Boosters);
        this.ActiveGroup = commandGroup_Boosters;
    }
}
