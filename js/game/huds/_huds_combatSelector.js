/** class qui manage les huds de combat selection en combat */
class _Huds_BattlersSelectors extends _Huds_Base {
    constructor(battlerId) {
        super();
        /** @type {Array.<_BattlerSelectors>} - list des BattlerSelectors de combat 7+2 */
        this.BattlersSelectors = null;
    }
    //#region [GetterSetter]
    get Battlers() {
        return _Combats.Active.Battlers;
    }
    get CurrentBattlerTurn() {
        return _Combats.Active.currentBattlerTurn;
    }
    //#endregion

    //#region [Initialize]
    initialize() {
        this.initialize_base();
        //this.initialize_interactions()
        //this.child = this.childrenToName()
        this.position.setZero(1850,130+35);
    }
    initialize_base(){
        const BattlersSelectors = []
        for (let i=0; i<7+2; i++) {
            BattlersSelectors.push(new _BattlerSelectors(i));
        };
        this.BattlersSelectors = BattlersSelectors;
        this.addChild(...BattlersSelectors);
    }
    //#endregion
    
    /** show un list de battlers, initialize leur icons */
    show(initialize){
        if(initialize){
            for (let i=0,Battlers = this.Battlers, l=this.BattlersSelectors.length; i<l; i++) {
                const Battler = Battlers[i];
                const BattlerSelector = this.BattlersSelectors[i];
                Battler? BattlerSelector.show(Battler._battlerID) : BattlerSelector.hide()
                BattlerSelector.position.y = 106*i;
            }
        }
        gsap.fromTo(this.position, 1, {x:this.position.zero.x+120}, {x:this.position.zero.x})
        this.renderable = true;
    }
    
    update_turn(){
        this.BattlersSelectors.forEach(BattlerSelectors => {
           
        });
        const BattlersSelectors = this.BattlersSelectors.filter(e=>e.renderable);

        const sorted = BattlersSelectors.slice().sort(function(a,b) {
            return b.Battler._battleTime - a.Battler._battleTime;
        })
        const test = sorted.every((Bsorted, index, array)=>{
            return Bsorted === BattlersSelectors[index];
          })

        for (let i=0, l=sorted.length; i<l; i++) {
            const B = sorted[i];
            B.update_timer();
            !test && gsap.to( B.position, {y:106*i})
        }
        //this.BattlersSelectors = sorted; //todo: refactoriser
    }

    startTurn(){
        const battlerID = this.CurrentBattlerTurn._battlerID;
        this.BattlersSelectors[battlerID].startTurn();
    }
    showCombatMathBox(source,target,actionType,boosters){
        // todo: multi targets ?
        const CombatMathBox = new _CombatMathBox(source,target,actionType,boosters);
        const targetSelector = this.BattlersSelectors[target._battlerID]; 
        this.addChild(CombatMathBox);
        CombatMathBox.position.set(-100,targetSelector.y);
    }
}

/**BattlerSelectors afficher pendant battleScreenChoice et durant combat comme selector  */
class _BattlerSelectors extends PIXI.Container {
    constructor() {
        super();
        /** battler id asigner en debut combat */
        this._battlerID = null;
        /** @type {{ SelectorBG:ContainerDN, BattlerBgBar_hp:ContainerDN, BattlerBgBar_timer:ContainerDN,
         * Bar_hp:PIXI.Sprite, Bar_time:PIXI.Sprite, HeadIcon:ContainerDN,
         * txt_hp:PIXI.Text, txt_time:PIXI.Text, }} */
        this.child = null;
        //this.scale.set(0.8);
        //this.scale.setZero();
        this.initialize();
    }
    get Battler() { return _Combats.Active.Battlers[this._battlerID] };

    initialize() {
        this.initialize_base()
        //this.initialize_interactions()
        this.child = this.childrenToName();
    };
        
