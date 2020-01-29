/*:
// PLUGIN □──────────────────────────────□HUBS CORE ENGINE□───────────────────────────────┐
* @author □ Jonathan Lepage (dimisterjon),(jonforum) 
* V.0.1a
* License:© M.I.T
└─────────────────────────────────────────────────────────────────────────────────────────┘

*/
class _Menue_Items extends _Huds_Base {
    constructor() {
        super();
        /** @type {Array.<__ItemSlot>} */
        this.ItemSlotBuffer = null;
        /** Ligne actuel de rendu */
        this._currentLine = 0;
        /** Ligne total selon les objets filtrers */
        this._totalLine = 0;
        /** @type {__SliderBar} Class Slider*/
        this.Slider = null;
        /** @type {{ 'Background':ContainerDN, 'BarTop':ContainerDN, 'BarBottom':ContainerDN, 'ButtonSortBy':ContainerDN,
         * 'BackgroundFilter':ContainerDN, 'ButtonBg':ContainerDN, 'ButtonColor':ContainerDN, 
         * 'OrbsDiffuserBG':Array.<ContainerDN>, 'Orbs':Array.<ContainerDN>, 'OrbsFlare':Array.<ContainerDN>, 
         * 'SortTxt':PIXI.Text, 'FilterTxt':PIXI.Text, 'MasterOrbsDiffusers':PIXI.Container, 'MasterItContainer':PIXI.Container,
         * 'renderSpriteD':PIXI.Sprite, 'renderSpriteN':PIXI.Sprite, 'mask':PIXI.Sprite, 'ItemsContainer':PIXI.Container,
         * ExtraInformations:__ExtraInformations}} */
        this.child = null;
    };
    //#region [Initialize]
    initialize() {
       this.position.set(435,190)
       this.initialize_base();
       this.initialize_PinOrbs();
       this.initialize_filters();
       this.initialize_Renderer();
       this.child = this.childrenToName();
       this.initialize_interactions();
    };
    initialize_base(){
        const dataBase = $loader.DATA2.menueItems;
        const dataBase2 = $loader.DATA2.orbs;
        const dataBase3 = $loader.DATA2.sliders;
        const dataBase4 = $loader.DATA2.XboxButonsHelper;
        //# data2\GUI\menues\menueItems\SOURCE\images\menuIt_frame.png
        const Background = $objs.ContainerDN(dataBase,'menuIt_frame','Background');
            Background.n.alpha = 0.8;
        //# data2\GUI\menues\menueItems\SOURCE\images\menueIt_bar_C.png
        const BarTop = $objs.ContainerDN(dataBase,'menueIt_bar_C','BarTop');
            BarTop.position.set(905,70);
            BarTop.d.anchor.set(0.5);
            BarTop.n.anchor.set(0.5);
        //# data2\GUI\menues\menueItems\SOURCE\images\menueIt_bar_D.png
        const BarBottom = $objs.ContainerDN(dataBase,'menueIt_bar_D','BarBottom');
            BarBottom.position.set(905,570);
            BarBottom.d.anchor.set(0.5);
            BarBottom.n.anchor.set(0.5);
        //# data2\System\xboxButtonHelper\SOURCE\images\xb_B.png
        const Xbutton_B = $objs.ContainerDN(dataBase4,'xb_B','Xbutton_B');
            Xbutton_B.position.set(1440,20);
            Xbutton_B.d.anchor.set(0.5);
            Xbutton_B.n.anchor.set(0.5);
        //# data2\GUI\menues\menueItems\SOURCE\images\buttonFilterBy.png
        const ButtonSortBy = $objs.ContainerDN(dataBase,'buttonFilterBy','ButtonSortBy');
            ButtonSortBy.position.set(900,35);
            ButtonSortBy.d.anchor.set(0.5);
            ButtonSortBy.n.anchor.set(0.5);
            const SortTxt = new PIXI.Text('SortBy: ID',$systems.styles[6]).setName("SortTxt");
                SortTxt.anchor.set(0.5);
        ButtonSortBy.addChild(SortTxt);
        const Slider = this.Slider = new __SliderBar();
            Background.addChild(Slider);
        //# Extra Info 
        const ExtraInformations = new __ExtraInformations();
        //!end
        this.addChild(Background,BarTop,BarBottom,ButtonSortBy,ExtraInformations,Xbutton_B);
    };
    initialize_filters(){
        const dataBase = $loader.DATA2.menueItems;
        //# data2\GUI\menues\menueItems\SOURCE\images\menueIt_filterSlider.png
        const BackgroundFilter = $objs.ContainerDN(dataBase,'menueIt_filterSlider','BackgroundFilter');
            BackgroundFilter.position.set(420,595);
            for (let i=0,keys = $systems.filterType.keys, l=keys.length; i<l; i++) {
                const filterType = keys[i];
                const color = $systems.filterType[filterType];
                //# data2\GUI\menues\menueItems\SOURCE\images\menueIt_filter_bg.png
                const ButtonBg = $objs.ContainerDN(dataBase,'menueIt_filter_bg','ButtonBg');
                ButtonBg.position.set(85+136*i,12);
                ButtonBg.d.anchor.set(0.5);
                ButtonBg.n.anchor.set(0.5);
                //# data2\GUI\menues\menueItems\SOURCE\images\menueIt_filter_blue.png
                const ButtonColor = $objs.ContainerDN(dataBase,`menueIt_filter_${color}`,'ButtonColor');
                    ButtonColor.position.set(85+136*i,12);
                    ButtonColor.d.anchor.set(0.5);
                    ButtonColor.n.anchor.set(0.5);
                const FilterTxt = $texts.MotionsTxt(`_TYPE_${filterType}`,4,_Texts.SPLITBY_LETTER,0,{fontVariant: "small-caps"}).setName("FilterTxt"); //_Texts.WORDS[`_TYPE_${filterType}`].setName('FilterTxt').anchors(0.5,0.5).show(true);
               // const FilterTxt = new PIXI.Text( filterType.toUpperCase(),$systems.styles[0] ).setName("FilterTxt");
                    FilterTxt.anchors(0.5)
                    FilterTxt.scale.set(0.7);
                    FilterTxt.position.set(85+136*i,7);
                    FilterTxt.start(true)
                    //FilterTxt.anchor.set(0.5);
                    BackgroundFilter.addChild(ButtonBg,ButtonColor,FilterTxt);
            };
            this.addChild(BackgroundFilter);
    };
    initialize_PinOrbs(){

        const MasterOrbsDiffusers = new PIXI.Container().setName('MasterOrbsDiffusers');
            MasterOrbsDiffusers.position.set(500,670);
        for (let i=0,keys = $systems.filterType.keys, l=keys.length; i<l; i++) {
            const filterType = keys[i];
            const color = $systems.filterType[filterType];
            const OrbDiffuser = new __OrbDiffuser(i,filterType,color);
            MasterOrbsDiffusers.addChild(OrbDiffuser);
        };
        //!end
        this.addChild(MasterOrbsDiffusers);
        //Debug.CONTAINER(MasterOrbsDiffusers);
    };

