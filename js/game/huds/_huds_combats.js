/**
 * @class _huds_combats - tous les gestions de huds lier au combats
 * @extends PIXI.Container
*/
//TODO: DELETEME:
class _Huds_combats extends _Huds_Base {
    static get _name() {return "Combat"};
    constructor() {
        super();
        /**@type { _huds_combats._ScreenChoice } */
        this.ScreenChoice = null;

        /**@type {Array.<_huds_combats._CombatSelector>} - les selector info frame des battlers */
        this.CombatSelectors = [];

        /**@type {Array.<_huds_combats._CombatActions>} */
        this.CombatActions = [];

        /**@type {_huds_combats._CombatMathBox} */
        this.CombatMathBox = null;

        /**@type {_huds_combats._CombatTargetStates} - States et info sur le target monster*/
        this.CombatTargetStates = null;

        /**@type {PIXI.Sprite} */
        this.BezierArrow = null;

    };

    /**@returns {_huds_combats._CombatActions} return le CombatActions selectionner */
    /*get CombatActions_selected() {
        for (let i=0, l=this.CombatActions.length; i<l; i++) {
            if(this.CombatActions[i]._selected){ return this.CombatActions[i] };
        };
    }*/

    /** initialise les elements huds lorsque commence un combats*/
    initialize(options) { //TODO: peut etre tous initialiser lorsque affiche ScreenChoice ? permetra d'affiche des evaluations?
        this.initialize_CombatSelectors();
        this.initialize_CombatActions();
        this.initialize_MathBox();
    };

    /** creer les CombatSelectors */
    initialize_CombatSelectors(){
        for (let i=0, l=_Combats.battlers.length; i<l; i++) {
            this.CombatSelectors[i] = new _huds_combats._CombatSelector(i);
            const w = 620/l; // width //todo: ? 100. cette facon fair permet de dispatcher egual baser sur lespace du centre 
            const centerScreen = ((1920/2)-(w*l)/2);
            const x = (w/2)+(w*i)+centerScreen;
            const fromY = (!i||i===l-1)? 950 : 850; // les frame players sont plus bas
            TweenLite.fromTo(this.CombatSelectors[i].position, 2.2, {x:1920/2,y:fromY},{x:x,y:55,ease:SlowMo.ease.config(0.6, 1.1, false) });
        };
        this.addChild(...this.CombatSelectors);
    };

    /** creer les CombatActions */
    initialize_CombatActions(){
        //const actions = $combats.currentBattlerTurn.battleOptions; // todo: a metre dans show ou setup
        this.CombatActions = new _huds_combats._CombatActions();
        /*for (let i=0, l=4; i<l; i++) {
            this.CombatActions[i] = new _huds_combats._CombatActions(i);
           // this.CombatActions[i].position.set(65,360+(150*i));
        };
        TweenLite.fromTo(this.CombatActions, 0.6, {rotation:-Math.PI},{rotation:0,ease:Power4.easeOut });*/
        this.addChild(this.CombatActions);
    };

    /** creer la MathBox */
    initialize_MathBox(){
        //const CombatActions = this.CombatActions[this.CombatActionsId_selected];
        this.CombatMathBox = new _huds_combats._CombatMathBox();
        this.CombatMathBox.position.set(-50);//hide
        this.addChildAt(this.CombatMathBox,0);
    };

    /** creer et affiche infomation screenChoice sur le combat */
    show_ScreenChoice(resolve,bountyData){
        if(!this.ScreenChoice){
            $stage.interactiveChildren = true;
            $stage.scene.interactiveChildren = false;
            this.ScreenChoice = new _huds_combats._ScreenChoice(resolve,bountyData);
            this.addChild(this.ScreenChoice);
        }else{
            throw console.error(' existe deja !!');
        };
    };
    /** hide, destroy screenChoice*/
    hide_ScreenChoice(resolve,bountyData){
        if(this.ScreenChoice){
            this.ScreenChoice.destroys();
            this.ScreenChoice = null; //TODO: DESTOY REFERENCE PROMISES
        }else{
            throw console.error(' existe pas !!');
        };
    };

    /** affiche les huds de combat Actions selon le joueur */
    show_CombatActions(){
        const actions = _Combats.currentBattlerTurn.battleOptions;
        for (let i=0, l=this.CombatActions.length; i<l; i++) {
            const CombatActions = this.CombatActions[i];
            CombatActions.show(actions[i].combat_base);
        };
    };

    /** cache et destroy combat actions */
    hide_CombatActions(){
        for (let i=0, l=this.CombatActions.length; i<l; i++) {
            const CombatActions = this.CombatActions[i];
            CombatActions.hide();
        };
    };


