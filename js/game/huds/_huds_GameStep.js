
/** Huds indicateur de step en jeux, 3 step possible [setup,action,events] */
class _Huds_GameSteps extends _Huds_Base{
    constructor() {
        super();
        /** @type {number} le gameMode actuel [0,1,2] 
         * @default 0
        */
        this._currentMode = 0;
        this.position.set(1920/2,390);
    };
    
    //#region [Initialize]
    initialize(){
        this.initialize_main();
        this.initialize_tweens();

    };

    initialize_main(){
        const dataBase = $loader.DATA2.Huds_GameStep;
        const dataBase2 = $loader.DATA2.Selectors;
        //# data2/Hubs/GameStep/SOURCE/images/gameStep_BG.png
        const BG = $objs.ContainerDN(dataBase,'gameStep_BG','BG');
            BG.d.anchor.set(0.5);
            BG.n.anchor.set(0.5);
            BG.alpha = 0.7;
        //!data2/System/Selectors/SOURCE/images/selector_bigCircle.png
        // est child entre Icon<=>CircleTop
        const Selector = new PIXI.Sprite(dataBase2.textures.selector_bigCircle);
            Selector.name = 'Selector';
            Selector.parentGroup = $displayGroup.DiffuseGroup;
            Selector.anchor.set(0.5);
            Selector.scale.set(0.4);

        const Slot = [];
        for (let i=0,x=-135, l=3; i<l; i++) {
            const C = new PIXI.Container().setName('SlotStep');
             //# data2/Hubs/GameStep/SOURCE/images/gameStep_circleBG.png
             const CircleBG = $objs.ContainerDN(dataBase,'gameStep_circleBG','CircleBG');
                CircleBG.d.anchor.set(0.5);
                CircleBG.n.anchor.set(0.5);
             //# data2/Hubs/GameStep/SOURCE/images/gameStep_ico_0.png
            const Icon = $objs.ContainerDN(dataBase,'gameStep_ico_'+i,'Icon');
                Icon.d.anchor.set(0.5);
                Icon.n.anchor.set(0.5);
            //# data2/Hubs/GameStep/SOURCE/images/gameStep_circleTop.png
            const CircleTop = $objs.ContainerDN(dataBase,'gameStep_circleTop','CircleTop');
                CircleTop.d.anchor.set(0.5);
                CircleTop.n.anchor.set(0.5);
            C.addChild(CircleBG,Icon,Selector,CircleTop);
            C.position.set(x,0);
            x+=135;
            Slot.push(C);
        };

        this.addChild(BG,...Slot);
        this.child = this.childrenToName();
    };

    initialize_tweens(){
        TweenMax.to(this.child.Selector, 34, {rotation:Math.PI*2, ease:Linear.easeNone, repeat:-1});
    };
    initialize_interactions() {
    
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
    };
    //#endregion

    //#region [Method]
    show(){
        this.renderable = true;
    };
    
    zoomIn(){
        TweenLite.to(this.scale, 0.2  , { x:1, y:1, ease: Power4.easeOut });
        TweenLite.to(this, 0.4  , {y:390, ease: Power4.easeOut });
    };

    zoomOut(){
        TweenLite.to(this.scale, 0.2  , { x:0.6, y:0.6, ease: Power4.easeInOut });
        TweenLite.to(this, 0.3  , {y:390-180, ease: Power4.easeInOut });

    };

    /** Change le gameStep mode et parametre le jeux en consequence
     * @param {number} mode - mode[0,1,2] ou -1 pour mode intro ou autre ?
     */
    setStep(mode){
        this.clearStep();
        this.child.SlotStep[mode].addChildAt(this.child.Selector,2);
        TweenLite.from(this.child.Selector.scale, 1.2  , { x:1, y:1, ease: Elastic.easeInOut.config(0.8, 0.4) });
        if(mode===0){
            //! setup mode 0
            $app.stage.scene.interactiveChildren = false;
        };
        if(mode===1){
            //! setup mode 1
            $app.stage.scene.interactiveChildren = true;
        };
        this._currentMode = mode;
    };

    /** phase avant de passer a un step, si besoin clear certain chose */
    clearStep(){

    }
    //#endregion

};