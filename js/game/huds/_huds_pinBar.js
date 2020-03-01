/*:
// PLUGIN □──────────────────────────────□HUBS CORE ENGINE□───────────────────────────────┐
* @author □ Jonathan Lepage (dimisterjon),(jonforum) 
* V.0.2a
* License:© M.I.T
└─────────────────────────────────────────────────────────────────────────────────────────┘
*/
/**Hud qui control les PinBar et affiche les options 
*/
class _Huds_PinBar extends _Huds_Base {
    constructor(options) {
        super(options);
        /**@type {Array.<_Items._ItemsSprite>} - pool ItemsSprite pinner comme orb */
        this.pinnedOrbs = new Array(7);
        /**@type {Array.<_Items._ItemsSprite>} - pool ItemsSprite pinner comme item */
        this.pinnedItems = new Array(7);
        /** indicateur du mode options our pinBar */
        this._optionsMode = false;
        /**@type {Array.<__PinSlot>} - liste des pinSlots*/
        this.pinSlots = new Array(7);
        /**@type {Array.<__PinOption>} - liste des OptionSlot */
        this.optSlots = new Array(7);
        /** Indicateur si la pinBar affiche les options */
        this._pinOptionShowed = false;
        /** @type {{ Bar:ContainerDN, Rotator:ContainerDN, Bag:ContainerDN, PinSlotContainer:PIXI.Container, PinOptionContainer:PIXI.Container }} */
        this.child = null;
        
    };

    //#region [Static]
    /** return un slot options slelected, pour combat ou autre utiliter. */
    get selected() {
        return this.optSlots.find(function(slot) {
            return slot._selected;
          });
    };
    //#endregion

    //#region [Initialize]
    initialize(options) {
        this.initialize_base();
        this.initialize_interactions();
        this.position.set(25, 1060); // basic position.
       // $systems.debug(this); //DELETEME;
       // this.initialize_bag();
       // this.initialize_rotator();
       // this.child = this.childrenToName();
       // this.initialize_interactions();
       // this.initialize_setup();
       //DELETEME: debug ajouter rapidment un orb et items au slots 0
       /*this.addToSlot($items.Orbs[0],0);
       this.addToSlot($items.Items[0],0);
       this.addToSlot($items.Orbs[1],1);
       this.addToSlot($items.Items[1],1);
       this.addToSlot($items.Orbs[2],2);
       this.addToSlot($items.Items[16],2);
       this.addToSlot($items.Orbs[4],4);
       this.addToSlot($items.Items[8],4);*/
    };

    /** Ini pinBar */
    initialize_base() {
        const dataBase  = $loader.DATA2.hudsPinBar;
        const Master = new PIXI.Container().setName('Master');
        //#" data2\GUI\huds\pinBar\SOURCE\images\pinSlot_rotator.png
        const Rotator = $objs.ContainerDN(dataBase,'pinSlot_rotator','Rotator');
        Rotator.position.set(-10,20)
            Rotator.d.anchor.set(0.5);
            Rotator.n.anchor.set(0.5);
        //#" data2\GUI\huds\pinBar\SOURCE\images\ButtonBag.png
        const Bag = $objs.ContainerDN(dataBase,'ButtonBag','Bag');
            Bag.position.set(-30,-48);
            Bag.d.anchor.set(0.5);
            Bag.n.anchor.set(0.5);
        //#" data2\GUI\huds\pinBar\SOURCE\images\pinslot_Bar.png
        const Bar = $objs.ContainerDN(dataBase,'pinslot_Bar','Bar');
            Bar.position.setZero(-860,0);
            Bar.d.anchor.set(0,0.5);
            Bar.n.anchor.set(0,0.5);
        //#PinSlot
        const PinSlotContainer = new PIXI.Container().setName("PinSlotContainer");
            PinSlotContainer.x = 1235;
            for (let i=0, l=7; i<l; i++) {
                const PinSlot = new __PinSlot(i);
                PinSlotContainer.addChild(PinSlot);
            };
        //#PinOptions
        const PinOptionContainer = new PIXI.Container().setName("PinOptionContainer");
            PinOptionContainer.x = 380;
            for (let i=0, l=_GUI.Menues.length; i<l; i++) {
                const menuName = _GUI.Menues[i];
                const PinOption = new __PinOption(i,menuName);
                PinOptionContainer.addChild(PinOption);
            };
        Bar.addChild(PinSlotContainer,PinOptionContainer);
        //!END
        Master.addChild(Bar,Bag,Rotator);
        this.addChild(Master);
        this.child = this.childrenToName();
        
    };

