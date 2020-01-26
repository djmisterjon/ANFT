
/*:
// PLUGIN □──────────────────────────────□HUBS STAMINA ENGINE□───────────────────────────────┐
* @author □ Jonathan Lepage (dimisterjon),(jonforum) 
* V.0.1a
* License:© M.I.T
└─────────────────────────────────────────────────────────────────────────────────────────┘
*/



/** huds qui affiche le stamina et le displacement */
class _Huds_Travel extends _Huds_Base {
    constructor(options) {
        super(options);
        /** Stamina actuel dans le travelHud */
        this._stamina = 0;
        /** @type {{colorsOrb:Array.<String>, colorsItem:Array.<String>, values:Array.<Number>}} */
        this.result = {colors:[],values:[]};
        /** indique lorsque shaker, si ready pour roll onRelease */
        this._ready = false;
        /** global game travelValueUsed */
        this._travelValueUsed = 0;
        /** list des pinSlotId attache au slots */
        this.slotsContentsId = new Array(3);
        /** Indicateur si show ou hide */
        this._showed = false;
        /** @type {{ 'Master':ContainerDN, 'Gear_Center':ContainerDN, 'Gear_Top':ContainerDN, 
         * 'FlashLight':ContainerDN, 'Gear_backDeco':ContainerDN, 'Gear_Bottom':ContainerDN,
         * 'TravelPointTxt':PIXI.Text, 'TravelSlot':Array.<__TravelSlot>,  }} */
        this.child = null;

    };
    //#region [GetterSetter]
    /** return stamina left from result */
    get sta() { 
        return this._stamina;//this.result && this.result.total-this._staminaUse || 0 }; // return only UI
    }
    set sta(value) { 
        this._stamina = value;
        this.updateTxtValue();
    }
    //#endregion

    //#region [Initialize]
    initialize() {
        this.initialize_main();
        this.child = this.childrenToName();
        this.initialize_interactions();
        this.position.set(200,885);
    }

    /**build main frame */
    initialize_main(){
        const dataBase = $loader.DATA2.Hud_Travels;
        const dataBase2 = $loader.DATA2.travelEnergyFx;
        const Master = new PIXI.Container().setName("Master");
        //# data2\GUI\huds\travel\SOURCE\images\hTravel_Gearing.png
        const Gear_Bottom = $objs.ContainerDN(dataBase,'hTravel_Gearing','Gear_Bottom');
        Gear_Bottom.d.anchor.set(0.5);
        Gear_Bottom.n.anchor.set(0.5);
        //# data2\GUI\huds\travel\SOURCE\images\hTravel_CenterCircle.png
        const Gear_Center = $objs.ContainerDN(dataBase,'hTravel_CenterCircle','Gear_Center');
        Gear_Center.d.anchor.set(0.5);
        Gear_Center.n.anchor.set(0.5);
        //# data2\GUI\huds\travel\SOURCE\images\hTravel_TopCircle.png
        const Gear_Top = $objs.ContainerDN(dataBase,'hTravel_TopCircle','Gear_Top');
        Gear_Top.d.anchor.set(0.5);
        Gear_Top.n.anchor.set(0.5);
        //# data2\GUI\huds\travel\SOURCE\images\hTravel_flashLight.png
        const FlashLight = $objs.ContainerDN(dataBase,'hTravel_flashLight','FlashLight');
        FlashLight.position.set(-159,-98);
        FlashLight.d.anchor.set(0,1);
        FlashLight.n.anchor.set(0,1);
        // #slots
        const TravelSlots = []
        for (let i=0; i<7; i++) { //todo make classes
            const TravelSlot = new __TravelSlot(i);
            TravelSlots[i] = TravelSlot;
        }
        //# data2\GUI\huds\travel\SOURCE\images\hTravel_Gearing.png
        const Gear_backDeco = $objs.ContainerDN(dataBase,'hTravel_Gearing','Gear_backDeco');
            Gear_backDeco.position.setZero(-154,-96);
            Gear_backDeco.scale.set(0.5);
            Gear_backDeco.d.anchor.set(0.5);
            Gear_backDeco.n.anchor.set(0.5);
         //# Txt stamina
         const TravelPointTxt = new PIXI.Text('setup'.toUpperCase(),$systems.styles[10]).setName('TravelPointTxt');
            TravelPointTxt.scale.set(0.7)
            TravelPointTxt.anchor.set(0.5);
        //# FX1 Big circle
            /*const FX1 = $objs.ContainerDN(dataBase2,'FXEnergieA','FX1');
                FX1.child.parentGroup = $displayGroup.group[0]
                FX1.child.child.a.anchor.set(0.5);
                //fx.child.child.a.tint = 0xb5a900
                FX1.child.scale.set(0.9);
                FX1.child.child.a.loop = true;
                FX1.child.child.a.animationSpeed = 0.4;*/
        //!end
        Master.addChild(Gear_Bottom,FlashLight,Gear_Center,...TravelSlots,TravelPointTxt,Gear_Top);
        this.addChild(Gear_backDeco,Master);
    };

