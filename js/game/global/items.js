/*:
// PLUGIN □──────────────────────────────□ITEMS CORE ENGINE□───────────────────────────────┐
* @author □ Jonathan Lepage (dimisterjon),(jonforum) 
* V.0.1a
* License:© M.I.T
└─────────────────────────────────────────────────────────────────────────────────────────┘
*/
/* {type}   
    all      : permet de mettre pinner n'importquel type de items
    diceGem  : oubligatoire d 'en agarder un , permet de pinner les diceGem pour naviger dans le jeux
    food     : la nourriture permet d'etre mixer a des diceGem pour revigorer la faim, la soif. En combat , elle peut deconcentrer ou empoisoner un monstre
    plant    : les plante sont surtout medicinal, elle augment, diminnue et soigne des etas
    mineral  : les mineral sont utile pour fabriquer des dices ou augmenter le LV des Tools. Peut egalement service a de la constructions
    alchemie : utiliser pour fabriquer des items, booster, keys magic. Peut egalement fabriquer des nouvelle magie
    builder  : materieux permetant de fabriquer , des ponts, routes, arme, ... update des batiments..
    tools    : outils pour les interaction et les action dans l'environements, certain outils seron limiter par leur nombre
    keys     : objet collection unique permetant la progressio ndu storyboard.
*/
/*
┌------------------------------------------------------------------------------┐
  GLOBAL $items CLASS: _items
  Controle les items du jeux
└------------------------------------------------------------------------------┘
┌□COLORIMETRIX□─────────────────────────────────────-HexReference-─────────────────────────────────────────────────────────────────────────┐
  #d8a757, #f46e42, #f4eb41, #b241f4, #f44197, #f4415e, #b71f37, #b71e1e, #b7af1d, #f28a0c, #aed0f9, #dd2b01, #eb0e4b, #c37665, #a74313, #c5e264, 
  #cc9b99, #c85109, #fedcb4, #a36506, #a0ff0c, #a000d0, #a00000, #ADB6BE, #B24387 ,#BBC15D ,#FA8965 ,#F3EE1E ,#CC301D
└──────────────────────────────────────────────────────□□□□□□□□□───────────────────────────────────────────────────────────────────────────┘
*/
/** class items data manager, les objet items en jeux */
class _ItemsManager {
    /**@type {Array.<__Item>} - Pool des reference Items */
    static ITEMS = []; 
    /**@type {Array.<__Orb>} - Pool des reference Items */
    static ORBS = []; 
    constructor() {
        /** items trouver et posseder, register dinamic car les non trouve reste cacher */
        this.itemPossed = {0:4,1:0,2:0,12:0,13:0,14:0,15:99,16:99,17:99,18:99,19:1,20:1,21:1}; //TODO: debug only: ajouter quelque item deja decouvert
        /** le nombre de pin orbs color posseder, les pin orbs permette dattacher des type items ou nimport quel dicegem*/
        this.orbsPossed = {
            'mineral':99,
            'magic'  :99,
            'water'  :99,
            'food'   :99,
            'builder':99,
            'plant'  :99,
            'tool'   :99,
        };
        this._totalItemsFound = 0;
        this._totalItemsUse = 0;
        //todo: delete this et mettre tous ces chose dans system, sinon on va ce perde, il faut centraliser
    };

    //#region [Initialize]
    /** initialise the dataBase items */
    initialize(){
        const data = $loader.DATA.base.items.itemsList; //!csv excel
        const header = data[0]; // index du header ["_id", "_idn", "_iType", "_cType", "_value", "_weight", "_dmg", "note"]
        for (let i=0, l=data.length; i<l; i++) { 
            _ItemsManager.ITEMS.push( new __Item(...Object.values(data[i]) )) 
        };
       $systems.filterType.keys.forEach((iType,id) => {
            // index du header ["_id", "_idn", "_iType", "_cType", "_value", "_weight", "_dmg", "note"]
            _ItemsManager.ORBS.push( new __Orb(id,`orb_${$systems.filterType[iType]}`,iType,'pinOrb',$systems.filterType[iType],0,0,0));
       });
    };
    //#endregion

    //#region [Method]
    createItemSprite(id){ //TODO: Pensez que on peut avoir 1 item, ou 1 orb, mais aussi [1item+1orb]. Trouver la meilleur facons
        const data = _ItemsManager.ITEMS[id];
        const SpriteItem = new _SpriteItem(data);
        return SpriteItem;
    };
    createOrbSprite(id){
        const data = _ItemsManager.ORBS[id];
        const SpriteOrb = new _SpriteOrb(data);
        return SpriteOrb;
    };