    initialize_Renderer(option = 'option renderer item mask'){
        //!test multiple Renderer buffer for diffuse and normal
        const renderTextureD = PIXI.RenderTexture.create(960, 500);
        const renderTextureN = PIXI.RenderTexture.create(960, 500);
        const renderSpriteD = new PIXI.Sprite(renderTextureD).setName("renderSpriteD");
        const renderSpriteN = new PIXI.Sprite(renderTextureN).setName("renderSpriteN");
            renderSpriteD.position.set(425,70);
            renderSpriteN.position.set(425,70);
            renderSpriteD.parentGroup = PIXI.lights.diffuseGroup;
            renderSpriteN.parentGroup = PIXI.lights.normalGroup;
        const mask = new PIXI.Sprite(PIXI.Texture.from('DATA2/testmask.png')).setName("mask")
            mask.position.set(410,65)
            mask.width = 960;
            mask.height = 500;
            renderSpriteD.mask = mask;
            renderSpriteN.mask = mask;
        const MasterItContainer = new PIXI.Container().setName("MasterItContainer");
            MasterItContainer.position.setZero(425,70);
            MasterItContainer.mask = mask;
        const ItemsContainer = new PIXI.Container().setName("ItemsContainer");
            for (let i=0, l=_ItemsManager.ITEMS.length; i<l; i++) {
                const Item = new __ItemSlot(i);
                ItemsContainer.addChild(Item);
            };
            MasterItContainer.addChild(ItemsContainer);
        //!end 
        this.addChild(renderSpriteD,renderSpriteN,mask,MasterItContainer);
    };
    initialize_interactions() {
        const Xbutton_B = this.child.Xbutton_B;
        Xbutton_B.interactive = true;
        Xbutton_B.on('pointerover'       , this.pointerover_Xbutton_B      , this);
        Xbutton_B.on('pointerout'        , this.pointerout_Xbutton_B       , this);
        Xbutton_B.on('pointerup'         , this.pointerup_Xbutton_B        , this);
    };
    //#endregion