    initialize_interactions() {
        const Gear_Top = this.child.Gear_Top;
        const Master = this.child.Master;
        Master.interactive = true;
        Master.hitArea = Gear_Top.getBounds();
        Master.hitArea.pad(-100);
        Master.on('pointerover'      , this._pointerover ,this);
        Master.on('pointerout'       , this._pointerout  ,this);
        Master.on('pointerdown'      , this._pointerdown ,this);
        Master.on('pointerup'        , this._pointerup   ,this);
        Master.on('pointerupoutside' , this._pointerup   ,this);
        const Gear_backDeco = this.child.Gear_backDeco;
        Gear_backDeco.interactive = true;
        Gear_backDeco.on('pointerover' , this._pointerover_Gear_backDeco ,this);
        Gear_backDeco.on('pointerout'  , this._pointerout_Gear_backDeco  ,this);
        Gear_backDeco.on('pointerup'   , this._pointerup_Gear_backDeco   ,this);
    }
    //#endregion

    //#region [Interactive]
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    _pointerover(e) {
        const Master = this.child.Master;
        const Gear_Top = this.child.Gear_Top;
        const Gear_backDeco = this.child.Gear_backDeco;
        const point = Gear_Top.getGlobalPosition(undefined,true);
        gsap.to(Gear_backDeco, 0.4, {rotation:`+=${0.2}`});
        gsap.to(Master.scale, 0.3  , { x:1.1, y:1.1, ease: Back.easeOut.config(1.1) });
        gsap.fromTo(Gear_Top, 10, { rotation:Gear_Top.rotation, }, 
            { id:"travelGear_Top_rotation", rotation: Gear_Top.rotation-Math.PI*2, ease: Power0.easeNone, repeat:-1 })
            .eventCallback("onUpdate", ()=>{
                const x = ($mouse.xx-point.x)/20;
                const y = ($mouse.yy-point.y)/20;
                Gear_Top.x+= (x-Gear_Top.x)*0.07;
                Gear_Top.y+= (y-Gear_Top.y)*0.07;
            })
    }

    /** @param {PIXI.interaction.InteractionEvent} e -*/
    _pointerout(e) {
        gsap.killTweenById('travelGear_Top_rotation');
        const Master = this.child.Master;
        const Gear_Top = this.child.Gear_Top;
        this.idleRotation();
        gsap.to(Master.scale, 0.3  , { x:1, y:1, ease: Power3.easeOut });
        gsap.to(Gear_Top, 1.2, {x:0,y:0, ease:Power2.easeOut});
    }