    initialize_interactions() {
        const Bag = this.child.Bag;
        Bag.interactive = true;
        Bag.on('pointerover'       , this.pointerover_Bag      , this);
        Bag.on('pointerout'        , this.pointerout_Bag       , this);
        Bag.on('pointerup'         , this.pointerup_Bag        , this);
    };
    

    //#endregion

    //#region [Interactive]
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerover_Bag(e) {
        const Bag = e.currentTarget;
        gsap.to(Bag.scale, {x:1.2,y:1.2})
    };
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerout_Bag(e) {
        const Bag = e.currentTarget;
        gsap.to(Bag.scale, {x:1,y:1})
    };
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerup_Bag(e) {
        const Bag = e.currentTarget;
        this.togglePinBarSlide();
    };
    //#endregion

    //#region [Method]
    show(){
        this.renderable = true;
    };

    /** cacher completement en mode combat */
    hide(){
        const PinBar = this.child.Bar;
        const Rotator = this.child.Rotator;
        Inspectors.DisplayObj(PinBar)
    }
    
    togglePinBarSlide(value = !this._pinOptionShowed){
        if(value !== this._pinOptionShowed){
            const PinBar = this.child.Bar;
            const Rotator = this.child.Rotator;
            if(value){//half
                gsap.to(PinBar.position, 0.3, {x:0, ease: Back.easeInOut.config(1.4) });
                gsap.to(Rotator, 0.34, {rotation:`+=${Math.PI}`, ease: Back.easeInOut.config(1.6) });
            }else{//full
                gsap.to(PinBar.position, 0.3, {x:PinBar.position.zero.x, ease: Back.easeInOut.config(1.3) });
                gsap.to(Rotator, 0.34, {rotation:`-=${Math.PI}`, ease: Back.easeInOut.config(1.6) });
            }
            this._pinOptionShowed = value;
        }
    };

    /** toggle entre showOptions ou show PinBar */
    showOptions(modeOption = !this._optionsMode){
        this._optionsMode = modeOption;
        const PinBar = this.child.PinBar;
        const Rotator = this.child.Rotator;
        if(modeOption){
            this.optSlots.forEach(slot => { slot.renderable = true });
            TweenLite.to(PinBar, 0.7, { rotation: -Math.PI / 2, ease: Elastic.easeInOut.config(0.8, 0.6) });
            TweenLite.to(PinBar.position, 0.6, { x: -200,y:120, ease: Power4.easeInOut });
            TweenLite.to(Rotator, 0.6, { rotation:-(Math.PI*2), ease: Back.easeInOut.config(1.7) });
        }else{
            this.optSlots.forEach(slot => { slot.renderable = true });
            TweenLite.to(PinBar, 0.7, { rotation: 0, ease: Elastic.easeInOut.config(0.8, 0.6) });
            TweenLite.to(PinBar.position, 0.6, { x: 0,y:0, ease: Power4.easeInOut });
            TweenLite.to(Rotator, 0.6, { rotation:0, ease: Back.easeInOut.config(1.7) });

        };
    };

    /** attache a orbs or items 
     * @param Data {_Items._Orb|_Items._Item}
    */
    addToSlot(Data,pinSlotId){
        const PinSlot = this.pinSlots[pinSlotId];
        //! si Orb
        if(Data.isOrb){
            //si vide ?
            if(!Data.qty){ return console.log1(`${Data.name}: na pas suffisament orb`);}
            // si a deja un orb, remove
            PinSlot.remove( this.pinnedOrbs [pinSlotId] );
            PinSlot.remove( this.pinnedItems[pinSlotId] );
            this.pinnedOrbs [pinSlotId] = null;
            this.pinnedItems[pinSlotId] = null;

            this.pinnedOrbs[pinSlotId] = PinSlot.add(Data);
            $mouse.add(null);
        };
        //! is item et pinSlot a un orb
        if(Data.isItem && this.pinnedOrbs[pinSlotId] ){
            // si a deja un orb, remove
            const Orb = this.pinnedOrbs[pinSlotId].Data;

            if( (Orb._cType === Data._cType) || Data.isDice ){
                PinSlot.remove( this.pinnedItems[pinSlotId] );
                this.pinnedItems[pinSlotId] = PinSlot.add(Data);
            }
            $mouse.add(null);
        };
    };


    /** copy le contenue d'un slots vers cursor */
    getItemFromSlot(pinSlotId){
        if(this.pinnedOrbs[pinSlotId] && this.pinnedItems[pinSlotId]){
            this.pinSlots[pinSlotId].getItemFromSlot();
        };
    };