    /** focus sur action choisis */
    select_CombatActions(id){
        for (let i=0, l=this.CombatActions.length; i<l; i++) {
            const CombatActions = this.CombatActions[i];
            if(id===i){
                CombatActions._selected = true;
                TweenLite.to(CombatActions.position, 0.2, {x:85,ease:Power4.easeInOut });
                TweenLite.to(CombatActions.scale, 0.3, {x:1.4,y:1.4,ease:Power4.easeInOut });
                TweenLite.to(CombatActions, 0.4, {alpha:1,ease:Power4.easeOut });
                CombatActions.show_CombatSlots();
            }else{
                CombatActions._selected = false;
                TweenLite.to(CombatActions.position, 0.2, {x:-5,ease:Power4.easeInOut });
                TweenLite.to(CombatActions.scale, 0.2, {x:0.8,y:0.8,ease:Power4.easeInOut });
                TweenLite.to(CombatActions, 0.4, {alpha:0.3,ease:Power4.easeOut });
                CombatActions.hide_CombatSlots();
            };
        };
       
    };

    /** creer une mathbox a partir du selector vers un target */
    show_CombatMathBox(option){
        const CombatMathBox = this.CombatMathBox;
        CombatMathBox.setup(option);
    };

    /** clear destroys mathbox */
    hide_CombatMathBox(){
        if(this.CombatMathBox){
            TweenLite.to(this.CombatMathBox, 0.4, {x:0,ease:Power4.easeOut });
            //this.removeChild(this.CombatMathBox); //todo: call destroy car a des ref states
           // this.CombatMathBox = null;
        };
    };

    /** selection un selector */
    select_CombatSelectors(battlerID){
        for (let i=0, l=this.CombatSelectors.length; i<l; i++) {
            if(i===battlerID){
                this.CombatSelectors[i].select();
            }else{
                this.CombatSelectors[i].unSelect();
            }
        };
        this.showStatesSelector(battlerID);
        this.drawBezierfromSourceToTarget();
    };

    /** update timers visuel des selectors */
    update_timers(){
        for (let i=0, l=this.CombatSelectors.length; i<l; i++) {
            this.CombatSelectors[i].update_timer();
        };
    };

    /** permet de enable les Selector apres le choix d'action. si values:false disable tous */
    enable_CombatSelectors(values){
        const currentBattlerId = !values && _Combats.currentBattlerTurn._battlerID;
        for (let i=0, l=this.CombatSelectors.length; i<l; i++) {
            const CombatSelectors = this.CombatSelectors[i];
            CombatSelectors.alpha = values||currentBattlerId===i?1:0.4;
            CombatSelectors.interactive = values;
        };
    };
    

    /** new turn. affiche les huds pour le turn du battler */
    initialize_turn(battlerID){
        for (let i=0, l= this.CombatSelectors.length; i<l; i++) {
            this.CombatSelectors[i].selectForSource(i===battlerID);
        };
    };

    /**affiche les state du target selector (si monster seulement) */
    showStatesSelector(battlerID){
        const battler = $players.getSourceFromID(battlerID);
        if(battler.isMonsters){ // si le target est monster ,afficher les states detailler
            if(this.CombatTargetStates){ // 2ieme click? => more info
                this.CombatTargetStates.Destroy();
                this.CombatTargetStates = null;
            }
            this.CombatTargetStates = new _huds_combats._CombatTargetStates(battlerID);
            this.CombatTargetStates.position.set(1920,245);
            this.addChild(this.CombatTargetStates);
        }
    };


    drawBezierfromSourceToTarget(sourceID = _Combats.sourceID, targetID = _Combats.targetID){
        if(this.BezierArrow){ this.removeChild( this.BezierArrow ) };
        const toX = this.CombatSelectors[targetID].position.x-this.CombatSelectors[sourceID].position.x;
        const toY = this.CombatSelectors[targetID].position.y+55;
        const BezierArrow = this.BezierArrow = $systems.bezierArrow([25*targetID,60],[toX,20+(25*targetID)],[toX,0]);
        BezierArrow.position.set(this.CombatSelectors[sourceID].position.x,toY);
        this.addChild(BezierArrow);
    };

    /** lorsque un tour est clear, reset destroy certain elements */
    clearTurn(){
        this.CombatMathBox.clearTurn();
        for (let i=0, l= this.CombatActions.length; i<l; i++) {
            this.CombatActions[i].clearTurn();
        };
    };
  