    //#region [Interactive]
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerover_Xbutton_B(e){
        const Xbutton_B = e.currentTarget;
        gsap.fromTo(Xbutton_B.scale, 0.5, {x:1.2,y:1.2}, {x:1.1,y:1.1, ease:Power4.easeOut})
        Xbutton_B.d.filters = [$systems.PixiFilters.OutlineFilterx4white];
    };

    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerout_Xbutton_B(e){
        const Xbutton_B = e.currentTarget;
        gsap.to(Xbutton_B.scale, 0.5, {x:1,y:1, ease:Power4.easeOut})
        Xbutton_B.d.filters = null;
    };
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerup_Xbutton_B(e){
        this.show(false);
    };
 
    //#endregion

    //#region [Method]
    /** affiche le menue items */
    show(value = !this.renderable){
        this.interactiveChildren = value;
        this.renderable = value;
        if(value){
            this.ItemSlotBuffer = __ItemSlot.Pool.slice(); //debug remettre=>  __ItemSlot.Pool.filter(s=>$items.itemPossed[s._id]>-1)
            this.filterBy();
            this.sortBy();
            this.refresh();
            //deleteme:
            document.addEventListener('wheel', (e) => { // zoom
                 const scrollDir = e.deltaY>0?1:-1;
                 this.scroll(this._currentLine+scrollDir);
             });
        };
        /*this.visible = value;
        this._show = value;
        if(value){
            $app.ticker.add(this.rendererItems,this);
            TweenLite.fromTo(this.pivot, 0.3, { y: -2000 },{ y: 0, ease: Power4.easeOut });
            $gui.PinBar.showOptions(false);
        }else{
            $app.ticker.remove(this.rendererItems,this);
        }*/
    };

    /** update le renderer d,n et interactive  */
    updateRenderer(){ //TODO: CREER UN TICKER UPDAT _canUpdateRender pour permetre ca sur gsap onUpdate ?
        const ItemsContainer = this.child.ItemsContainer;
        const renderTextureD = this.child.renderSpriteD.texture;
        const renderTextureN = this.child.renderSpriteN.texture;
        ItemsContainer.renderable = true;
            //ItemsContainer.position.x = 0; // Renderer est local, donc position du container <= a x0 qui sera rendu dans renderTextureD=>x415
            this.ItemSlotBuffer.forEach(ItemSlot => { ItemSlot.toggleBufferRenderer(true, false) });
            $app.renderer.render(ItemsContainer,renderTextureD);
            this.ItemSlotBuffer.forEach(ItemSlot => { ItemSlot.toggleBufferRenderer(false, true) });
            $app.renderer.render(ItemsContainer,renderTextureN);
            //ItemsContainer.position.x = ItemsContainer.position.zero.x; // reposition ItemsContainer par dessu renderSpriteD pour interactions
        ItemsContainer.renderable = false;
    };

    /** recalcule les slots, selon filters, sorting 
     * @param {Boolean} possededOnly seulment les items trouvers ou tous les items ? utile pour debug et bench
    */
    refresh(){
        this.child.ItemsContainer.removeChildren();
        const Slots = this.ItemSlotBuffer.filter(S=>S.renderable); // extrai les Slots filtrer (renderable)
        this.child.ItemsContainer.addChild(...Slots);
        this.positioning(Slots);
        this.setupSlider(Slots);
        this.updateRenderer();
    };

    //TODO:
    sortBy(sort=this._sortBy,forceRefresh){
        if(sort){ // switch

        }else{ //all
            this.ItemSlotBuffer.sort((a, b) => (a._id > b._id) ? 1 : -1);
        };
        forceRefresh && this.refresh();
    }
    //TODO:
    filterBy(cat=this._filterBy,forceRefresh){
        if(cat){

        }else{ //all
            this.ItemSlotBuffer.forEach(s => {
                s.renderable = true;
                s.visible = true;
            });
        };
        forceRefresh && this.refresh();
    };
    
    /** concac les position apres avoit apliquer les filtres et sort 
     * @param {Boolean} animate - Utilise gsap fromTo pour repalcer
    */
    positioning(Slots,animate=false){
        for (let i=0,margeX=320, margeY=120, l=Slots.length; i<l; i++) {
            const ItemSlot = Slots[i];
            ItemSlot.position.set(margeX*(i%3), margeY*Math.trunc(i/3));
        };
    };

    /** setup le slider avec le formatage actuel */
    setupSlider(Slots){
        this._currentLine = 0;
        this._totalLine = Math.ceil(Slots.length/3); //todo: pas bon car les filter utiliser renderable false
        this.Slider.setupTo(this._totalLine);
    };

