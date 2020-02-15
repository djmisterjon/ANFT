
/** GUI Control Manage tous les type de gui, menue,huds */
class _GUI { //TODO REFACTORING DANS UN CONTAINER ? .huds .menue gui.huds. gui.menue
    static Menues = ['Settings','Saves','Quests','Maps','Items','Status','MonstersBook'];
    constructor() {
        /** @type {{ 'Master':PIXI.Container,
         * '_Huds_Travel'            :_Huds_Travel            ,
         * '_Huds_PinBar'            :_Huds_PinBar            ,
         * '_Huds_States'            :_Huds_States            ,
         * '_Huds_Minimap'           :_Huds_Minimap           ,
         * '_Huds_CombatSelector'    :_Huds_CombatSelector    ,
         * '_Huds_CombatScreenChoice':_Huds_CombatScreenChoice,
         * '_Huds_MessageIndicator'  :_Huds_MessageIndicator  ,
         * '_Huds_GameSteps'         :_Huds_GameSteps         ,
         * '_Menue_Items'            :_Menue_Items            ,
         * '_Menue_Quests'           :_Menue_Quests           , 
         * }} */
        this.child = null;
    }
    //#region [GetterSetter]
    //!Huds
    get Travel() { return this.child._Huds_Travel };
    get PinBar() { return this.child._Huds_PinBar };
    get States() { return this.child._Huds_States };
    get Minimap() { return this.child._Huds_Minimap };
    get CombatSelector() { return this.child._Huds_CombatSelector };
    get MessageIndicator() { return this.child._Huds_MessageIndicator };
    get GameSteps() { return this.child._Huds_GameSteps };
    //!Menues
    get MonstersBook() { return null };
    get Status() { return null };
    get Items() { return this.child._Menue_Items };
    get Maps() { return null };
    get Quests() { return this.child._Menue_Quests };
    get Saves() { return null };
    get Settings() { return null };
    //#endregion


    /** initialize and cache huds */
    initialize (options) {
        const Master = new PIXI.Container().setName('Master');
            Master.parentGroup = $displayGroup.group[5];
        const huds = [
            new _Huds_PinBar(),
            new _Huds_Travel(),
            new _Huds_States(),
            new _Huds_Minimap(),
            new _Huds_CombatSelector(),
            new _Huds_CombatScreenChoice(),
            new _Huds_MessageIndicator(),
            new _Huds_GameSteps(),
        ];
        const menues = [
            new _Menue_Items(),
            new _Menue_Quests(),
        ];
        Master.addChild(...huds);
        Master.addChild(...menues);
        this.child = Master.childrenToName();
        for (let i=0,GUI=huds.concat(menues), l=GUI.length; i<l; i++) {
            const gui = GUI[i];
            gui.initialize();
            gui.renderable = false; // reative sur .show()
        }
        $stage.addChild(Master); //TODO: RENDU ICI, FINALISER LES MENU
        //this.setRendering(false);
        //!deleteme debug.
        //this.PinBar.show();
        //this.Travel.show();
        //this.States.show();
       //this.Minimap.show();
       //this.Items.show();
       //this.MessageIndicator.show();
       //this.MessageIndicator.show();
    }

    /** active ou disable le rendering et la visibiliter pour les scenes au besoin
     * @param {Boolean} enable - rendering
     * @param {Boolean} animation - Indique si ont tweenIn avec une promise fromTo show
    */
    setRendering(enable=true,animation=false){
        this.child.Master.renderable = enable;
        this.child.Master.visible = enable;
        if(animation){ //todo: equivalent de show all, hide all 

        }
    }

    /** affiche un hud ou menu selon un string id dynamic*/
    show(name){
        const gui = this[name];
        gui && this[name].show();
    }

}

let $gui = new _GUI();
console.log1('$gui', $gui);