   // * @typedef {(number|string)} NumberLike
    //#region [rgba(186, 189, 26, 0.06)]
    /**
     * @class CombatActions
     * @extends PIXI.Container
     */
    static _CombatActions = class _CombatActions extends PIXI.Container {
        constructor(id,actionType) {
            super();
            /** id CombatActions*/
            this._id = id;
            /** le type combat_base relater au excel battlers */
            this._actionType = actionType;
            /** indique si a eter clicker.ex: permet interaction hold=>atk */
            this._selected = false;
            /** lorsque hold, indique si est ready pour action */ //todo: faire une phaze critial ou optimal sur release? peut etre utiliser nombre ?
            this._ready = false;
            /**@type {TimelineMax} - stock le shaker pour le release interactive: permet de savoir a quel moment a eter release */
            this.Shake = null;
            /** list des pinSlotId attache aux CombatSlots */
            this.slotsContentsId = new Array(3);
            /**@type {Array.<_huds_combats._CombatSlot>} */
            this.CombatSlots = [];
            /** @type {{ Orb:_objs.ContainerDN,Icon:_objs.ContainerDN,xButton_A:_objs.ContainerDN,txt_A:PIXI.Text,}} */
            this.child = null;
            this.initialize();
            this.initialize_Combatslot();
            this.initialize_interaction();
            this.renderable = false;
            this.visible = false;
            this.hitArea = this.getBounds();
        };

        initialize() {
            const dataBase = $loader.DATA2.Orbs;
            const dataBase2 = $loader.DATA2.XboxButonsHelper;
            //!data2/System/orbs/SOURCE/images/orb_blue.png
            const Orb = $objs.ContainerDN(dataBase,`orb_${$systems.colorsSystem.keys[this._id]}`,'Orb'); //$systems.actionType[this._actionType].color
                Orb.n.alpha = 0.4;
                Orb.d.anchor.set(0.5);
                Orb.n.anchor.set(0.5);
            //!data2/System/orbs/SOURCE/images/orb_ico_attack.png
            const Icon = $objs.ContainerDN(dataBase,`orb_ico_attack`,'Icon'); //todo:update this._actionType
                Icon.d.anchor.set(0.5);
                Icon.n.anchor.set(0.5);
            //!data2/System/xboxButtonHelper/SOURCE/images/xb_A.png
            const xButton_A = $objs.ContainerDN(dataBase2, 'xb_A','xButton_A');
            xButton_A.d.anchor.set(0.5);
            xButton_A.n.anchor.set(0.5);
            xButton_A.pivot.set(-20,70);
            const txt_A = new PIXI.Text('nulled',$systems.styles[2]); // this._actionType.toUpperCase()
                txt_A.name = 'txt_A';
                txt_A.anchor.set(0,0.5);
                txt_A.position.x = 50;
                xButton_A.addChild(txt_A);
                xButton_A.renderable = false;
            this.addChild(Orb,Icon,xButton_A);
            this.child = this.childrenToName();
        };

        initialize_Combatslot(){
            //todo: verifier les slot debloquer pour chaque actionType. a fair dans menu status
            //const combatSlotsValues = $combats.currentBattlerTurn.combatSlotsValues;
            for (let i=0, l=3; i<l; i++) {
                this.CombatSlots[i] = new _huds_combats._CombatSlot(i,this._id);
            };
            this.addChild(...this.CombatSlots);
        };

        /** interaction du combatSlot */
        initialize_interaction(){
            this.interactiveChildren = false; //! lorsque initialise au debut d'un tours, les slotCombat sont pas interactive.
            this.interactive = true;
            this.on("pointerover"      , this.pointerover_action ,this);
            this.on("pointerout"       , this.pointerout_action  ,this);
            this.on("pointerdown"      , this.pointerdown_action ,this);
            this.on("pointerup"        , this.pointerup_action   ,this);//TODO:  ajouter releaseOut aussi
        };

        /**@param {PIXI.interaction.InteractionEvent} e */
        pointerover_action(e){
            if(this._selected){return};
            TweenLite.to(this.scale, 0.2, {x:1,y:1,ease:Power4.easeOut });
            TweenLite.fromTo(this.child.Icon.scale, 0.4, {x:1.4,y:1.4},{x:1,y:1,ease:Power3.easeOut });
            this.child.Orb.d.filters = [$systems.PixiFilters.OutlineFilterx4white];
            this.child.xButton_A.renderable = true;
            //!rotate icon
            TweenMax.fromTo(this.child.Icon, 0.8, {rotation:-0.1},{
                rotation: 0.1,
                ease: Power1.easeInOut,
                    repeat: -1,
                    yoyoEase: true
                });
        };

        /**@param {PIXI.interaction.InteractionEvent} e */
        pointerout_action(e){
            if(this._selected){return};
            TweenLite.killTweensOf(this.child.Icon);
            this.child.Orb.d.filters = null;
            this.child.Icon.rotation = 0;
            TweenLite.to(this.scale, 0.1, {x:0.9,y:0.9,ease:Power4.easeOut });
            this.child.xButton_A.renderable = false;
        };
        /** focus on target and setActions avant de fair un doAction
         * @param {PIXI.interaction.InteractionEvent} e */
        pointerdown_action(e){
            if(e.currentTarget !== e.target){return}// car les CombatSlots sont child de ActionSlot
            if(this._selected && _Combats.targetBattlerSelected){
                this.alpha = 0.5;
                const shaker = RoughEase.ease.config({ template:  Power4.easeOut, strength: 3, points: 35, taper: "in", randomize: false, clamp: false});
                const tl = this.Shake = new TimelineMax();
                tl.fromTo(this.scale, 1.2, { x: 1, y: 1 },{ x: 1.2, y: 1.2, ease: shaker },0)
                tl.to(this.CombatSlots.map((s)=>s.position), 1.2, { x: 0, y: 0, ease: SlowMo.ease.config(0.7, 0.7, false) },0)
                tl.call(() => {
                    this.alpha = 1;
                    this._ready = true
                },null,this,1);
                tl.call(() => {
                    this.doAction(1);
                },null,this,1.3);
            };
            
        };

        /**@param {PIXI.interaction.InteractionEvent} e */
        pointerup_action(e){
            if(e.currentTarget !== e.target){return}// car les CombatSlots sont child de ActionSlot
            if(this._selected){
                TweenLite.killTweensOf(this.scale)
                TweenLite.killTweensOf(this.CombatSlots.map((s)=>s.position));
                if(this.Shake ){ //# permet l'action
                    this.doAction(this._ready&&2);
                }else{ //!cancel
                    $gui.Combat.select_CombatActions(this._id);
                };
                
            }else{
                //TODO: FAIRE GETTER _actionType VERS LE ID select_CombatActions
                $gui.Combat.select_CombatActions(this._id);
                _Combats.setupCombatMode('selectTarget', this._actionType); // en premier psk la mathBox est creat dans select_CombatActions
            };
        };

        /** permet executer une action apres shaker */
        doAction(value){ //value:1 ou 2 reussi, 0 reset
            this.Shake.kill();
            this.Shake = null;
            this._ready = null;
            this.alpha = 1;
            if(value){
                //todo: on siable tous
                const ItemsSprites = this.createItemsSpriteFromCombatSlots();
                $gui.Combat.hide_CombatMathBox();
                $gui.Combat.hide_CombatActions();
                _Combats.doAction(ItemsSprites);
            }else{
                TweenLite.to(this.scale, 0.1, {x:1.4,y:1.4 });
                this.showCombatSlots(); // reset les slotsPositions
            }
        };

        /** creer des clone sprite item a partir des combatSlot selectionner pour animation actions */
        createItemsSpriteFromCombatSlots(){
            //!pour chaque item dans combatHuds, creer un items vers la scene 3d
            //const CombatActions_selected = this.CombatActions_selected;
            const local = $stage.scene.toLocal(this.position);
            let ItemsSprites = [];
            this.slotsContentsId.forEach(pinSlotId => {
                const Item = $gui.PinBar.pinnedItems[pinSlotId].Data.createSprite();
                Item.convertTo3d();
                Item.parentGroup = $displayGroup.group[6];
                Item.position3d.copy(local);
                $stage.scene.addChild(Item); //TODO: EN FAIR UNE METHOD AVEC REGISTER
                ItemsSprites.push(Item);
            });
            return ItemsSprites;
        };


        /** affiche le actionSlot et setup les textures */
        show(actionType){
            this._actionType = actionType;
            //swap texture
            this.child.txt_A.text = actionType;
            this.child.Icon.d.texture = $loader.DATA2.Orbs.textures[`orb_ico_${actionType}`];
            this.child.Icon.n.texture = $loader.DATA2.Orbs.textures_n[`orb_ico_${actionType}`];
            this.position.set(65,325+(150*this._id));
            TweenLite.fromTo(this, 0.8, {x:0,rotation:-Math.PI,alpha:1},{x:65,rotation:0,ease:Power3.easeOut });
            this.hide_CombatSlots();
            this.renderable = true;
            this.visible = true;
        };
        /** hide comnbatslot */
        hide(){
            TweenLite.to(this, 0.2,{x:-this.hitArea.width,rotation:-Math.PI,alpha:0,ease:Back.easeIn.config(1.4) })
            .eventCallback("onComplete", ()=>{
                this.renderable = true;
                this.visible = true;
            });
        };

        /** scale et affiche les combatHuds disponible */
        show_CombatSlots(){
            this.interactiveChildren = true;
            for (let i=0, l=this.CombatSlots.length; i<l; i++) {
                const CombatSlots = this.CombatSlots[i];
                const radius = 75;
                const angle = Math.PI/4;
                const x = (radius * Math.cos(-0.4+angle*i) );
                const y = (radius * Math.sin(-0.4+angle*i) );
                CombatSlots.alpha = 1;
                TweenLite.to(CombatSlots.position, 1, {x:x,y:y,ease:Power4.easeOut });
                TweenLite.to(CombatSlots.scale, 0.3, {x:0.5,y:0.5,ease:Power4.easeOut });
            };
        };

        /** scale et affiche les combatHuds disponible */
        hide_CombatSlots(dontTween){
            this.interactiveChildren = false;
            for (let i=0, l=this.CombatSlots.length; i<l; i++) {
                const CombatSlots = this.CombatSlots[i];
                const scale = 0.25;
                const radius = 75;
                const angle = Math.PI/2*scale;//step
                const x = (radius * Math.cos(-0.3+angle*i) );
                const y = (radius * Math.sin(-0.3+angle*i) );
                CombatSlots.scale.set(scale);
                CombatSlots.alpha = 0.3;
                dontTween? CombatSlots.position.set(x,y) : TweenLite.to(CombatSlots.position, 0.5, {x:x,y:y,ease:Power4.easeOut });
            };
        };

        /** attache a orbs or items a un combatSlots */ //todo:rendu ici
        add_pinSlotToCombatSlot(combatSlotId,pinSlotId){
            //!check si ya deja des pinSlotId linker dans les slots, si true: clear.
            if( this.slotsContentsId.contains(pinSlotId) ){ // si a deja un pinSlotId attacher? clear (1 id unique )
                const index = this.slotsContentsId.indexOf(pinSlotId);
                if(combatSlotId!==index){ // si pas sur le meme slot
                    this.CombatSlots[index].clear();
                    this.slotsContentsId[index] = null;
                }else{
                    //! si sur meme slots .. rien fair, ces un click sur le meme slot
                    return $mouse.clear();
                }
            };
            if(this.slotsContentsId[combatSlotId]!==null){
                this.CombatSlots[combatSlotId].clear();
                    this.slotsContentsId[combatSlotId] = null;
            }
            this.CombatSlots[combatSlotId].addToCombatSlot(pinSlotId);
            this.slotsContentsId[combatSlotId] = pinSlotId;
            $mouse.clear();
            $gui.Combat.show_CombatMathBox();
        };

        /** destroy combatActions et ces sous elements */
        Destroy(){
            for (let i=0, l=this.CombatSlots.length; i<l; i++) {
                const CombatSlots = this.CombatSlots[i];
                CombatSlots.destroy();//todo: a fair
            };
            this.destroy();
            this.Shake = null;
            this.slotsContentsId = null;
            this.CombatSlots = null;
            this.child = null;
        };

        /** clear and destoy les elements reset */
        clearTurn(){
            this._selected = false;
        };
        

    };
    //#endregion