    /** Scroll to a line */
    scroll(line=0){
        line = Math.max(Math.min(line, this._totalLine-4),0);
    const value = 120*line;
        gsap.to(this.child.ItemsContainer, 0.5,{y:-value})
        .eventCallback("onStart", ()=>{this.child.ItemsContainer.interactiveChildren = false})
        .eventCallback("onUpdate", ()=>{this.updateRenderer()})
        .eventCallback("onComplete", ()=>{this.child.ItemsContainer.interactiveChildren = true});
        this._currentLine = line;
        this.Slider.slideToLine(line);
    };

    showInformation(id){
        this.child.ExtraInformations.showInformation(id);
    };
    //#endregion

};

/**@class Les Orbs diffuser pour asigner au pinSlot */
class __OrbDiffuser extends PIXI.Container {
    constructor(id,filterType,color) {
        super();
        this.name = 'OrbsDiffusers';
        this._id = id;
        this._filterType = filterType;
        this._color = color;
        this.child = null;
        this.initialize();
    };

    initialize(){
        this.initialize_base();
        this.child = this.childrenToName();
        this.position.set(136*this._id,0);
        this.initialize_interactions();
    };
    //#region [Initialize]
    initialize_base(){
        const dataBase = $loader.DATA2.menueItems;
        const dataBase2 = $loader.DATA2.Orbs;
        //# data2\GUI\menues\menueItems\SOURCE\images\OrbicDifuser_pink.png
        const OrbsDiffuserBG = $objs.ContainerDN(dataBase,`OrbicDifuser_${this._color}`,'OrbsDiffuserBG');
            OrbsDiffuserBG.position.set(0);
            OrbsDiffuserBG.d.anchor.set(0.5);
            OrbsDiffuserBG.n.anchor.set(0.5);
        //# data2\GUI\menues\menueItems\SOURCE\images\OrbicDifuser_Selector.png
        const OrbSelector = $objs.ContainerDN(dataBase,'OrbicDifuser_Selector','OrbSelector');
           OrbSelector.position.set(0,-7);
           OrbSelector.d.anchor.set(0.5);
           OrbSelector.n.anchor.set(0.5);
        //# data2\System\orbs\SOURCE\images\orb_pink.png
        const Orb = $objs.ContainerDN(dataBase2,`orb_${this._color}`,'Orb');
            Orb.position.set(1,-7);
            Orb.scale.set(0.48);
            Orb.d.anchor.set(0.5);
            Orb.n.anchor.set(0.5);
            //# data2\System\orbs\SOURCE\images\orb_flare.png
            const OrbsFlare = $objs.ContainerDN(dataBase2,'orb_flare','OrbsFlare');
                OrbsFlare.d.anchor.set(0.5);
                OrbsFlare.n.anchor.set(0.5);
                OrbsFlare.d.alpha = 0.4;
                Orb.addChild(OrbsFlare);
        //# Text value
        const QtyTxt = new PIXI.Text('x99',$systems.styles[6]).setName("QtyTxt");
            QtyTxt.anchor.set(0.5);
            QtyTxt.position.set(0,5);
        //!end
        this.addChild(OrbsDiffuserBG,OrbSelector,Orb,QtyTxt);
    };

    initialize_interactions() {
        const Orb = this.child.Orb;
        Orb.interactive = true;
        Orb.on('pointerover' , this.pointerover_Orb , this);
        Orb.on('pointerout'  , this.pointerout_Orb  , this);
        Orb.on('pointerup'   , this.pointerup_Orb   , this);
    };
    
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    //#endregion

    //#region [Interactive]
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerover_Orb(e){
        const Orb = e.currentTarget;
        Orb.d.filters = [$systems.PixiFilters.OutlineFilterx4white];
    };
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerout_Orb(e){
        const Orb = e.currentTarget;
        Orb.d.filters = null;
    };
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerup_Orb(e){
        const sprite = $itemsManager.createOrbSprite(this._id);
        const fromPos = e.currentTarget.getGlobalPosition();
        $mouse.add(sprite, fromPos);
    };
    //#endregion
};

/**@class Les slots items (on creer tous les slots au debut pour ensuite les filtrers)*/
class __ItemSlot extends PIXI.Container {
    //#region [Static]
    /** @type {Array.<__ItemSlot>} pool for renderer */
    static Pool = [];
    //#endregion

    constructor(id) {
        super();
        this._id = id;
        /** @type {{ 'BackgroundSlot':ContainerDN, 'SlotItem':PIXI.Text, 'ValueTxt':PIXI.Text, 'TitleTxt':PIXI.Text, 'QtyTxt':PIXI.Text, 'ItemIcon':ContainerDN, }} */
        this.child = null;
        this.initialize();
    };