    createMixOrbItem(orbId,itemId){
        const SpriteOrb = new _SpriteMixOrbItem(orbId,itemId);
        return SpriteOrb;
    };
    //#endregion

};
const $itemsManager = new _ItemsManager();
console.log1('$itemsManager', $itemsManager);

    class __Item {
        constructor(_id, _idn, _cat, _iType, _cType, _value, _weight, _dmg) {
            /** id indexations */
            this._id = _id;
            /** Nom id utilise dans core seulment */
            this._idn = _idn;
            /** category de item */
            this._cat = _cat;
            /** le type de item pour les filtres */
            this._iType = _iType;
            /** le type de couleur du item, pour les gem et leur force*/
            this._cType = _cType;
            /** la valeur de vente general $*/
            this._value = _value;
            /** le poid du items*/
            this._weight = _weight;
            /** les dammage du item si utiliser dans combat infliger*/
            this._dmg = _dmg && _dmg.split(',').map(n=>+n) || [0];
        };
        //#region [GetterSetter]
        get name() { return $texts.getStringById(this._id+'n')};
        get desc() { return $texts.getStringById(this._id+'d')};
        get desc2() { return $texts.getStringById(this._id+'dd')};
        get qty() { return $itemsManager.itemPossed[this._id] || 0};
        get DmgDesc(){return Array.isArray(this._dmg)? this._dmg.join(' <=> ') : this._dmg };
        /** obtien le dammage minimal de l'item */
        get DmgMin() {return Array.isArray(this._dmg)? Math.min(...this._dmg) : this._dmg || 0 };
        /** obtien le dammage maximal de l'item */
        get DmgMax() {return Array.isArray(this._dmg)? Math.max(...this._dmg) : this._dmg || 0 };
        /** generation dune valeur de dammage */
        get Dmg() {return Array.isArray(this._dmg)? Math.randomFrom(...this._dmg) : this._dmg || 0 };
        /** obtien la valeur marchande du week-end ou de la planet */
        get value() {return this._value || 0 };
        /** obtien le poid de l'item */
        get weight() {return this._weight || 0 };
        /** verefy si le items a deja eter poseder et trouver */
        get finded() {return $items.itemPossed.hasOwnProperty(this._id); };
        /** check if is a type dice gem */
        get isDice() {return this._iType === 'diceGem'};
        //#endregion

    };

    class __Orb {
        constructor(_id, _idn, _cat, _iType, _cType, _value, _weight, _dmg) {
            /** id indexations */
            this._id = _id;
            /** Nom id utilise dans core seulment */
            this._idn = _idn;
            /** category de item */
            this._cat = _cat;
            /** le type de item pour les filtres */
            this._iType = _iType;
            /** le type de couleur du item, pour les gem et leur force*/
            this._cType = _cType;
            /** la valeur de vente general $*/
            this._value = _value;
            /** le poid du items*/
            this._weight = _weight;
            /** les dammage du item si utiliser dans combat infliger*/
            this._dmg = _dmg && _dmg.split(',').map(n=>+n) || [0];
        };
    };

    /** un items sprite interactif en jeux */
    class _SpriteItem extends PIXI.Container {
        /**@param { __Item | __Orb } Data Reference au data item ou orb*/
        constructor(Data) {
            super();
            this.Data = Data;
            this.child = null;
            this.initalize();
        };
        //#region [GetterSetter]
        /** return la couleur assosier */
        get colorName() {return this.Data._cType };
        /** identify rapidement si ces un spriteOrb */
        get isItem() {return true };
        //#endregion
        //#region [Initialize]
        initalize(){
            this.initialize_base();
            this.initialize_light();
        };
        initialize_base(){
            const dataBase = $loader.DATA2.gameItems;
            //! data2\System\gameItems\SOURCE\images\12.png
            const Item = $objs.ContainerDN(dataBase,this.Data._id,'Item');
                Item.d.anchor.set(0.5);
                Item.n.anchor.set(0.5);
            this.addChild(Item);
        };

        /**creer sprites item */
        initialize_light() {//! lights TODO:REFACTORING
            const light =  new PIXI.lights.PointLight();
            light.y = 25;
            light.name = "pointerLight";
            light.color = $systems.colorsSystem[this.Data._cType];
            light.falloff = [2.5,27,20];
            light.lightHeight = 0.017;
            gsap.fromTo(light, 3, {brightness:2}, {brightness:3, ease:Power1.easeInOut, yoyoEase:true, repeat:-1 });
            this.addChild(light);
        };
        //#endregion
        
        //#region [Method]

        //#endregion
    };

    /** un items sprite interactif en jeux */
    class _SpriteOrb extends PIXI.Container {
        /**@param { __Item | __Orb } Data Reference au data item ou orb*/
        constructor(Data) {
            super();
            this.Data = Data;
            this.child = null;
            this.initalize();
        };
        //#region [GetterSetter]
        /** return la couleur assosier */
        get colorName() {return this.Data._cType };
        /** identify rapidement si ces un spriteOrb */
        get isOrb() {return true };
        //#endregion
        //#region [Initialize]
        initalize(){
            this.initialize_base();
            this.initialize_light();
        };
        initialize_base(){
            const dataBase = $loader.DATA2.Orbs;
            //! Orb data2/System/orbs/SOURCE/images/orb_blue.png
            const Orb = $objs.ContainerDN(dataBase,`orb_${this.colorName}`,'Orb');
                Orb.scale.set(0.4);
                Orb.d.anchor.set(0.5);
                Orb.n.anchor.set(0.5);
            //! Orb data2/System/orbs/SOURCE/images/orb_flare.png
            const Flare = $objs.ContainerDN(dataBase,'orb_flare','Flare');
                Flare.scale.set(0.4);
                Flare.d.anchor.set(0.5);
                Flare.n.anchor.set(0.5);
            this.addChild(Orb,Flare);
        };

        /**creer sprites item */
        initialize_light() {//! lights TODO:REFACTORING
            const light =  new PIXI.lights.PointLight();
            light.y = 25;
            light.name = "pointerLight";
            light.color = $systems.colorsSystem[this.Data._cType];
            light.falloff = [2.5,27,20];
            light.lightHeight = 0.017;
            gsap.fromTo(light, 3, {brightness:2}, {brightness:3, ease:Power1.easeInOut, yoyoEase:true, repeat:-1 });
            this.addChild(light);
        };
        //#endregion
        
        //#region [Method]
        Destroy(){
            //TODO: trouver une facon general d'enlever toute les ref pour les ContainerDN (remplacer le container destoy de pixi et sprite destoy)
            this.children.forEach(child => {
                //delete child.d.parentGroup
                //delete child.n.parentGroup
                delete child.d;
                delete child.n;
            });
            this.destroy({children:true});
            this.child = null;
        };
        //#endregion
    };


    /** OrbItem Mixed */
    class _SpriteMixOrbItem extends PIXI.Container {
        constructor(orbId,itemId) {
            super();
            this._orbId = orbId;
            this._itemId = itemId;
            this.child = null;
            this.initalize();
        };
        //#region [GetterSetter]
        get DataOrb() {return _ItemsManager.ORBS[this._orbId] };
        get DataItem() {return _ItemsManager.ITEMS[this._itemId] };
        /** identify rapidement si ces un spriteOrb */
        get isOrbItem() {return true };
        //#endregion

        //#region [Initialize]
        initalize(){
            this.initialize_base();
            this.initialize_light();
        };
        initialize_base(){
            const dataBase = $loader.DATA2.Orbs;
            const dataBase2 = $loader.DATA2.gameItems;
            //! Orb data2/System/orbs/SOURCE/images/orb_blue.png
            const Orb = $objs.ContainerDN(dataBase,`orb_${this.DataOrb._cType}`,'Orb');
                Orb.scale.set(0.4);
                Orb.d.anchor.set(0.5);
                Orb.n.anchor.set(0.5);
            //! Orb data2/System/orbs/SOURCE/images/orb_flare.png
            const Flare = $objs.ContainerDN(dataBase,'orb_flare','Flare');
                Flare.scale.set(0.4);
                Flare.d.anchor.set(0.5);
                Flare.n.anchor.set(0.5);
            //! data2\System\gameItems\SOURCE\images\12.png
            const Item = $objs.ContainerDN(dataBase2,this.DataItem._id,'Item');
                Item.scale.set(0.5);
                Item.d.anchor.set(0.5);
                Item.n.anchor.set(0.5);
            this.addChild(Orb,Item,Flare);
        };

        /**creer sprites item */
        initialize_light() {//! lights TODO:REFACTORING
            const light =  new PIXI.lights.PointLight();
            light.y = 25;
            light.name = "pointerLight";
            light.color = $systems.colorsSystem[this.DataOrb._cType];
            light.falloff = [2.5,27,20];
            light.lightHeight = 0.017;
            gsap.fromTo(light, 3, {brightness:2}, {brightness:3, ease:Power1.easeInOut, yoyoEase:true, repeat:-1 });
            this.addChild(light);
        };
        //#endregion
        
        //#region [Method]
        //#endregion
    };