    //#region [rgba(100, 200, 200, 0.1)]
    /**@class le combat slot sont les huds afficher a coter action de combat*/
    static _CombatSlot = (function() {
        return class _CombatSlot extends PIXI.Container {
            constructor(id,combatActionsId) {
                super();
                /**@type {Number} id _CombatSlot */
                this._id = id;
                /**@type {Number} id parent du ActionSlot */
                this._combatActionsId = combatActionsId;
                /** @type {{ ContainerItem:_objs.ContainerDN, Slot: _objs.ContainerDN}} */
                this.child = null;
                this.initialize();
                this.hitArea = this.getBounds();
            };

            initialize() {
                this.initialize_slot();
                this.initialize_interaction();
            };

            initialize_slot(){
                const dataBase = $loader.DATA2.hud_displacement;
                const Slot = $objs.ContainerDN(dataBase, 'hudS_itemSlots','Slot');
                Slot.d.anchor.set(0.5);
                Slot.n.anchor.set(0.5);
                const ContainerItem = new PIXI.Container();
                ContainerItem.name = 'ContainerItem';
                this.addChild(Slot,ContainerItem);
                this.child = this.childrenToName();
            };

            /** interaction du combatSlot */
            initialize_interaction(){
                this.interactive = true;
                this.on("pointerover"      , this.pointerover_combatSlot,this);
                this.on("pointerout"       , this.pointerout_combatSlot ,this);
                this.on("pointerdown"      , this.pointerdown_combatSlot,this);
                this.on("pointerup"        , this.pointerup_combatSlot  ,this);
            };

            /**@param {PIXI.interaction.InteractionEvent} e */
            pointerover_combatSlot(e){
                $audio._sounds.BT_A.play("BT_A015");
                // clear les autres hover slotCombat
                TweenLite.to(this.scale, 0.3,{ x:0.6,y:0.6, ease: Expo.easeOut});
                this.child.Slot.d.filters = [$systems.PixiFilters.OutlineFilterx4white];
                //! si on a un item dans mouse ? atk with item sinon atk base
                if($mouse.holding){
                    $mouse._freezeHold = true;
                    const gXY = this.getGlobalPosition();
                    const ItemsSprite = $mouse.holding;
                    TweenLite.to(ItemsSprite.position, 0.6  , { x:gXY.x, y:gXY.y-36, ease: Power4.easeOut });
                    TweenLite.to(ItemsSprite.scale, 0.6  , { x:0.5, y:0.5, ease: Power4.easeOut });
                }
            };
            /**@param {PIXI.interaction.InteractionEvent} e */
            pointerout_combatSlot(e){
                $mouse._freezeHold = false;
                TweenLite.to(this.scale, 0.3,{ x:0.5,y:0.5, ease: Expo.easeOut});
                this.child.Slot.d.filters = null;
            };
            /** focus on target and setActions avant de fair un doAction
             * @param {PIXI.interaction.InteractionEvent} e */
            pointerdown_combatSlot(e){
                $audio._sounds.BT_A.play("BT_A012");
            };

            /**@param {PIXI.interaction.InteractionEvent} e */
            pointerup_combatSlot(e){
                if($mouse.holding){
                    if($mouse.fromPinSlot){ // transfer
                        $gui.Combat.CombatActions_selected.add_pinSlotToCombatSlot(this._id,$mouse._pinSlotId);
                    }
                };
            };

            /** ajoute le item from mouse */
            addToCombatSlot(pinSlotId){
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
                
                this.child.ContainerItem.addChild(Orb,Item);
            };

            /** enleve les _ItemsSprite du slots */
            clear(){
                this.child.ContainerItem.removeChildren();
            };


        };
    })();
    //#endregion