    //#region [Initialize]
    initialize(){
        this.initialize_base();
        this.initialize_interactions();
         // pas utile, car on aplique les sort,filter, mais util pour debug
        this.position.set(325*(this._id%3), 120*Math.trunc(this._id/3));
        __ItemSlot.Pool.push(this);
    };
    initialize_base(){
        const dataBase = $loader.DATA2.menueItems;
        const dataBase2 = $loader.DATA2.gameItems;
        const Item = _ItemsManager.ITEMS[this._id];
        //# data2\GUI\menues\menueItems\SOURCE\images\menueIt_bgSlot.png
        const BackgroundSlot = $objs.ContainerDN(dataBase,'menueIt_bgSlot','BackgroundSlot');
            BackgroundSlot.d.alpha = 0.3;
            BackgroundSlot.n.alpha = 1;
        //# data2\GUI\menues\menueItems\SOURCE\images\menueIt_itemSlot.png
        const SlotItem = $objs.ContainerDN(dataBase,'menueIt_itemSlot','SlotItem');
            SlotItem.position.set(50);
            SlotItem.d.anchor.set(0.5);
            SlotItem.n.anchor.set(0.5);
        //#Text 
        const ValueTxt = new PIXI.Text(`${_Texts.POOL['_VALUE']}:${Item._value} ${_Texts.POOL['_WEIGHT']}:${Item._weight}`
            ,$systems.styles[7]).setName("ValueTxt");
            ValueTxt.position.set(94,6);
        const TitleTxt = new PIXI.Text(Item.name,$systems.styles[6]).setName("TitleTxt");
            TitleTxt.position.set(94,25);
        const QtyTxt = new PIXI.Text(`X${Item.qty}`,{ fill: "white", fontFamily:"Comic Sans MS",fontSize: 20, fontVariant: "small-caps", fontWeight: 900 }).setName("QtyTxt");
        QtyTxt.anchor.set(1,0);
        QtyTxt.position.set(285,80);    
        //# data2\System\gameItems\SOURCE\images\0.png
        const ItemIcon = $objs.ContainerDN(dataBase2,Math.min(this._id,48),'ItemIcon'); //TODO: FINALISER LA DB ITEMS 48
            ItemIcon.scale.set(0.8);
            ItemIcon.position.set(50);
            ItemIcon.d.anchor.set(0.5);
            ItemIcon.n.anchor.set(0.5);
        //!end
        this.addChild(BackgroundSlot,SlotItem,ItemIcon,ValueTxt,TitleTxt,QtyTxt);
        this.child = this.childrenToName();
    };
    initialize_interactions() {
        this.interactive = true;
        this.on('pointerover'       , this.pointerover_ItemSlot    , this);
        this.on('pointerout'        , this.pointerout_ItemSlot   , this);
        this.on('pointerup'         , this.pointerup_ItemSlot    , this);
    };
    //#endregion
    
    //#region [Interactive]
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerover_ItemSlot(){
        $audio._sounds.BT_A.play("BT_A06");
        const BackgroundSlot = this.child.BackgroundSlot;
        BackgroundSlot.d.alpha = 0.2;
        BackgroundSlot.n.alpha = 2;
        BackgroundSlot.n.filters = [$systems.PixiFilters.OutlineFilterx4Black];
        const SlotItem = this.child.ItemIcon; //todo: reflechir pour permet ani renderer
        //gsap.fromTo(SlotItem, 0.4, {rotation:-0.1}, {rotation:0.1, ease:Power1.easeInOut, repeat: -1, yoyoEase: true} );
        $gui.Items.updateRenderer();
        $gui.Items.showInformation(this._id);
    };
    pointerout_ItemSlot(){
        const BackgroundSlot = this.child.BackgroundSlot;
        BackgroundSlot.d.alpha = 0
        BackgroundSlot.n.alpha = 0
        BackgroundSlot.n.filters = null;
        const SlotItem = this.child.ItemIcon;
        gsap.to(SlotItem, 0.2, {rotation:0 } );
        $gui.Items.updateRenderer();
    };
    pointerup_ItemSlot(){
        const SpriteItem = $itemsManager.createItemSprite(this._id);
        $mouse.add(SpriteItem,this.child.ItemIcon.getGlobalPosition());
    };
    //#endregion

