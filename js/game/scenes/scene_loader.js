class Scene_Loader extends _Scene_Base{
    constructor(nextScene) {
        super();
        /** prochaine scene en attente du loaderkit */
        this._nextScene = nextScene;
        
    };

    //#region [Initialize]
    initialize(){
        this.__initialize();
        this.initialize_createDisplayLoading(); // affiche loiading status
        this._ready = true;
    };
    //#endregion

   //#region [Method]
    start(){
        $camera._perspective = 0;
        this.__start();
        $loader.start(this._nextScene);
    };

    update(delta){
        if(!$loader._isLoading){
           $stage.goto(this._nextScene);
        };
    };

    initialize_createDisplayLoading() {
        const style = new PIXI.TextStyle({ fill: "white", fontFamily: "ArchitectsDaughter", fontSize: 24 });
        const text1 = new PIXI.Text('Please Wait Initialisation ...', style);
        const text2 = new PIXI.Text('PROGRESS...', style);
        this.progressTxt = new PIXI.Text('LOADING',{fontSize:44});
        this.textLog = text2;
        text2.position.set(text1.width,30);
        this.addChild(text1,text2);
    };
    //#endregion



};