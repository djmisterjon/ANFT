/** @extends PIXI.display.Stage */
class _stage extends PIXI.display.Stage {
    //#region [Static]

    //#endregion
    constructor() {
        super();
        /** mise en pause du listener */
        this._busy = false;
        /**@type {Scene_Map1|Scene_Map2} current scene rendering */
        this.scene = null;
        /**@type {Scene_Map1} prochaine scene a loader*/
        this._nextScene = null;
        /** si la scene est starter */
        this._started = false;
        /** @type {{ 'AmbientLight':PIXI.lights.AmbientLight, 'BB':, 'CC':, 'DD':, 'EE':, 'FF':, }} */
        this.child = {};
    };

    //#region [Initialize]
    /**@returns {_stage}*/
    initialize(){
        this.ticker = PIXI.ticker.shared;
        PIXI.ticker.shared.add(this.update, this, PIXI.UPDATE_PRIORITY.LOW); // PIXI.UPDATE_PRIORITY.LOW
        this.initialize_Layers();
        this.initialize_Camera();
        this.initialize_lights();
        return this; // replace app.stage
    };

    initialize_Camera(){
        this.addChild($camera.view); // camera can hold scene with projections
    };

    /** ajoute au stage les layers groups pour le renderer */
    initialize_Layers(){
        this.addChild( // lights groups
            $displayGroup._spriteBlack_d,
            $displayGroup._layer_diffuseGroup,
            $displayGroup._layer_normalGroup,
            $displayGroup._layer_lightGroup,
            ...$displayGroup.layersGroup // displayGroups
        );
        //! tilingSprite black app diffuse normal
        const graphicsD = new PIXI.Graphics().beginFill(0x000000).drawRect(0,0, 2, 2).endFill();
        const black = $app.renderer.generateTexture(graphicsD);
        const graphicsN = new PIXI.Graphics().beginFill(0x7f7fff).drawRect(0,0, 2, 2).endFill();
        const blue = $app.renderer.generateTexture(graphicsN);

        const tilingSprite  = new PIXI.extras.TilingSprite( black, $app.screen.width, $app.screen.height );
        const tilingSprite2 = new PIXI.extras.TilingSprite( blue, $app.screen.width, $app.screen.height );
        tilingSprite.parentGroup = $displayGroup.DiffuseGroup; // BUG, TilingSprite GET BLACK
        tilingSprite2.parentGroup = $displayGroup.NormalGroup; // BUG, TilingSprite GET BLACK
        this.addChildAt(tilingSprite ,0);
        this.addChildAt(tilingSprite2,1);
    };

    /** lumiere pour le stage */
    initialize_lights(){ //TODO: A VOIR SI ON MET DANS SCENE OU STAGE ?
        const AmbientLight = this.child.AmbientLight = new PIXI.lights.AmbientLight(0xffffff,0.6);//$objs.newContainer_light('AmbientLight'    );
        // this.LIGHTS.PointLight_mouse = new PIXI.lights.PointLight();//$objs.newContainer_light('PointLight'      );
        //// this.LIGHTS.DirectionalLight = new PIXI.lights.DirectionalLight();//$objs.newContainer_light('DirectionalLight');
        // this.addChild(...Object.values(this.LIGHTS) );
        this.addChild(AmbientLight); //TODO: VOIR SI ON MET DANS STAGE AUSSI OU LES 2 ? car les huds on besoin ?
        // this.addChild(new PIXI.lights.DirectionalLight(0xffffff,1,this)); //TODO: VOIR SI ON MET DANS STAGE AUSSI OU LES 2 ? car les huds on besoin ?
    };
    //#endregion

    // see http://pixijs.download/dev/docs/PIXI.prepare.html for gpu cache 
    goto(nextScene, options) {
         // check if loaderKit asigned to class are loaded, if yes get the scene, if no , goto loader scene and load all kit and scene
        this._nextScene = $loader.getNextScene(nextScene);
        document.title = document.title+` =>[${this._nextScene.constructor.name}] `; //deleteme debug only
    };
    
    /** update scene sequence */
    update(delta) {
        if(this._busy){ return console.log(`wait busy: ${this._busy}`)};
        if(this._nextScene){
            return this.changeScene();
        }; 
        if(this.scene){
            if(this.scene._started){
                this.scene.update(delta);
                //$statesManager.update();
                $camera.update();
            }else{
                this.scene.initialize();
                this.scene.start();
                //this._started = true;
            };
        };
    };
    
    /** make transision for change scene*/
    changeScene(){
        this._started = false;
        // si scene et quel est pas ended? busy et end scene
        if(this.scene){
            this._busy = this.scene.constructor.name+' wait ending';
            this.scene.end().then(() => {
                this.scene = this._nextScene;
                this._nextScene = null;
                this._busy = false 
            });
        }else{
            this.scene = this._nextScene;
            this._nextScene = null;
        };
    };
};

const $stage = new _stage();
console.log1('$stage: ', $stage);