    //#region [Method]
    /** rendering diffuse normal lorsque rendu dans le renderer buffer */
    toggleBufferRenderer(d,n){
        for (const key in this.child) {
            const o = this.child[key];
            if(o.d || o.n){
                o.d.renderable = d;
                o.n.renderable = n;
            }else{
                o.renderable = d; // rendu seulement sur renderer diffuse 
            };
        };
    };
    //#endregion

};

/**@class slot extra informationj lorsque survol un slotItem, indique egalement des instruction de base */
class __ExtraInformations extends PIXI.Container{
    /** @type {Object.<string, _motionsTxt>} - Stock les items description cache */
    static POOL = {};
    constructor() {
        super();
        this.name = 'ExtraInformations';
        /** @type {{ 'BarTop':ContainerDN, 'BarBottom':ContainerDN,
         * 'ItemValue':PIXI.Text, 'ItemWeight':PIXI.Text, 
         * 'TotalWeightTxt':PIXI.Text, 'TotalItemsTxt':PIXI.Text, 'TotalTrouverTxt':PIXI.Text, 'TitleTxt':PIXI.Text, 'ItemIcon':PIXI.Text, }} */
        this.child = null;
        this.initialize();
    };

    //#region [Initialize]
    initialize(){
        this.initialize_base();
        this.initialize_ItemInformation();
        this.initialize_MotionsTxt();
        this.position.set(215,70);
        this.child = this.childrenToName();
    };
    initialize_base(){
        const dataBase = $loader.DATA2.menueItems;
        //# data2\GUI\menues\menueItems\SOURCE\images\menueIt_bar_A.png
        const BarTop = $objs.ContainerDN(dataBase,'menueIt_bar_A','BarTop');
            BarTop.d.anchor.set(0.5);
            BarTop.n.anchor.set(0.5);
        //# data2\GUI\menues\menueItems\SOURCE\images\menueIt_bar_B.png
        const BarBottom = $objs.ContainerDN(dataBase,'menueIt_bar_B','BarBottom');
            BarBottom.position.set(0,460);
            BarBottom.d.anchor.set(0.5);
            BarBottom.n.anchor.set(0.5);
        //! txt total weight total items
        const TotalWeightTxt = new PIXI.Text('Total Weight: 120/245',$systems.styles[6]).setName('TotalWeightTxt');
            TotalWeightTxt.position.set(-170,485);
        //! txt total items dans le bag
        const TotalItemsTxt = new PIXI.Text('Total Items: 120/245',$systems.styles[6]).setName('TotalItemsTxt');
            TotalItemsTxt.position.set(-170,515);
        //! txt total item trouver
        const TotalTrouverTxt = new PIXI.Text('Total found: 120/245',$systems.styles[6]).setName('TotalTrouverTxt');
            TotalTrouverTxt.position.set(-170,545);
        //!end
        this.addChild(BarBottom,BarTop,TotalWeightTxt,TotalItemsTxt,TotalTrouverTxt);
    };

    initialize_ItemInformation(){
        const dataBase2 = $loader.DATA2.gameItems;
        //# txt item
        const DescriptionContainer = new PIXI.Container().setName('DescriptionContainer');
        //# data2\System\gameItems\SOURCE\images\0.png
        const ItemIcon = new PIXI.Sprite(PIXI.Texture.WHITE).setName('ItemIcon');
            ItemIcon.position.set(-130,35);
            ItemIcon.anchor.set(0.5);
        const ItemValue = new PIXI.Text(`${_Texts.POOL['_VALUE'].toUpperCase()}:999`,$systems.styles[7]).setName('ItemValue');
            ItemValue.position.set(-80,-6);
        const ItemWeight = new PIXI.Text(`${_Texts.POOL['_WEIGHT'].toUpperCase()}:999`,$systems.styles[7]).setName('ItemWeight');
            ItemWeight.position.set(60,-6);''
        this.addChild(ItemIcon,DescriptionContainer,ItemValue,ItemWeight);
    };

    /** preCache dans pool les MotionsTxt */
    initialize_MotionsTxt(){
        for (let i=0, l=_ItemsManager.ITEMS.length; i<l; i++) {
            const Item = _ItemsManager.ITEMS[i];
            if(Item._idn){ //_idn PARCEQUE LA DB EST PAS FINI ET CA BUG
                const ItemN = $texts.MotionsTxt(i+'n',6);
                const ItemD = $texts.MotionsTxt(i+'d',0, void 0,330);
                const ItemDD = $texts.MotionsTxt(i+'dd');
                __ExtraInformations.POOL[ItemN._id] = ItemN;
                __ExtraInformations.POOL[ItemD._id] = ItemD;
                __ExtraInformations.POOL[ItemDD._id] = ItemDD;
            };
        };
        //!stock les colors et types pour items
        $systems.colorsSystem.keys.forEach(color=>{
            const id = `_${color}`;
            const style2 = {fill: "#bc9239",fontVariant: "small-caps"}
            __ExtraInformations.POOL[id] = $texts.MotionsTxt(id,4, void 0, 0, style2);
        });
        $systems.filterType.keys.forEach(type=>{
            const id = `_TYPE_${type}`;
            const style2 = {fill: "#bc9239",fontVariant: "small-caps"}
            __ExtraInformations.POOL[id] = $texts.MotionsTxt(id,4,void 0,0,style2);
        });
    };
    //#endregion

