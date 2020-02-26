class Scene_Boot extends _Scene_Base {
    constructor() {
        super();
    };

    //#region [Initialize]
    initialize(){
        //TODO: CERTAIN VOSN DANS NEW GAME ?, METTRE MANAGER CA PLUTOT DANS SYSTEM
        ////builder
        //$txt.initialize(); // initialise all hubs
        $texts.initialize();
        
        $data_quest.initialise('option');
        $objs.initialize();
        $itemsManager.initialize();
        $mouse.initialize(); // initialise mouse core
        
        //$player2.initialize(); // create game player
        $players.initialize();
        $gui.initialize(); // initialise all hubs
        $messages.initialize(); // initialise all hubs
        ////$gui.initialize(); 
        ////$avatar.initialize();
        //
        $audio.initialize();
        
        ////SceneManager.goto(Scene_Loader,"Scene_IntroVideo_data",Scene_IntroVideo);
        ////$player.transferMap(1); // HACKED FOR DEBUG// FIXME: SceneManager.goto(Scene_Loader,"Scene_IntroVideo_data",Scene_IntroVideo);
        ////$stage.goto(Scene_IntroVideo);
        this.__initialize();
        Debug.CreateInspector();//DELETEME DEBUG
    };

    //#region [Method]
    start(){
        this.__start();
    };

    update(delta){
        $stage.goto('Scene_IntroVideo');
    };
    //#endregion

};