    /** transfer (swap) slots content */
    transferSlot(from_pinSlotId,to_pinSlotId){
        $mouse.add(null);
        const swapFrom = [ this.pinnedOrbs[from_pinSlotId], this.pinnedItems[from_pinSlotId] ];
        const swapTo = [ this.pinnedOrbs[to_pinSlotId], this.pinnedItems[to_pinSlotId] ];
        this.pinnedOrbs [from_pinSlotId] = swapTo  [0];
        this.pinnedItems[from_pinSlotId] = swapTo  [1];
        this.pinnedOrbs [to_pinSlotId  ] = swapFrom[0];
        this.pinnedItems[to_pinSlotId  ] = swapFrom[1];
        swapTo.forEach(ItemsSprite => { ItemsSprite && this.pinSlots[from_pinSlotId].transferSlot(ItemsSprite) });
        swapFrom.forEach(ItemsSprite => { ItemsSprite && this.pinSlots[to_pinSlotId].transferSlot(ItemsSprite) });
        
    };

    /** focus alpha les slots de transfer, lorsque holding un orb du PinBar: permet de swapper */
    focusTransferSlot(from_pinSlotId,to_pinSlotId){
        const clear = (from_pinSlotId === to_pinSlotId);
        for (let i=0,arr=[from_pinSlotId,to_pinSlotId], l=this.pinSlots.length; i<l; i++) {
            const slot = this.pinSlots[i];
            slot.alpha = arr.contains(slot._id)? 1: clear && 1 || 0.3;
        };
    };

    //#endRegion
};


/**@class creer les pinslots qui contien les pinOrbs et items */
class __PinSlot extends PIXI.Container {
    /** @type {Array.<_SpriteOrb>} - Orbs infuser dans les slots par id*/
    static OrbsInfused = [];
    /** @type {Array.<_SpriteItem>} */
    static ItemsInfused = [];
    constructor(id) {
        super();
        this.name = 'Pinslot';
        /** pinSlot index */
        this._id = id;
        /** @type {{ 'ValueRec':ContainerDN, 'TopCorner':ContainerDN, 'SlotButton':ContainerDN, 'BottomCorner':ContainerDN, 'Lock':ContainerDN, }} */
        this.child = null;
        this.initialize();
    };
    //#region [GetterSetter]
    get OrbInfused() { return __PinSlot.OrbsInfused[this._id] };
    get ItemInfused() { return __PinSlot.ItemsInfused[this._id] };
    //#endregion

    //#region [Initialize]
    initialize() {
        this.initialize_base();
        this.position.set(this._id*95,0);
        this.setLock(this._id>0); //todo: 2 type de lock, achat et charme malus
        this.initialize_interactions();
       //this.clear(true);
    };

    initialize_base(){
        const dataBase  = $loader.DATA2.hudsPinBar;
        const dataBase2  = $loader.DATA2.MiscIcons;
        //#" data2\GUI\huds\pinBar\SOURCE\images\pinslot_valueRec.png
        const ValueRec = $objs.ContainerDN(dataBase,'pinslot_valueRec','ValueRec');
            ValueRec.position.set(0,13);
            ValueRec.d.anchor.set(0.5,1);
            ValueRec.n.anchor.set(0.5,1);
        //#" data2\GUI\huds\pinBar\SOURCE\images\pinSlot_slot_top.png
        const TopCorner = $objs.ContainerDN(dataBase,'pinSlot_slot_top','TopCorner');
            TopCorner.position.set(0,-67);
            TopCorner.d.anchor.set(0.5);
            TopCorner.n.anchor.set(0.5);
        //#" data2\GUI\huds\pinBar\SOURCE\images\pinSlot_slot.png
        const SlotButton = $objs.ContainerDN(dataBase,'pinSlot_slot','SlotButton');
            SlotButton.position.set(0,-45);
            SlotButton.d.anchor.set(0.5);
            SlotButton.n.anchor.set(0.5);
        //#" data2\GUI\huds\pinBar\SOURCE\images\pinSlot_slot_bottom.png
        const BottomCorner = $objs.ContainerDN(dataBase,'pinSlot_slot_bottom','BottomCorner');
            BottomCorner.position.set(0,-25);
            BottomCorner.d.anchor.set(0.5);
            BottomCorner.n.anchor.set(0.5);
        //# data2\Icons\Misc\SOURCE\images\cadenas.png
        const Lock = $objs.ContainerDN(dataBase2,'cadenas','Lock');
            Lock.position.set(0,-45);
            Lock.d.anchor.set(0.5);
            Lock.n.anchor.set(0.5);
            Lock.renderable = false;
        //!end
        this.addChild(BottomCorner,TopCorner,SlotButton,Lock,ValueRec);
        this.child = this.childrenToName();
    };