    //#region [Method]
    /** Affiche les informations d'un items */
    showInformation(id){ //TODO: REMASTERISER AVEC LES MOTION TEXT . creer un container avec un clear
        const dataBase = $loader.DATA2.gameItems;
        const Item = _ItemsManager.ITEMS[id];
        const DescriptionContainer =  this.child.DescriptionContainer;
            DescriptionContainer.removeChildren(); // clear
        if(Item){
            //# data2\System\gameItems\SOURCE\images\0.png
            const texture = dataBase.textures[id];
            this.child.ItemIcon.texture = texture;
            this.child.ItemIcon.renderable = true;
            gsap.fromTo(this.child.ItemIcon.scale, 0.3, {x:0,y:0}, {x:1,y:1, ease:Elastic.easeOut.config(0.4, 0.3) });
            //# txt values
            const ItemValue = this.child.ItemValue;
            const ItemWeight = this.child.ItemWeight;
            gsap.fromTo(ItemValue  .scale, 0.2, {x:0,y:0}, {x:1,y:1, ease:Elastic.easeOut.config(0.4, 0.3) });
            gsap.fromTo(ItemWeight .scale, 0.2, {x:0,y:0}, {x:1,y:1, ease:Elastic.easeOut.config(0.4, 0.3) });
            //# motions desciptions
            // On va chercher les txt en cache dans le pool 
            const MotionTxt_n = __ExtraInformations.POOL[id+'n']; // name
            const MotionTxt_color = __ExtraInformations.POOL[`_${Item._cType}`]; // color
            const MotionTxt_type = __ExtraInformations.POOL[`_TYPE_${Item._iType}`]; // type
            const MotionTxt_d = __ExtraInformations.POOL[id+'d']; // desc
            const MotionTxt_dd = __ExtraInformations.POOL[id+'dd']; // extra desc
                MotionTxt_n.position.set(-70,21);
                MotionTxt_color.position.set(-165,90);
                MotionTxt_type.position.set((MotionTxt_color.x+MotionTxt_color.width+20),90);
                MotionTxt_d.position.set(-165,145);
                MotionTxt_dd.position.set(-165,MotionTxt_d.y+MotionTxt_d.height+10);
                MotionTxt_n.start(true);
                MotionTxt_color.start(true,0.5);
                MotionTxt_type.start(true,0.6);
                MotionTxt_d.start(true);
                MotionTxt_dd.start(true);
                DescriptionContainer.addChild(MotionTxt_n,MotionTxt_color,MotionTxt_type,MotionTxt_d,MotionTxt_dd);
        }else{
            this.child.ItemIcon.renderable = false;
        };

    };
    //#endregion

};

/**@class slider pour navigation des items */
class __SliderBar extends PIXI.Container{
    constructor() {
        super();
        this.name = 'Slider';
        /** max item per page */
        this._currentLine = 0;
        this._maxIPP = 12;
        this._minY = 30;
        this._maxY = 390;
        /** page total mapper */
        this._totalLine = 0;
        /** @type {{ 'slider_blackLine':ContainerDN, 'Slider_redLine':ContainerDN, 'ButtonTop':ContainerDN, 'ButtonDw':ContainerDN, 'ButtonScroll':ContainerDN, 'TxtPage':PIXI.Text, }} */
        this.child = null;
        this.initialize();
    };
    //#region [GetterSetter]
    get distanceY() {
        const dist = this._maxY-this._minY;
        return dist/this._totalLine;
    }

    //#endregion

    //#region [Initialize]
    initialize(){
        this.initialize_base();
        this.initialize_interactions();
        this.position.set(1400,110);
    };

