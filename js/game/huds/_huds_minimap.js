
// prepare les grafics huds pour combats, quand start, ajoute a la camera et scene car ya des affines
class _Huds_Minimap extends _Huds_Base{
    constructor() {
        super();
        /**Mode minimap, si zoom */
        this._zoomed = true;
        /** @type {{ 'Mask':PIXI.Sprite, 'BB':, 'CC':, 'DD':, 'EE':, 'FF':, }} */
        this.child = null;
    };
    
    //#region [Initialize]
    initialize(){
        this.initialize_planetInfo();
        this.initialize_galaxiInfo();
        this.initialize_renderMaskMap();
        this.initialize_interactions();
        this.child = this.childrenToName();
        this.position.set(1920/2,150);
        this.toogleZoomIn(false);
    };

    initialize_planetInfo(){
        const w = 300;
        const TxtTitle_planet = new PIXI.Text('??????',$systems.styles[5]);
            TxtTitle_planet.name = 'TxtTitle_planet';
            TxtTitle_planet.anchor.set(0,0.5);
            TxtTitle_planet.x = -w+10; // 5 marge from left
        const BgTitle_planet = new PIXI.Sprite(
            $app.renderer.generateTexture(
                new PIXI.Graphics().beginFill(0x212121,0.8).drawRoundedRect(0,0, w, TxtTitle_planet.height,12).endFill()
            )
        );
        BgTitle_planet.name = 'BgTitle_planet';
        BgTitle_planet.addChild(TxtTitle_planet);
        BgTitle_planet.anchor.set(1,0.5);
        BgTitle_planet.parentGroup = $displayGroup.DiffuseGroup;
        BgTitle_planet.position.set(-30,-120)
        this.addChild(BgTitle_planet);
    };

    initialize_galaxiInfo(){
        const w = 300;
        const TxtTitle_galaxi = new PIXI.Text('??????',$systems.styles[5]);
            TxtTitle_galaxi.name = 'TxtTitle_galaxi';
            TxtTitle_galaxi.anchor.set(1,0.5);
            TxtTitle_galaxi.x = w-10; // 5 marge from left
        const BgTitle_galaxi = new PIXI.Sprite(
            $app.renderer.generateTexture(
                new PIXI.Graphics().beginFill(0x212121,0.8).drawRoundedRect(0,0, w, TxtTitle_galaxi.height,12).endFill()
            )
        );
        BgTitle_galaxi.name = 'BgTitle_galaxi';
        BgTitle_galaxi.addChild(TxtTitle_galaxi);
        BgTitle_galaxi.anchor.set(0,0.5);
        BgTitle_galaxi.parentGroup = $displayGroup.DiffuseGroup;
        BgTitle_galaxi.position.set(30,-120)
        this.addChild(BgTitle_galaxi);
    };

    /** creer un renderer mask */
    initialize_renderMaskMap(){
        const dataBase = $loader.DATA2.HudsMiniMap;
        const dataBase2 = $loader.DATA2['p1m1']; // todo: mettre un placebo
        //# data2/Hubs/minimap/SOURCE/images/miniMap_bgBlack.png
        const BgBlack = $objs.ContainerDN(dataBase,'miniMap_bgBlack','BgBlack');
        BgBlack.d.anchor.set(0.5);
        BgBlack.n.anchor.set(0.5);
        BgBlack.alpha = 0.5;
        //# data2/Hubs/minimap/SOURCE/images/miniMap_mask.png
        const BG = new PIXI.Sprite(dataBase.textures.miniMap_mask);
            BG.parentGroup = $displayGroup.DiffuseGroup;
            BG.anchor.set(0.5);
        //# data2/Hubs/minimap/SOURCE/images/miniMap_mask.png
        const Mask = new PIXI.Sprite(dataBase.textures.miniMap_mask).setName("Mask");
            Mask.anchor.set(0.5);
        //# data2/Backgrounds/map1planet1/SOURCE/images/p1m1_sm.png
        const MiniMap = $objs.ContainerDN(dataBase2,'p1m1_sm','MiniMap');
        MiniMap.d.anchor.set(0.5);
        MiniMap.n.anchor.set(0.5);
        MiniMap.mask = Mask;
        MiniMap.d.mask =  Mask;
        MiniMap.n.mask =  Mask;
        //# data2/Hubs/minimap/SOURCE/images/miniMap_target.png
        const Target = $objs.ContainerDN(dataBase,'miniMap_target','Target');
        Target.d.anchor.set(0.5);
        Target.n.anchor.set(0.5);
        //# Title Map
        const titleMapContainer = new PIXI.Container();
            const txtTitleMap = new PIXI.Text('Nathalia Farm',$systems.styles[5]);
                txtTitleMap.anchor.set(0.5);
            const bgTitle = new PIXI.Graphics().beginFill(0x212121).drawRoundedRect(-txtTitleMap.width/2-40, -txtTitleMap.height/2, txtTitleMap.width+80, txtTitleMap.height,10).endFill();
            bgTitle.parentGroup = $displayGroup.DiffuseGroup;
        titleMapContainer.addChild(bgTitle,txtTitleMap);
        titleMapContainer.y = 150;
        //# data2/Hubs/minimap/SOURCE/images/miniMap_top.png
        const TopCircle = $objs.ContainerDN(dataBase,'miniMap_top','TopCircle');
        TopCircle.d.anchor.set(0.5);
        TopCircle.n.anchor.set(0.5);

        this.addChild(BG,BgBlack,Mask,MiniMap,titleMapContainer,Target,TopCircle);
        const f = $systems.PixiFilters.BulgePinchFilter;
        MiniMap.d.filters = [f];
        MiniMap.n.filters = [f];
        //Inspectors.Filters(f);
    };