    initialize_interactions() {
        const SlotButton = this.child.SlotButton;
        SlotButton.interactive = true;
        SlotButton.on('pointerover'       , this.pointerover_SlotButton      , this);
        SlotButton.on('pointerout'        , this.pointerout_SlotButton       , this);
        SlotButton.on('pointerup'         , this.pointerup_SlotButton        , this);
    };
    
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    //#endregion

    //#region [Interactive]
    /**@param {PIXI.interaction.InteractionEvent} e */
    pointerover_SlotButton(e) {
        const global = this.child.SlotButton.getGlobalPosition();
        if ($mouse.holding) {
            $mouse._freezeHold = true;
            TweenLite.to($mouse.holding.position, 0.3, {
                x: global.x,
                y: global.y + $mouse.holding.pivot.y,
                ease: Power4.easeOut
            });
        };
    };

    /**@param {PIXI.interaction.InteractionEvent} e */
    pointerout_SlotButton(e) {
        $mouse._freezeHold = false;
    };

    /**@param {PIXI.interaction.InteractionEvent} e */
    pointerup_SlotButton(e) {
        const sprite = $mouse.holding;
        //! dans le menuItem ?
        if(sprite && $gui.Items.renderable){
            sprite.isOrb && this.add_Orb(sprite);
            sprite.isItem && this.add_Item(sprite);
            sprite.isMixed && this.switchSlot(sprite); //todo: change de place? permetre de reoganiser
        }else
        if('pendant setup tour'){
            this.createMixOrbItem();
        };
        
    };
    //#endregion

    //#region [Method]
    /** condition pour permetre d'infuse dans les pinSlot */
    setLock(value=true){
        this._locked = value;
        this.child.Lock.renderable = value;
        gsap.fromTo(this.child.Lock.scale, 0.4,{x:1.1,y:1.1}, {x:1,y:1, ease:Elastic.easeOut.config(1, 0.75) });
    };

    /** Infuse un orbse selon des conditions */
    add_Orb(SpriteOrb){
        $mouse.clear();
        // todo: peut etre faire une confirmation ?
        if(this.OrbInfused){
            this.OrbInfused && this.removeChild(this.OrbInfused);//!clear
            this.ItemInfused && this.removeChild(this.ItemInfused);//!clear
            __PinSlot.OrbsInfused[this._id] = null;
            __PinSlot.ItemsInfused[this._id] = null;
        };
      
        //# add orb
        SpriteOrb.pivot.set(0);
        SpriteOrb.scale.set(1.2);
        SpriteOrb.position.copy(this.child.SlotButton.position);
        this.addChildAt(SpriteOrb,2);
        __PinSlot.OrbsInfused[this._id] = SpriteOrb;
    };
    
    /** Infuse un item dans un slot avec un orb */
    add_Item(SpriteItem){
        if(this.OrbInfused){
            if(this.ItemInfused){
                this.ItemInfused && this.removeChild(this.ItemInfused);//!clear
                __PinSlot.ItemsInfused[this._id] = null;
            }
            //todo: ajouter les conditionell, isDice, mixColor . ext
            $mouse.clear();
            SpriteItem.pivot.set(0);
            SpriteItem.scale.set(0.7);
            SpriteItem.position.copy(this.child.SlotButton.position);
            this.addChildAt(SpriteItem,3);
            __PinSlot.ItemsInfused[this._id] = SpriteItem;
        };
    };

    /** creer un mix orbItem */
    createMixOrbItem(){
        const OrbInfused = this.OrbInfused;
        const ItemInfused = this.ItemInfused;
        if(OrbInfused && ItemInfused){
            const spriteMixed  = $itemsManager.createMixOrbItem(OrbInfused.Data._id, ItemInfused.Data._id);
            $mouse.add(spriteMixed, this.child.SlotButton.getGlobalPosition());
        };

    };

    //#endregion
};

/**@class Les pinOption permette de gerer les menues attacher au pinBar */
class __PinOption extends PIXI.Container {
    constructor(id, menuName) {
        super();
        this.name = "PinOption";
        /** pinSlot index */
        this._id = id;
        /** nom de base du menue associer a l'options */
        this._name = menuName;
        /** @type {{ SlotButton:ContainerDN, BottomCorner:ContainerDN, Orb:ContainerDN, Icon:ContainerDN, Lock:ContainerDN }} */
        this.child = null;
        this._locked = false;
        this.initialize();
    };

    //#region [GetterSetter]

    //#endregion