    /** @param {PIXI.interaction.InteractionEvent} e -*/
    _pointerdown(e) {
        if(e.currentTarget !== e.target){return};// car les _TravelSlot sont child de hudTravel
        const canRoll = this.canRoll(); // si ne repond pas au condition, le roll sera canceller
        const shaker = RoughEase.ease.config({ 
            template:  Power4.easeOut, strength: 2, points: 35, taper: "in", randomize: false, clamp: false
        });
        const tl = gsap.timeline({id:'shakeRoll'});
        tl.fromTo(this.child.Gear_Center.scale, 1.5, { x: 0.8, y: 0.8 },{ x: 1, y: 1, ease: shaker },0)
        tl.to(this.child.Gear_Top, 1.5, { rotation:`+=${Math.PI*4}`, ease:Back.easeIn.config(1) },0)
        tl.to(this.child.Gear_Bottom, 1.5, { rotation:`-=${Math.PI*2}`, ease:Back.easeIn.config(1) },0)
        tl.to(this.child.Gear_backDeco, 1.5, { rotation:`+=${Math.PI*1.5}`, ease:Back.easeIn.config(1) },0)
        tl.to(this.child.FlashLight, 0.5, { rotation:-0.14, } ,0);
        tl.fromTo(this.child.FlashLight, 0.08, { rotation:-0.14, },{ rotation:0, ease:Power0.easeNone,repeat:15,immediateRender:false, },0.5)
        tl.fromTo(this.child.TravelSlot.map((s)=>s.position), 1.4,
            { x:(i,o)=>o.zero.x, y:(i,o)=>o.zero.y, },
            { x: 0, y: 0, ease: SlowMo.ease.config(0.6, 0.9, false) },0.1);
        tl.fromTo(this.child.TravelSlot.map((s)=>s.scale), 1.4,
        { x:1, y:1, },
        { x: 0.6, y: 0.6, ease: SlowMo.ease.config(0.2, 0.75, false) },0.1);
        tl.add(()=>{
            //! test fx deleteme
            const fx = $objs.create($loader.DATA2.travelEnergyFx,'FXEnergieA');
                fx.child.parentGroup = $displayGroup.group[0]
                fx.child.child.a.anchor.set(0.5);
                //fx.child.child.a.tint = 0xb5a900
                fx.child.scale.set(0.9);
                fx.child.child.a.loop = false;
                fx.child.child.a.animationSpeed = 0.4;
                this.addChild(fx.child);
        },0.2)
        tl.add(()=>{
            //! test fx deleteme
            const fx = $objs.create($loader.DATA2.travelEnergyFx,'FxEnergieB');
                fx.child.parentGroup = $displayGroup.group[0]
                fx.child.child.a.anchor.set(0.5);
                //fx.child.child.a.tint = 0xb5a900
                fx.child.scale.set(1.5);
                fx.child.child.a.loop = false;
                fx.child.child.a.animationSpeed = 0.5;
                this.addChild(fx.child);
        },1.5)
        tl.add(()=>{
            if(!canRoll){
                return this.cancelRoll(false);
            }
            this._ready = true;
        },1)
        tl.add(()=>{
            gsap.fromTo(this.child.FlashLight, 1, { rotation:-0.3, },{ rotation:0, ease:Bounce.easeOut, });
            gsap.to(this.child.TravelSlot.map((s)=>s.position), 0.6, { x:(i,o)=>o.zero.x, y:(i,o)=>o.zero.y, ease:Elastic.easeOut.config(1, 0.3) });
            gsap.to(this.child.TravelSlot.map((s)=>s.scale), 0.6, { x:1, y:1, ease:Elastic.easeOut.config(1, 0.3) });
            this._ready = false;
            this.startRoll();
        },1.5)
    }

    _pointerup(e) {
        if(gsap.killTweenById('shakeRoll')){
            if(this._ready){ 
                this.startRoll();
            }else{ // cancel
                this.cancelRoll(true);
            }
        }
    }

    /** @param {PIXI.interaction.InteractionEvent} e -*/
    _pointerover_Gear_backDeco(e){
        const Gear_backDeco = this.child.Gear_backDeco;
        Gear_backDeco.d.filters = [$systems.PixiFilters.OutlineFilterx4white];
    }
    _pointerout_Gear_backDeco(){
        const Gear_backDeco = this.child.Gear_backDeco;
        Gear_backDeco.d.filters = null;
    }
    _pointerup_Gear_backDeco(){
        this._showed? this.hide() : this.show();
    }
    //#endregion
    
    //#region [Method]
    /**Affiche le huds */
    show(){
        this._showed = true;
        this.renderable = true;
        const Master = this.child.Master;
        const Gear_backDeco = this.child.Gear_backDeco;
        const Gear_Center = this.child.Gear_Center;
        const Gear_Bottom = this.child.Gear_Bottom;
        gsap.to(Master, 0.7, {x:0, ease:Back.easeOut.config(1) });
        gsap.to(Gear_Bottom, 0.7, {rotation:`+=${Math.PI}`, ease:Back.easeOut.config(1) });
        gsap.fromTo(Gear_Center, 1, {rotation:-Math.PI},{rotation:0});
        gsap.fromTo(Gear_Center.scale, 0.7, {x:0.3,y:0.3},{x:1,y:1, ease:Power2.easeInOut });
        gsap.to(Gear_backDeco, 0.7, {
            x:Gear_backDeco.position.zero.x, rotation:`-=${Math.PI*2}`, 
            ease:Back.easeOut.config(1) 
        }).eventCallback("onComplete", ()=>{
            this.idleRotation();
            Gear_Center.interactive = true;
        })
    }

    hide(){
        this._showed = false;
        const Master = this.child.Master;
        const Gear_backDeco = this.child.Gear_backDeco;
        const Gear_Center = this.child.Gear_Center;
        Gear_Center.interactive = false;
        this.idleRotation(false);
        gsap.to(Master, 0.7, {x:-Master.width, ease:Back.easeOut.config(1.2) });
        gsap.to(Gear_backDeco, 0.7, {x:-270, rotation:`+=${Math.PI*2}`, ease:Back.easeOut.config(1.2) });
    }