    initialize_interactions() {
        this.interactive = true;
        this.on('pointerover'      , this._pointerover );
        this.on('pointerout'       , this._pointerout  );
        this.on('pointerdown'      , this._pointerdown );
        this.on('pointerup'        , this._pointerup   );
        this.on('pointerupoutside' , this._pointerup   );
    };
    //#endregion


    //#region [Interactive]
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    _pointerover(e) {
  
    };

    /** @param {PIXI.interaction.InteractionEvent} e -*/
    _pointerout(e) {

    };

    /** @param {PIXI.interaction.InteractionEvent} e -*/
    _pointerdown(e) {

    };

    /** @param {PIXI.interaction.InteractionEvent} e -*/
    _pointerup(e) {
        this.toogleZoomIn()
    };
    //#endregion

    //#region [Method]
    /** change la minimap avec le mapName actuel */
    changeMiniMap(){
        //TODO: Utiliser generate textures sur stage, mais avec seulement certaine category d'elements, ou si trop compliquer photoshop
        const Mask = this.child.Mask;
        //# data2/Backgrounds/map2planet1/SOURCE/images/p1m1_sm.png
        const MiniMap = $objs.ContainerDN(dataBase2,'p1m1_sm','MiniMap');
        MiniMap.d.anchor.set(0.5);
        MiniMap.n.anchor.set(0.5);
        MiniMap.mask = Mask;
        MiniMap.d.mask =  Mask;
        MiniMap.n.mask =  Mask;
    };

    show(){
        this.renderable = true;
    };

    /** Agrandit la miniMap ou reduit, selon le mode _zoomed */
    toogleZoomIn(mode=!this._zoomed){
        const BulgePinchFilter = $systems.PixiFilters.BulgePinchFilter;
        this._zoomed = (mode!==undefined)?mode:!this._zoomed;
        if(this._zoomed){
            TweenLite.to(this.scale, 0.2  , { x:1, y:1, ease: Power4.easeOut });
            TweenLite.to(this.position, 0.4  , { y:150, ease: Bounce.easeOut });
            TweenLite.to(BulgePinchFilter, 0.2  , { radius:160,strength:0.4, ease: Power4.easeOut });
            $gui.GameSteps.zoomIn();
        }else{
            TweenLite.to(this.scale, 0.2  , { x:0.6, y:0.6, ease: Power4.easeOut });
            TweenLite.to(this.position, 0.4  , { y:85, ease: Bounce.easeOut });
            TweenLite.to(BulgePinchFilter, 0.2  , { radius:150,strength:-0.15, ease: Power4.easeOut });
            $gui.GameSteps.zoomOut();

        }
    };


    /** Normalize la position de la minimap en raport au player */
    normalizePosition(){ // $huds.MiniMap.normalizePosition()
        const MiniMap = this.child.MiniMap;
        const Target = this.child.Target;
        const ratioW = MiniMap.d.texture.width/$camera._sceneW;
        const ratioH = MiniMap.d.texture.height/$camera._sceneH;
        const pivX = $players.p0.p.position3d.x*ratioW;//$camera.view.position3d.x*ratioW
        const pivY = $players.p0.p.position3d.z*ratioH;//$camera.view.position3d.y*ratioH
        TweenLite.to(MiniMap.position, 0.6, {x:-pivX,y:pivY,ease:Power3.easeOut })
        //Target.position.set(-$players.p0.p.position3d.x,-$players.p0.p.position3d.z); // todo:
    };

    /** cacher la minimap */
    hide(){
        TweenLite.to(this.position, 0.3, {y:-180,ease:Power4.easeOut }).eventCallback("onComplete", ()=>{
            this.renderable = false;
            this.visible = false;
        });
    };
    //#endregion

};