/**
 * Ici on retrous la extend base des slots, mais aussi les autres class static pour le materiel des huds
 */

/** Base des GUI (menue,huds) */
class _GUI_Base extends PIXI.Container{
    constructor(options) {
        super();
        this.name = this.constructor.name;
    };
};

/** Base des Gui huds */
class _Huds_Base extends _GUI_Base{
    constructor(options) {
        super();
    };

};


/** Base des GUI menues */
class _Menues_Base extends _GUI_Base{
    constructor(options) {
        super();
    };

};






//TODO: FAIR SON FICHIER ItemSlot.js
/**Les circle Slots pouvant contenir des pinSlot id relier au items, et effectuer des actions */
class _ItemSlot extends PIXI.Container{
    constructor(id,name) {
        super(id,name);
        this.name = name;
        this._id = id;
        this._pinSlotId = null;
        /** @type {{ 'Slot':_objs.ContainerDN, 'ContainerItem':PIXI.Container}} */
        this.child = {};
        this.initialize();
        this.initialize_interactions();
    };
    
    //#region [GetterSetter]
    /**@returns pinSlot Attacher par le id */
    get pinSlot() {
        return Number.isFinite(this._pinSlotId) && $gui.PinBar.pinnedOrbs[this._pinSlotId];
    }
    //#endregion

    //#region [Initialize]
    initialize(){
        //# data2/Hubs/stamina/SOURCE/images/hudS_itemSlots.png
        const dataBase = $loader.DATA2.hud_displacement;
        const Slot = $objs.ContainerDN(dataBase,'hudS_itemSlots','Slot');
            Slot.scale.set(0.6);
            Slot.d.anchor.set(0.5);
            Slot.n.anchor.set(0.5);
        const ContainerItem = new PIXI.Container();
         ContainerItem.name = 'ContainerItem';

        //!end
        this.addChild(Slot,ContainerItem);
        this.child = this.childrenToName();
    };
    //#endregion

    //#region [Interactive]
    initialize_interactions() {
        this.interactive = true;
        this.on('pointerover' , this.pointerover , this);
        this.on('pointerout'  , this.pointerout  , this);
        this.on('pointerup'   , this.pointerup   , this);
    };
        
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerover(e) {
        TweenLite.to(this.scale, 0.1, { x: 1.1, y: 1.1, ease: Power3.easeOut });
        if($mouse.holding){
            $mouse._freezeHold = true;
            const gXY = this.getGlobalPosition();
            const item = $mouse.holding;
            TweenLite.to(item.position, 0.6  , { x:gXY.x, y:gXY.y-36, ease: Power4.easeOut });
            TweenLite.to(item.scale, 0.6  , { x:0.5, y:0.5, ease: Power4.easeOut });
            TweenLite.to(this.scale, 0.3  , { x:1.3, y:1.3, ease: Power4.easeOut });
            //TweenLite.to(item, 0.2  , { rotation:0, ease: Power4.easeOut });
            //TweenLite.to(item.scale, 0.6  , { x:ee.scale.x, y:ee.scale.y, ease: Elastic.easeOut.config(0.6, 0.3) });
        };
    };

    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerout(e) {
        TweenLite.to(this.scale, 0.1, { x: 1, y: 1, ease: Power3.easeOut });
        if($mouse.holding){
            $mouse._freezeHold = false;
            const item = $mouse.holding;
            TweenLite.to(item.scale, 0.6  , { x:0.7, y:0.7, ease: Power4.easeOut });
            TweenLite.to(this.scale, 0.3  , { x:1, y:1, ease: Power4.easeOut });
            TweenLite.killTweensOf(item.position);
            TweenLite.killTweensOf(item);
            
        };
    };
    /**@param {PIXI.interaction.InteractionEvent} e */
    pointerup(e) {
        const from = this.toLocal(e.data.global.global);
        this.addChild(elementFromMouseToThisSprite);
        TweenLite.fromTo(elementFromMouseToThisSprite, 0.3  ,{x:from.x,x:from.y}, { x:this.x, y:this.y});
    };

    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerup(e) {
        if($mouse.holding){
            $gui.Travel.addToSlot(this._id,$mouse._pinSlotId,$mouse.holding);
        }; 
    };//#endregion

    /** add orb item to slot */
    //#region [Method]
    addToSlot(pinSlotId){
        if(pinSlotId !==this._pinSlotId){
            const Orb = $gui.PinBar.pinnedOrbs[pinSlotId].Data.createSprite();
            const Item = $gui.PinBar.pinnedItems[pinSlotId].Data.createSprite();
            const global1 = $mouse.holding.getGlobalPosition();
            const global2 = this.getGlobalPosition();
            const alignY = -(Orb.height/2)-20; // alignement y du orb -20 pour elastic
            const globalXY = { x:global1.x-global2.x,y:global1.y-global2.y-alignY };
            
            TweenLite.fromTo( Orb.position, 0.6,{ x:globalXY.x,y:globalXY.y},{ x:0,y:0, ease: Elastic.easeOut.config(1, 0.7) });
            TweenLite.fromTo( Item.position, 1,{ x:globalXY.x,y:globalXY.y},{ x:0,y:0, ease: Elastic.easeOut.config(1, 0.7) });
            TweenLite.to( Orb.scale, 0.2,{ x:0.45,y:0.45, ease: Power4.easeOut  });
            TweenLite.to( Item.scale, 0.2,{ x:0.5,y:0.5, ease: Power4.easeOut  });
            
            this.child.ContainerItem.removeChildren();
            this.child.ContainerItem.addChild(Orb,Item);
        }
    };
    
    /** enleve les _ItemsSprite du slots */
    clear(){
        this.child.ContainerItem.removeChildren();
    };
    //#endregion
};