    //#region [rgba(100, 0, 200, 0.1)]
    /**@class un frame combatSlector qui affiche les status des battlers */
    static _CombatSelector = class _CombatSelector extends PIXI.Container {
            constructor(battlerID) {
                super();
                this._battlerID = battlerID;
                /** @type {{ HeadFrame:_objs.ContainerDN, HeadIcon:_objs.ContainerDN, combatTimerBar:_objs.ContainerDN, combatTimerBar_progress:_objs.ContainerDN, TimerTxt:PIXI.Text,}} */
                this.child = null;
                this.initialize();
                this.scale.set(0.8);
                this.scale.setZero();
            };

            get battler() { return _Combats.battlers[this._battlerID] };
            
            initialize() {
                this.initialize_frames();
                this.initialize_interaction();
                //this.initialize_selector();
                this.child = this.childrenToName();
                this.update_timer();
            };

            /** initialize container des frames icons */
            initialize_frames(){
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

            /**@param {PIXI.interaction.InteractionEvent} e */
            pointerover_combatSelector(e){
                _Combats.selectTarget(this._battlerID);
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

            /** clear and destoy les elements reset */
            clearTurn(){
                
            }
        };//#endregion
    
        //#region [rgba(0, 0, 0, 0.2)]
    /**@class un frame combatSlector qui affiche les status des battlers */
    static _CombatTargetStates = class _CombatTargetStates extends PIXI.Container {
        constructor(battlerId) {
            super();
            this._battlerId = battlerId;
            /** @type {{ ContainerItem:_objs.ContainerDN, Slot: _objs.ContainerDN}} */
            this.child = null;
            this.initialize();
        };
        
        get battler() {return $players.getSourceFromID(this._battlerId) };

        initialize(){
            const blur = $systems.PixiFilters.blur1;
            blur.blur = 5;
            blur.quality = 5;
            this.initialize_name();
            this.initialize_states();
            //this.initialize_status();
            this.child = this.childrenToName();
        };

        initialize_name(){
            const NameContainer = new PIXI.Container();
                NameContainer.name = 'NameContainer';
            const name = new PIXI.Text(this.battler._game_id+'salvia divinorum',$systems.styles[5]);
            name.anchor.set(1,1);
            const lv = new PIXI.Text(`Lv:${this.battler._level}`,$systems.styles[0]);
            lv.anchor.set(1,1);
            const rec = new PIXI.Graphics().beginFill(0x000000).drawRect(0, 0, name.width+10, (name.height+4)).endFill();
            const Rec0 = new PIXI.Sprite($app.renderer.generateTexture(rec) );
            Rec0.anchor.set(1,0.9);
            Rec0.alpha = 0.5;
            Rec0.filters = [$systems.PixiFilters.blur1];

            NameContainer.addChild(Rec0,name,lv);
            this.addChild(NameContainer);
            TweenLite.fromTo(lv, 0.4,{y:4},{ y:-20, ease: Power3.easeInOut });
            TweenLite.fromTo(NameContainer, 0.2,{x:Rec0.width},{ x:-1, ease: Expo.easeOut });
        };

        initialize_states(){
            //# data2/system/states/SOURCE/images/st_atk.png
            const StateSprites = new PIXI.Container();
                StateSprites.name = 'StateSprites';
            for (let i=0,x=-32,y=0, l=$systems.states.base.length; i<l; i++) {
                const stateName = $systems.states.base[i];
                const contextId = this.battler.states[stateName];
                const StateSprite = $statesManager.getStateSprite(contextId,true);
                StateSprite.position.y = y;
                StateSprite.scale.set(0.58);
                //! state txt value
                const txtValue = new PIXI.Text(StateSprite.Data.computeValue(),$systems.styles[5]);
                txtValue.anchor.set(1,0.5);
                txtValue.position.set(-65,y)
                StateSprites.addChild(StateSprite,txtValue);
                (i===3)?y+=48+35:y+=48;// split les state de survie 
            };
            //!background
            const rec = new PIXI.Graphics().beginFill(0x000000).drawRect(0, 0, 200, 600).endFill();
            const Rec1 = new PIXI.Sprite($app.renderer.generateTexture(rec) );
                Rec1.name = 'Rec1';
                Rec1.parentGroup = $displayGroup.DiffuseGroup;
                Rec1.anchor.set(1,0);
                Rec1.alpha = 0.5;
            Rec1.filters = [$systems.PixiFilters.blur1];
            //!end
            this.addChild(Rec1,StateSprites);
            Rec1.position.y = 0;
            StateSprites.position.y = 30;
            //!animation 
            TweenMax.staggerFromTo(StateSprites.children.filter(c=>!c.text), 0.5, {x:65,alpha:0,rotation:Math.PI*2*2},{ x:-30,alpha:1,rotation:0, ease: Elastic.easeOut.config(0.5, 0.4) }, 0.03);
        };

        Destroy(){
            Object.values(this.child).forEach(child => {
                this.destroy();
            });
            this.child = null;
        };

    };//#endregion
    
    //#region [rgba(100, 0, 5, 0.1)]
    /**@class le combat slot sont les huds afficher au dessu des target en mode combat */
    static _CombatMathBox = (function() {
        return class _CombatMathBox extends PIXI.Container {
            constructor() {
                super();
                // this.proj.affine = 4;
                /**@type {StatesFormula} ref de la state formul pour result final*/
                this.statesFormula = null;
                 /** @type {{ xButton_LB:_objs.ContainerDN, BG:PIXI.Sprite;. TxtMode:PIXI.Text, StatesContainer:PIXI.Container }} */
                this.child = null;
                this.initialize();
            };


            initialize() {
                this.initialize_xboxButton()
                //this.initialize_states();
            };

            initialize_xboxButton(){
                //!data2/System/xboxButtonHelper/SOURCE/images/xb_LB.png
                const dataBase = $loader.DATA2.XboxButonsHelper;
                const xButton_LB = $objs.ContainerDN(dataBase, 'xb_LB','xButton_LB');
                xButton_LB.d.anchor.set(0,0.5);
                xButton_LB.n.anchor.set(0,0.5);
               // xButton_LB.position.x = 50;
                //!bg
                const bg = new PIXI.Graphics().beginFill(0x212121).drawRoundedRect(0, 0, 1920/2, 65,10).endFill();
                bg.name = "BG";
                bg.filters = [$systems.PixiFilters.blur1]
                bg.parentGroup = $displayGroup.DiffuseGroup;
                bg.alpha = 0.6
                bg.anchor.set(1,0.4);
                [bg.width,bg.height] = [1100,50];
                //!txtInfo : indicateur evenmentiel
                const TxtMode = new PIXI.Text('',$systems.styles[4]);
                TxtMode.anchor.set(1.1,0.5)
                TxtMode.name = 'TxtMode';
                //!container des states
                const StatesContainer = new PIXI.Container();
                StatesContainer.name = 'StatesContainer';

                this.addChild(bg,TxtMode,xButton_LB,StatesContainer);
                this.child = this.childrenToName();
            };

            /** update les states,math dans le frame */
            initialize_states( sourceId = _Combats.sourceID, targetId = _Combats.targetID){
                //!Action
                const combatAction = _Combats.currentBattlerTurn._combatAction;
                // ont creer la formule selon le actionType: atk,def,magic...
                const stateFormula = this.statesFormula = $statesManager.createStatesForumla (combatAction,sourceId, targetId);
                const result_min   = $statesManager.computeStatesFormula(combatAction,stateFormula,{min:true});
                const result_max   = $statesManager.computeStatesFormula(combatAction,stateFormula,{max:true});
                //!Infliger: extrai les states infliger a l'ennemie
                //const Infligers = Action.Infligers.map(contextId=>$statesManager.getState(contextId));

                //!rendering
                const group = []; // decomposition des groups
                for (const key in stateFormula) {
                    const state = stateFormula[key];
                    Array.isArray(state)? group.push(...state) : group.push(state);
                }
                let x = 0;
                for (let i=0, l=group.length; i<l; i++) {
                    const state = group[i];
                    const stateSprite = state.createSprite?state.createSprite():state;
                    stateSprite.x = x;
                    x+=stateSprite.width;
                    this.child.StatesContainer.addChild(stateSprite);
                };
                //!dmg rate
                const dmgString = (result_min===result_max)?`${result_min.round2()}`:`${result_min.round2()}<=>${result_max.round2()}`;
                const dmgTxt = new PIXI.Text(`~${dmgString}`, $systems.styles[4]);
                dmgTxt.anchor.set(0,0.5);
                dmgTxt.position.set(x,0);
                this.child.StatesContainer.addChild(dmgTxt);
                //!animation
                const width = this.child.StatesContainer.width
                this.child.StatesContainer.pivot.x = width;
                TweenLite.fromTo(this, 0.3, {x:0,alpha:0},{x:325+width,alpha:1,ease:Power4.easeOut });
                TweenLite.from(dmgTxt, 0.3,{x:0,alpha:0,ease:Power4.easeOut });
                TweenMax.staggerFrom(group, 0.75, { x:-10,alpha:0,rotation:-Math.PI*2, ease: Elastic.easeOut.config(0.5, 0.3) }, 0.1);
            };

            /** computing States result */
            getResult(){
                const combatAction = _Combats.currentBattlerTurn._combatAction;
                return $statesManager.computeStatesFormula(combatAction,this.statesFormula );
            };

            /** setup selon le mode */
            setup(option={}){
                if(option.monster){ //todo: refactoriser les options, cetai un test pendant la phaze d'apparition
                    this.child.xButton_LB.renderable = false;
                    this.child.TxtMode.text = `((NEW)) discover in MonsterBook: ${option.monster._game_id}`;//todo: $text engine
                    TweenLite.fromTo(this, 0.4, {x:this.child.TxtMode.width+(1920/3),y:175,alpha:0},{x:this.child.TxtMode.width+(1920/3),y:235,alpha:1,ease:Power4.easeOut });
                    TweenLite.to(this, 1, {y:'-=20',alpha:0,ease:Power4.easeInOut, delay:2 });
                    return;
                };
                this.renderable = true;
                switch (_Combats._combatMode) {
                    // mode animation, camera, attente d'un tour
                    case $systems.COMBAT_MODE.TIMER : this.setupFrom_timer (); break;
                    // mode information++ et choix action
                    case $systems.COMBAT_MODE.SELECT_ACTION: this.setupFrom_selectAction (); break;
                    // selection d'un target lorsque action est defenie + setup booster
                    case 'selectTarget': this.setupFrom_selectTarget (); break;
                    case $systems.COMBAT_MODE.SETUP_ACTION : this.setupFrom_setupAction (); break;
                };
            };
            setupFrom_timer(){
                this.child.xButton_LB.renderable = false;
                this.child.TxtMode.text = "Wait perform next turn";//todo: $text engine
                TweenLite.fromTo(this, 0.4, {x:-50,y:200,alpha:0},{x:this.child.TxtMode.width+50,y:225,alpha:1,ease:Power4.easeOut });
            };
            setupFrom_selectAction(){
                this.child.xButton_LB.renderable = true;
                this.child.TxtMode.text = "Select Actions";//todo: $text engine
                TweenLite.fromTo(this, 0.4, {x:-50,y:200,alpha:0},{x:this.child.TxtMode.width+50,y:225,alpha:1,ease:Power4.easeOut });
            };
            setupFrom_selectTarget(){
                this.child.xButton_LB.renderable = true;
                this.child.TxtMode.text = "Select Target";//todo: $text engine
                const CombatAction = $gui.Combat.CombatActions_selected;
                const xx = this.child.TxtMode.width+325;
                const yy = CombatAction.y-95;
                TweenLite.fromTo(this, 0.4, {x:-50,y:yy,alpha:0},{x:xx,y:yy,alpha:1,ease:Power4.easeOut });
            };
            setupFrom_setupAction(){
                this.child.xButton_LB.renderable = true;
                this.child.TxtMode.renderable = false;
                this.child.StatesContainer.removeChildren();
                this.initialize_states();
            };

            /** clear and destoy les elements */
            clearTurn(){
                this.child.TxtMode.renderable = true;
                this.child.StatesContainer.removeChildren()
            }
        };
    })();
    //#endregion

    //#region [rgba(50, 50, 50, 0.2)]
  
    //#endregion

};