class _Scene_Base extends PIXI.projection.Container3d {
    constructor() {
        super();
        /** nome de la scene (easy debug)*/
        this._name   = this.constructor.name;
        /** Indicateur ready to start */
        this._ready = false;
        /** indique si la scene est started */
        this.parentGroup = $displayGroup.group[0];
        /** Scene background */
        this.Background = null;
        this._sceneWidth = null;
        this._sceneHeight = null;
    };

    //#region [GetterSetter]
    /**@returns {ExcelSceneData} */
    get DATA() {
        return $loader.DATA.scene[this.constructor.name] || console.error('(get:DATA): warning missing json: ',this.constructor.name) && {};
    };
    //#endregion

    //#region [Initialize]
    /** create tous les obj,sprite,event grafic de la scene */
    __initialize(){
        this.initialize_background();
        this.initialize_objets();
        this.initialize_interaction();
        $camera.initialize(this);
    };

        /*** clear and creat Background, from dataValues or dataBase editor select
    * @param {string} name - DATA._background
    */
   initialize_background(name) {
        this.clearBackground();
        const DATA = this.DATA;
        const backgroundName = name || DATA._background;
        if(backgroundName){
            const dataBase = $loader.DATA2[backgroundName];
            const Background = this.Background = $objs.ContainerDN(dataBase, backgroundName)
                Background.convertSubtreeTo3d()
                Background.zOrder = -1;
                Background.parentGroup = $displayGroup.group[0];
                Background.d.anchor.set(0.5);
                Background.n.anchor.set(0.5);
                Background.euler.x = -Math.PI/2;
                this._sceneWidth = dataBase.textures[backgroundName].width;
                this._sceneHeight = dataBase.textures[backgroundName].height;
            this.addChildAt(Background,0);
        }else{
            const Background = this.Background = new PIXI.Container();
            this.addChildAt(Background,0);
        };
    };

    /** create les objet pour la scene avec les dataObj  */
    initialize_objets(objs =  this.DATA._objs){
        if(objs){
            for (let i=0, l=objs.length; i<l; i++) {
                //TODO: RENDRE CA PLUS PRORPE
                const id = objs[i].g._globalId.value;
                const dataObj = $objs.GLOBAL[id];
                $objs.addtoLocalRegister(dataObj);
                this.addChild(dataObj.p);
            };
        };
    };

    //TODO: VERIFIER SI CES LA MEILLEUR FACON DE PROCEDER POUR ELS CASES ET AUTRE EVENTS
    /** initialise les interaction des objets */
    initialize_interaction(){
        $objs.LOCAL.forEach(dataObj => {
            dataObj.initialize_interaction && dataObj.initialize_interaction();
        });
    };
    //#endregion

    //#region [Method]
    /** base start
     * @param {Boolean} setup - indique si on initialise les setups
     */
    __start(setup=false){
        this._started = true;
        if(setup){
            this.setupPlayer();
            this.setupCamera();
        };
        gsap.fromTo($stage.scene, 0.5,{alpha:0},{alpha:1})
        .eventCallback("onStart",()=>{
            window.gc(); //empty GC heviter une trop grand acumulations.
        })
        .eventCallback("onComplete",()=>{
            $mouse._scanDisable = false;
            $stage.scene.interactiveChildren = true;
        });
    };

    setupPlayer(){
        for (let i=0,players = $players.group, l=players.length; i<l; i++) {
            const player = players[i];
            this.addChild(player.p);
        };
        $players.transferToCase();
    };

    setupCamera(){
       $camera.moveToTarget($players.p0,1);
       $gui.Minimap.normalizePosition(); // *1 time
    };

    /** ending return des promise de fin des scenes*/
    end(){
        //!purge scene
        $objs.clear();
        return new Promise((resolve, reject) => {
            TweenLite.to(this, 0.5, {alpha:0}).eventCallback("onComplete",()=>{
                // remove players, sinon il von etre destroys
                $players.p0 && this.removeChild($players.p0.p);
                $players.p1 && this.removeChild($players.p1.p);
                this.Destroy();
                resolve();
            });
        });
    };
    clearBackground(makeEmpty) {
        if(this.Background){
            this.removeChild(this.Background);
            this.Background = null;
        };
        if(makeEmpty){
            //this.background = $objs.newContainer_type('background');
        }
    };

    /** Destroy tous les ref de la scene, (see memory leek) */
    Destroy(){
        this.destroy({children:true});
        this.Background = null;

        //this.euler      = null;
        //this.pivot3d    = null;
        //this.position3d = null;
        //this.scale3d    = null;
        //this.proj       = null;

        this.parentGroup = null;
        this.tempDisplayObjectParent = null;
        this.textLog = null;
        this._activeParentLayer = null;
        this._localBoundsRect = null;
    };
    //#endregion
};