    //#region [Initialize]
    initialize() {
        this.initialize_base();
        this.initialize_interactions();
        this.position.set(this._id*95,0);
        this.setLock(false);
    };
    initialize_base(){
        const dataBase  = $loader.DATA2.hudsPinBar;
        const dataBase2  = $loader.DATA2.Orbs;
        const dataBase3  = $loader.DATA2.MiscIcons;
        //# data2\GUI\huds\pinBar\SOURCE\images\pinSlot_slot.png
        const SlotButton = $objs.ContainerDN(dataBase,'pinSlot_slot','SlotButton');
            SlotButton.position.set(0,0);
            SlotButton.d.anchor.set(0.5);
            SlotButton.n.anchor.set(0.5);
        //# data2\GUI\huds\pinBar\SOURCE\images\pinSlot_slot_bottom.png
        const BottomCorner = $objs.ContainerDN(dataBase,'pinSlot_slot_bottom','BottomCorner');
            BottomCorner.position.set(0,25);
            BottomCorner.d.anchor.set(0.5);
            BottomCorner.n.anchor.set(0.5);
        //# data2\System\orbs\SOURCE\images\orb_pink.png
        const color = $systems.colorsSystem.keys[this._id];
        const Orb = $objs.ContainerDN(dataBase2,`orb_${color}`,'Orb');
            Orb.position.set(0,0);
            Orb.d.anchor.set(0.5);
            Orb.n.anchor.set(0.5);
            Orb.scale.set(0.5);
        //# data2\System\orbs\SOURCE\images\orb_ico_Saves.png
        const ico = $systems.optionsType.keys[this._id]
        const Icon = $objs.ContainerDN(dataBase2,`orb_ico_${ico}`,'Icon');
            Icon.position.set(0,0);
            Icon.d.anchor.set(0.5);
            Icon.n.anchor.set(0.5);
            Icon.scale.setZero(0.4);
        //# data2\Icons\Misc\SOURCE\images\cadenas.png
        const Lock = $objs.ContainerDN(dataBase3,'cadenas','Lock');
            Lock.d.anchor.set(0.5);
            Lock.n.anchor.set(0.5);
            Lock.renderable = false;
        //!end
        this.addChild(BottomCorner,Orb,Icon,Lock,SlotButton);
        this.child = this.childrenToName();
    };

    initialize_interactions() {
        const PinOption = this;
        PinOption.interactive = true;
        PinOption.on('pointerover'       , this.pointerover_PinOption      , this);
        PinOption.on('pointerout'        , this.pointerout_PinOption       , this);
        PinOption.on('pointerup'         , this.pointerup_PinOption        , this);
    };
    //#endregion

    //#region [Interactive]
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerover_PinOption(e){
        gsap.to(this.scale, 0.2, { x:1.05,y:1.05 });
        const SlotButton = this.child.SlotButton;
        gsap.to(SlotButton, 0.4, { rotation: Math.PI })
        if(this._locked){
            const Lock = this.child.Lock;
            gsap.fromTo(Lock.scale, 0.4,{x:1.2,y:1.2}, {x:1,y:1 ,ease:RoughEase.ease.config({ template:  Power2.easeIn, strength: 4, points: 7, taper: "out",randomize: false, clamp: false }) });
        }else{
            const Icon = this.child.Icon;
            gsap.to(Icon.scale, 0.4, { x:Icon.scale.zero.x+0.04, y:Icon.scale.zero.y+0.04 })
            gsap.fromTo(Icon, 0.4, {rotation:-0.1}, {rotation:0.1, ease:Power1.easeInOut, repeat: -1, yoyoEase: true} );
        }
    };
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerout_PinOption(e){
        gsap.to(this.scale, 0.3, { x:1,y:1 })
        const SlotButton = this.child.SlotButton;
        gsap.to(SlotButton, 0.2, { rotation:0 });
        const Icon = this.child.Icon;
        gsap.to(Icon.scale, 0.4, { x:Icon.scale.zero.x, y:Icon.scale.zero.y })
        gsap.to(Icon, 0.2, {rotation:0} );
    };
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerup_PinOption(e) {
        const ee = e.currentTarget;
        if (_Combats.Active) { //TODO: delette me
            // this._selected = true;
            // $combats.setupCombatMode('selectTarget',this.cName);
        } else {
            $gui.show(this._name);
        }
    };
    //#endregion

    //#region [Method]
    setLock(value=true){
        this._locked = value;
        this.child.Lock.renderable = value;
        gsap.fromTo(this.child.Lock.scale, 0.4,{x:1.1,y:1.1}, {x:1,y:1, ease:Elastic.easeOut.config(1, 0.75) });
    };
    //#endregion
};