    idleRotation(active=true){
        if(!"option animate travelSlots"){ return };
        const Master = this.child.Master;
        const Gear_Bottom = this.child.Gear_Bottom;
        const Gear_Top = this.child.Gear_Top;
        const Gear_backDeco = this.child.Gear_backDeco;
        if(active){
            gsap.to(Gear_Bottom  , 190 , { rotation:Gear_Bottom  .rotation-Math.PI*2, ease: Power0.easeNone, repeat:-1 });
            gsap.to(Gear_backDeco, 190 , { rotation:Gear_backDeco.rotation+Math.PI*2, ease: Power0.easeNone, repeat:-1 });
            gsap.to(Gear_Top     , 90, { rotation:Gear_Top     .rotation+Math.PI*2, ease: Power0.easeNone, repeat:-1 });
        }else{
            gsap.killTweensOf(Master);
            gsap.killTweensOf(Gear_Bottom);
            gsap.killTweensOf(Gear_backDeco);
            gsap.killTweensOf(Gear_Top);
        }
    }

    addToSlot(travelSlotId,pinSlotId,holding=$mouse.holding){
        if( this.slotsContentsId.contains(pinSlotId) ){ // si a deja un pinSlotId attacher? clear car 1 seul pinSlot par travelSlot
            const index = this.slotsContentsId.indexOf(pinSlotId);
            if(travelSlotId!==index){ // si pas sur le meme slot
                this.TravelSlots[index].clear();
                this.slotsContentsId[index] = null;
            };
        };
        //todo: pass test, qty
        this.TravelSlots[travelSlotId].addToSlot(pinSlotId);
        this.slotsContentsId[travelSlotId] = pinSlotId;
        $mouse.clear();
    }


    /** return true, if we can roll stamina with current slot setup or other status */
    canRoll(){
        if($mouse.holding){return false};
        if(__TravelSlot.OrbsItemsInfused.filter(o=>o && o.DataItem.isDice).length<1){ // min 1 dicegem
            return false;
        }
        return true;
    }

    /** cancel un roll 
     * @param {Boolean} canRoll - Si canRoll ne produit pas alert!, sinon expliquer les raisons du cantRoll
    */
    cancelRoll(canRoll){
        gsap.killTweenById('shakeRoll');
        gsap.fromTo(this.child.Gear_Center.scale, 0.6, { x: 0.8, y: 0.8 },{ x: 1, y: 1 } );
        gsap.fromTo(this.child.FlashLight, 1, { rotation:-0.3, },{ rotation:0, ease:Bounce.easeOut, }) //deleteme
        gsap.to(this.child.TravelSlot.map((s)=>s.position), 0.6, { x:(i,o)=>o.zero.x, y:(i,o)=>o.zero.y, ease:Elastic.easeOut.config(1, 0.3) });
        gsap.to(this.child.TravelSlot.map((s)=>s.scale), 0.6, { x:1, y:1, ease:Elastic.easeOut.config(1, 0.3) });
        this.idleRotation();
        if(!canRoll){
            $mouse.showHelpBox('___cancelRoll');
        }
    }
    

    /** roll dice */
    startRoll() {
        //! setup
        $audio._sounds.JMP_A.play("JMP_A4").speed = 1;
        $audio._sounds.JMP_A.play("JMP_A5").speed = 0.5;
        //!tween
        TweenLite.fromTo(this.scale, 2  , { x:'+=0.43', y:'+=0.4' },{ x:1, y:1, ease: Elastic.easeInOut.config(0.8, 0.3) });
        TweenLite.fromTo(this.child.TravelSlot.map(s=>s.scale), 1, { x: 1.3, y: 1.3 },{ x: 1, y: 1, ease: Elastic.easeOut.config(0.9, 0.3) })
        //!result
        const result = this.result = this.computeRoll();
        result.values.push($players.p0.STA);
        this.onCompletteRoll(result);
    }

