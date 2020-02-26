
class _Huds_CombatSelector extends _Huds_Base {
    constructor() {
        super();
         /**@type {Array.<_CombatSelector>} battlers - contien les selector du combat */
        this.Selectors = [];
    };

    /**@param {Array.<_battler>} battlers - indique si en phaze combat */
    initialize(battlers) {
        this.renderable = !!battlers;
        this.visible = !!battlers;
        if(battlers){
            for (let i=0, l=battlers.length; i<l; i++) {
                const selector = this.Selectors[i] = new _CombatSelector(battlers[i]._battlerID);
                const w = 620/l; // width //todo: ? 100. cette facon fair permet de dispatcher egual baser sur lespace du centre 
                const centerScreen = ((1920/2)-(w*l)/2);
                const x = (w/2)+(w*i)+centerScreen;
                const fromY = (!i||i===l-1)? 950 : 850; // les frame players sont plus bas
                TweenLite.fromTo(selector.position, 2.2, {x:1920/2,y:fromY},{x:x,y:55,ease:SlowMo.ease.config(0.6, 1.1, false)});
            };
            this.addChild(...this.Selectors);
        };
    };
    
    /**@returns {_CombatSelector} - obtien un _CombatSelector par id*/
    getSelector(id){
        return this.Selectors[id] || false;
    };
};

class _CombatSelector extends PIXI.Container {
    constructor(battlerId) {
        super();
        this._battlerId = battlerId;
        /** @type {{ HeadFrame:_objs.ContainerDN, HeadIcon:_objs.ContainerDN, combatTimerBar:_objs.ContainerDN, combatTimerBar_progress:_objs.ContainerDN, TimerTxt:PIXI.Text,}} */
        this.child = null;
        this.scale.set(0.8);
        this.scale.setZero();
        this.initialize();
        this.initialize_interaction();
   
    };
    get battler() { return _Combats.battlers[this._battlerId] };

    initialize(){
        const dataBase = $loader.DATA2.HudsCombats;
        const dataBase2 = $loader.DATA2.MonsterIcons;
        const dataBase3 = $loader.DATA2.HeadIcons;
            //! data2/Icons/monstersIcons/SOURCE/images/monsterIcoBG.png
        const HeadFrame = $objs.ContainerDN(dataBase2, 'monsterIcoBG','HeadFrame');
            HeadFrame.d.anchor.set(0.5);
            HeadFrame.n.anchor.set(0.5);
        //! data2/Icons/HeadIcons/SOURCE/images/hico_p0.png
        const HeadIcon = $objs.ContainerDN(dataBase3,'hico_'+this.battler._type+this.battler._iconId,'HeadIcon');
            HeadIcon.scale.set(0.7);
            HeadIcon.d.anchor.set(0.5);
            HeadIcon.n.anchor.set(0.5);
        //! data2/Hubs/combats/SOURCE/images/combatTimerBar.png
        const slider = $objs.ContainerDN(dataBase, 'combatTimerBar');
            slider.d.anchor.set(0.5);
            slider.n.anchor.set(0.5);
            slider.y = 40;
            //! data2/Hubs/combats/SOURCE/images/combatTimerBar_progress.png
            const sliderProgress = $objs.ContainerDN(dataBase, 'combatTimerBar_progress');
                sliderProgress.position.set(-sliderProgress.width/2,-2);
                slider.addChild(sliderProgress);
        const TimerTxt = new PIXI.Text(`${this.battler._battleTime}`,{fill:"white",fontSize:18,strokeThickness:4});//title text
            TimerTxt.name = 'TimerTxt';
            TimerTxt.anchor.set(0.5);
            TimerTxt.y = 40;
        //#end
        this.addChild(HeadFrame,HeadIcon,slider,TimerTxt);
    };

     /** interaction du combatSlot */
     initialize_interaction(){
        this.interactive = true;
        this.on("pointerover" , this.pointerover_combatSelector ,this);
        this.on("pointerout"  , this.pointerout_combatSelector  ,this);
        this.on("pointerdown" , this.pointerdown_combatSelector ,this);
        this.on("pointerup"   , this.pointerup_combatSelector   ,this);
    };
//#region [Interactive]
    /**@param {PIXI.interaction.InteractionEvent} e */
    pointerover_combatSelector(e){
        _Combats.selectTarget(this.battlerId);
    };
    /**@param {PIXI.interaction.InteractionEvent} e */
    pointerout_combatSelector(e){
        
    };
    /** focus on target and setActions avant de fair un doAction
    * @param {PIXI.interaction.InteractionEvent} e */
    pointerdown_combatSelector(e){

    };

    /**@param {PIXI.interaction.InteractionEvent} e */
    pointerup_combatSelector(e){

    };
//#endregion


      
    /** update le timer */
    update_timer(){
        const ratio = -(this.battler._battleTime/_Combats._timeLimit)+1;
        this.child.combatTimerBar_progress.scale.x = ratio;
        this.child.TimerTxt.text = Math.floor(this.battler._battleTime*100)/100;
    };

    /** defenie ou unasign ce selector comme source */
    selectForSource(value){
        const scale = this.scale;
        if(value){
            this._isSourceSelected = true;
            TweenLite.to(scale, 0.2,{ x:scale.zero.x+0.2,y:scale.zero.y+0.2, ease: Expo.easeOut });
            this.child.HeadIcon.d.filters = [$systems.PixiFilters.OutlineFilterx4white];
        }else{
            this._isSourceSelected = false;
            TweenLite.to(scale, 0.2,{ x:scale.zero.x,y:scale.zero.y, ease: Expo.easeOut });
            this.child.HeadIcon.d.filters = null;
        }
    };

    /** focus du selector battler */
    select(){
        const HeadIcon = this.child.HeadIcon;
        const HeadFrame = this.child.HeadFrame;
        HeadIcon.d.filters = [$systems.PixiFilters.OutlineFilterx4white];
        TweenLite.to(HeadIcon.scale, 0.3,{ x:0.65,y:0.65, ease: Expo.easeOut });
        TweenMax.fromTo(HeadIcon, 1, {rotation:-0.1},{
            rotation: 0.1,
            ease: Power2.easeInOut,
                repeat: -1,
                yoyoEase: true
            });
        const scale = this.scale;
        TweenLite.to(scale, 0.2,{ x:scale.zero.x+0.2,y:scale.zero.y+0.2, ease: Expo.easeOut });
    };

    /** unfocus du selector battler */
    unSelect(){
        const HeadIcon = this.child.HeadIcon;
        const HeadFrame = this.child.HeadFrame;
        TweenMax.killTweensOf(HeadIcon);
        HeadIcon.d.filters = null;
        HeadIcon.rotation = 0;
        HeadIcon.scale.set(0.7);
        if(!this._isSourceSelected){ // si nest pas la source, deselect
            const scale = this.scale;
            TweenLite.to(scale, 0.2,{ x:scale.zero.x,y:scale.zero.y, ease: Expo.easeOut });
        }
    };
                
};