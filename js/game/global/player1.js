

/**@class players heroes 1  cat*/
class _player1 extends _battler {
    constructor(data,id) {
        super(id,data,'p',1);
        /** @type {{ 'ContainerSpine':_Container_Spine }} */
        this.child = null;
        this.initialize();
    };
    
    //#region [Initialize]
    /** initialize spine sprite */
    initialize(){
        this.initialize_sprites();
        //this.initialize_listeners();
        this.initialize_battler();
        //this.setupTweens();
        //this.addInteractive();
    };

    /** initialize tous les elements */
    initialize_sprites(){
        //TODO: peut etre ajouter un nouveau container, pour mettre des FX speciaux au players
        const ContainerSpine = $objs.create(null,this.dataBase,'idle').setName('ContainerSpine');
        this.child = ContainerSpine.childrenToName();
    };
    //#endregion

    //#region [GetterSetter]
    get dataBase() { return $loader.DATA2.heroe2}
    //#endregion

    //#region [Method]
    setupAnimations(dataObj){
        //! hack player
        const spine = dataObj.child.s;
        spine.stateData.defaultMix = 0.2;
        spine.hackAttachmentGroups("_n", PIXI.lights.normalGroup, PIXI.lights.diffuseGroup); // (nameSuffix, group)
        spine.state.setAnimation(0, "idle", true);
        spine.state.setAnimation(1, "hair_idle", true);
        spine.skeleton.setSlotsToSetupPose();
    };
    //#endregion
}