    /** Calcul le stamina et l'affectation des slots
     * @typedef {{colorsOrb: string, colorsItem:string, values:number}} ResultTravel
     * @returns ResultTravel
    */ 
    computeRoll() {
         /**@type {Array.<_Items._Orb>}*/
        let Orbs = [];
         /**@type {Array.<_Items._Item>}*/
        let Item = [];
        for (let i=0, l=this.slotsContentsId.length; i<l; i++) {
            if(Number.isFinite(this.slotsContentsId[i])){
                const pinSlotId = this.slotsContentsId[i];
                Orbs.push($gui.PinBar.pinnedOrbs [pinSlotId].Data);
                Item.push($gui.PinBar.pinnedItems[pinSlotId].Data);
            };
        };
        const colorsOrb  = Orbs.map(o =>o ._cType);//!extract color Orbs
        const colorsItem = Item.map(it=>it._cType);//!extract color Items
        const values     = Item.map(it=>it.dmg   );//!extract dmg Items
        return {colorsOrb,colorsItem,values};
    };

    /** roll terminer */
    onCompletteRoll(result){
        //!inject les puissance Orbic au 2 players.
        // pour le player 2 ces une options
        this.sta = 126 //result.values.sum();
        $players.updateOrbic();
        $gui.GameSteps.setStep(1);//deleteme:
    };

    /** add value to _staminaUse */
    addValue(value) {
        this.sta+=value;
        this.updateTxtValue();
    };

    updateTxtValue(){
        this.child.TravelPointTxt.text = this.sta;
        TweenMax.fromTo(this.child.TravelPointTxt.scale, 2, {x:1.2,y:1.2},{ x:1, y:1, ease: Elastic.easeOut.config(1.2, 0.1) });
        TweenMax.fromTo(this.scale, 2, {x:1.2,y:1.2},{ x:1, y:1, ease: Elastic.easeOut.config(1.2, 0.2) });
    };
    //#endregion
};

/** Lwa pinslot pour attche des items orbic */
class __TravelSlot extends PIXI.Container {
    /**the radius as a constant */
    static RADIUS = 122;
    /** Total de slots */
    static QUADRAN = 8;
    /**THETA is the angle of separation between each elemtents  */
    static get THETA() { return 2 * Math.PI / this.QUADRAN };

    /** @type {Array.<_SpriteMixOrbItem>} */
    static OrbsItemsInfused = [];
    /**@param {Number} id */
    constructor(id) {
        super();
        this._id = id;
        this.name = 'TravelSlot';
        /** @type {{ 'Slot':ContainerDN,  }} */
        this.child = null;
        this.initialize();
    };
    //#region [GetterSetter]
    get OrbsItemsInfused() {
        return __TravelSlot.OrbsItemsInfused[this._id];
    };
    //#endregion
    //#region [Initialize]
    initialize(id) {
        this.initialize_base()
        this.initialize_interactions()
        this.initialize_position();
        this.child = this.childrenToName()
        this.hitArea = this.getLocalBounds();
    };
        
    initialize_base() {
        const dataBase = $loader.DATA2.Hud_Travels;
        //# data2\GUI\huds\travel\SOURCE\images\travelSlotRing.png
        const Slot = $objs.ContainerDN(dataBase,'travelSlotRing','Slot');
            Slot.d.anchor.set(0.5);
            Slot.n.anchor.set(0.5);
        this.addChild(Slot);
    };

    initialize_position(){
        var currentAngle = (this._id-1) * __TravelSlot.THETA; // calculate the current angle
        const x = __TravelSlot.RADIUS * Math.cos(currentAngle); 
        const y = __TravelSlot.RADIUS * Math.sin(currentAngle);
        this.position.setZero(x,y);
    };

    initialize_interactions() {
        this.interactive = true;
        this.on('pointerover'       , this.pointerover_TravelSlot    , this);
        this.on('pointerout'        , this.pointerout_TravelSlot   , this);
        this.on('pointerup'         , this.pointerup_TravelSlot    , this);
    };
    
    //#endregion
    
    //#region [Interactive]
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerover_TravelSlot(e){
        const Slot = this.child.Slot;
        Slot.d.filters = [$systems.PixiFilters.OutlineFilterx4white];
    };
    pointerout_TravelSlot(e){
        const Slot = this.child.Slot;
        Slot.d.filters = null;
    };
    pointerup_TravelSlot(e){
        const SpriteMixOrbItem = $mouse.holding;
        if(SpriteMixOrbItem && SpriteMixOrbItem.isOrbItem){
            $mouse.clear();
            if(this.OrbsItemsInfused){
                this.removeChild(this.OrbsItemsInfused);//!clear
                __TravelSlot.OrbsItemsInfused[this._id] = null;
            };
            SpriteMixOrbItem.position.set(0);
            SpriteMixOrbItem.pivot.set(0);
            this.addChildAt(SpriteMixOrbItem,0);
            __TravelSlot.OrbsItemsInfused[this._id] = SpriteMixOrbItem;
        }
    };
    //#endregion


};
