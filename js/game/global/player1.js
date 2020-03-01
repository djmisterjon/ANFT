

/**@class players heroes 1  cat*/
class _player1 extends _battler {
    constructor(DataBattlers) {
        super(DataBattlers);
        this.pathBuffer = [];
        this.initialize();
    };
    
    //#region [Initialize]
    initialize(){
        this.initialize_base();
        this.initialise_animations();
        //this.initialize_listeners();
        //this.setupTweens();
        //this.addInteractive();
    }
    initialise_animations(){
        const spine = this.s;
        spine.stateData.defaultMix = 0.1;
        spine.state.setAnimation(0, "idle", true);
        spine.skeleton.setSlotsToSetupPose();
        //TODO: EXPERIMENTAL wink eyes, use spine events random
        setInterval(function(){
            const allowWink = Math.random() >= 0.8;
            allowWink && spine.state.setAnimation(2, 'wink1', false); 
        }, 3000);
        this.p.pivot3d.y = 100;
    }
    //#endregion

    //#region [GetterSetter]
    //#endregion

    //#region [Method]
    //#endregion
}