    initialize_base() {
        const dataBase = $loader.DATA2.HudsCombats;
        const dataBase2 = $loader.DATA2.MonsterIcons;
        const dataBase3 = $loader.DATA2.HeadIcons;
        //! data2\GUI\huds\combats\SOURCE\images\RecBattlerSlector.png
        const SelectorBG = $objs.ContainerDN(dataBase, 'RecBattlerSlector','SelectorBG');
            SelectorBG.d.anchor.set(0.5);
            SelectorBG.n.anchor.set(0.5);
        //! data2\GUI\huds\combats\SOURCE\images\BattlerBgBar.png
        const BattlerBgBar_hp = $objs.ContainerDN(dataBase, 'BattlerBgBar2','BattlerBgBar_hp');
            BattlerBgBar_hp.d.anchor.set(0,0.5);
            BattlerBgBar_hp.n.anchor.set(0,0.5);
            BattlerBgBar_hp.position.set(-42,40);
        const txt_hp = new PIXI.Text('???',{ fill: "white", fontFamily: "Comic Sans MS", fontSize: 13, fontWeight: "bolder" } ).setName('txt_hp');
            txt_hp.anchor.set(0,0.5);
            txt_hp.x = 30;
        const Bar_hp = new PIXI.Sprite( $app.renderer.generateTexture( 
            new PIXI.Graphics().beginFill(0xd60000).drawRect(0, 8, 86, 10).endFill() )).setName('Bar_hp');
            Bar_hp.parentGroup = $displayGroup.DiffuseGroup;
            Bar_hp.anchor.set(0,0.5);
            BattlerBgBar_hp.addChild(Bar_hp,txt_hp);
        //! data2\GUI\huds\combats\SOURCE\images\BattlerBgBar.png
        const BattlerBgBar_timer = $objs.ContainerDN(dataBase, 'BattlerBgBar','BattlerBgBar_timer');
            BattlerBgBar_timer.d.anchor.set(0,0.5);
            BattlerBgBar_timer.n.anchor.set(0,0.5);
            BattlerBgBar_timer.position.set(-42,58);
        const txt_time = new PIXI.Text('???',{ fill: "white", fontFamily: "Comic Sans MS", fontSize: 13, fontWeight: "bolder" } ).setName('txt_time');
            txt_time.anchor.set(0,0.5);
            txt_time.x = 30;
        const Bar_time = new PIXI.Sprite( $app.renderer.generateTexture( 
            new PIXI.Graphics().beginFill(0x373737).drawRect(0, 8, 86, 10).endFill() )).setName('Bar_time');
            Bar_time.parentGroup = $displayGroup.DiffuseGroup;
            Bar_time.anchor.set(0,0.5);
            BattlerBgBar_timer.addChildAt(Bar_time,0);
            BattlerBgBar_timer.addChild(txt_time);
        //! data2\Icons\HeadIcons\SOURCE\images\hico_p0.png
        // Est swapper durant debut combat
        const HeadIcon = $objs.ContainerDN(dataBase3, 'hico_p0','HeadIcon');
            HeadIcon.scale.set(0.6);
            HeadIcon.d.anchor.set(0.5);
            HeadIcon.n.anchor.set(0.5);
        //#end
        this.addChild(SelectorBG,BattlerBgBar_hp,BattlerBgBar_timer,HeadIcon);
    };

     /** interaction du combatSlot */
     initialize_interactions(){
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
    /** config setup sur current battler */
    show(battlerID){
        this._battlerID = battlerID;
        this.update_timer();
        this.swapHeadTexture();
        this.renderable = true;
    }
    hide(){
        this._battlerID = null;
        this.renderable = false;

    }
    swapHeadTexture(){
        const HeadIcon = this.child.HeadIcon;
        const dataBase = $loader.DATA2.HeadIcons;
        const textureName = 'hico_'+this.Battler.DataBattlers._dataBaseName;
        HeadIcon.d.texture = dataBase.textures[textureName];
        HeadIcon.n.texture = dataBase.textures_n[textureName];
    }
    /** update le timer */
    update_timer(timer){
        if(timer){
            /*const ratio = -(this.battler._battleTime/_Combats._timeLimit)+1;
            this.child.combatTimerBar_progress.scale.x = ratio;
            this.child.TimerTxt.text = Math.floor(this.battler._battleTime*100)/100;*/
        }
        const ratio_time = (this.Battler._battleTime/_Combats.Active._timeLimit);
        const ratio_hp = (this.Battler._currentHP/this.Battler._currentHP);
        this.child.txt_hp.text = String(~~this.Battler._currentHP);
        this.child.txt_time.text = String(Math.ceil(this.Battler._battleTime))
        this.child.Bar_hp.scale.x = ratio_hp;
        this.child.Bar_time.scale.x = ratio_time;
    }

    /** focus show selectForSource */
    startTurn(value){
        gsap.to(this.position, 0.5,{x:-50})
        this.child.HeadIcon.d.filters = [$systems.PixiFilters.OutlineFilterx4white];
    }

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