    initialize_base(){
        const dataBase = $loader.DATA2.SliderA;
        //# data2\System\slider\SOURCE\images\slider_blackLine.png
        const Slider_blackLine = $objs.ContainerDN(dataBase,'slider_blackLine','slider_blackLine');
            Slider_blackLine.d.anchor.set(0.5,0);
            Slider_blackLine.n.anchor.set(0.5,0);
        //# data2\System\slider\SOURCE\images\slider_redLine.png
        const Slider_redLine = $objs.ContainerDN(dataBase,'slider_redLine','Slider_redLine');
        Slider_redLine.alpha = 0.5;
            Slider_redLine.height = this._minY;
            Slider_redLine.d.anchor.set(0.5,0);
            Slider_redLine.n.anchor.set(0.5,0);
        //# data2\System\slider\SOURCE\images\slideButUp.png
        const ButtonTop = $objs.ContainerDN(dataBase,'slideButUp','ButtonTop');
            ButtonTop.d.anchor.set(0.5);
            ButtonTop.n.anchor.set(0.5);
        //# data2\System\slider\SOURCE\images\slideButDw.png
        const ButtonDw = $objs.ContainerDN(dataBase,'slideButDw','ButtonDw');
        ButtonDw.position.y = Slider_blackLine.height;
            ButtonDw.d.anchor.set(0.5);
            ButtonDw.n.anchor.set(0.5);
        //# data2\System\slider\SOURCE\images\slideButScroll.png
        const ButtonScroll = $objs.ContainerDN(dataBase,'slideButScroll','ButtonScroll');
            ButtonScroll.y = this._minY;
            ButtonScroll.d.anchor.set(0.5);
            ButtonScroll.n.anchor.set(0.5);
        //! PAGE txt
        const TxtPage = new PIXI.Text(`0/0`,$systems.styles[2]).setName('TxtPage');
            TxtPage.anchor.set(0.5);
            ButtonScroll.addChild(TxtPage);
        //!end
        this.addChild(Slider_blackLine,Slider_redLine,ButtonTop,ButtonDw,ButtonScroll);
        this.child = this.childrenToName();
    };
    initialize_interactions() {
        const ButtonTop = this.child.ButtonTop;
        const ButtonDw = this.child.ButtonDw;
        ButtonTop.interactive = true;
        ButtonDw.interactive = true;
        ButtonTop.on('pointerover' , this.pointerover_Button , this);
        ButtonTop.on('pointerout'  , this.pointerout_Button  , this);
        ButtonTop.on('pointerdown' , this.pointerdown_Button , this);
        ButtonTop.on('pointerup'   , this.pointerup_Button   , this);
        ButtonDw .on('pointerover' , this.pointerover_Button , this);
        ButtonDw .on('pointerout'  , this.pointerout_Button  , this);
        ButtonDw .on('pointerdown' , this.pointerdown_Button , this);
        ButtonDw .on('pointerup'   , this.pointerup_Button   , this);
    };
    //#endregion

    //#region [Interactive]
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerover_Button(e){
        const button = e.currentTarget;
        gsap.to(button.scale, {x:1.1,y:1.1});
        button.d.filters = [$systems.PixiFilters.OutlineFilterx4white];

    };
    pointerout_Button(e){
        const button = e.currentTarget;
        gsap.to(button.scale, {x:1,y:1})
        button.d.filters = null;
    };
    pointerdown_Button(e){
        const button = e.currentTarget;
        const ani = gsap.fromTo(button.scale, 0.5,{x:1.2,y:1.2},{id:'holdScroll', x:1,y:1,repeat:-1})
        .eventCallback("onStart", ()=>{ 
            this.pointerup_Button(e,true) 
        })
        .eventCallback("onRepeat", ()=>{ 
            ani.duration(0.08);
            this.pointerup_Button(e,true) 
        });
    };
    pointerup_Button(e,repeat){
        const button = e.currentTarget || e.target;
        if(!button){return}
        if(!repeat){
            const tween = gsap.getById('holdScroll');
            if(tween){return gsap.killTweensOf(button.scale) };
        };
        if(button.name === "ButtonTop"){
            $gui.Items.scroll(this._currentLine-1)
        }else{
            $gui.Items.scroll(this._currentLine+1)
        }
    };
    //#endregion

    /** configure le slider pour un node (container) */
    setupTo(totalLine=0){
        this._totalLine = totalLine-4;
        this.child.TxtPage.text = `0/${totalLine}`;
    };

    //#region [Method]
    /**scroll actions */
    slideToLine(line){
        this._currentLine = line;
        this.child.TxtPage.text = `${line}/${this._totalLine}`;
        gsap.to(this.child.ButtonScroll, {y:this._minY+(this.distanceY*line)});
        gsap.to(this.child.Slider_redLine, {height:this._minY+(this.distanceY*line)});
    };
    //#endregion
};

