/**Le states math manager permet de creer asigner distribruer les states qui permet des calcule math selon leur source et target
*/

class _statesManager {
    /**Type d'influence general du state, permet les split dans les status, mais aussi de savoir si il est positif ou negative */
    static influenceType = {neg:-1,neutre:0,pos:1}

    /** return un list optimiser de tous les states qui peuve est infligers */
    static get INFLIGERSLIST(){
        return [_statesManager.hunger,_statesManager.poison];
    };
    constructor() {
        /**@type {Object.<string, _statesManager._StateSetting>} */
        this.PoolStates = {};
        this.poolHash = {};
        /** current updateId */
        this._updateId = 0;
        /** last update, lorsque obsolete, doit etre egal au current */
        this.__updateId = 0;
    };

    /** creer un context id unique */
    createContextId(name,sourceId,targetId,parentContext,option={}){
        targetId = Number.isFinite(targetId)?targetId:'';
        option.color && (name+='_'+option.color);
        //! aide au debut , garder just pinSlotsId devrai rendre unique, ou sinon voir pour convertir le pool en array
        Number.isFinite(option.pinSlotsId) && (name+='_pId'+option.pinSlotsId);
        Number.isFinite(option.itemId) && (name+='_iId'+option.itemId);
        Number.isFinite(option.orbId) && (name+='_oId'+option.orbId);
        parentContext = parentContext?`{${parentContext}`:'';
        const cId = `${name}[${sourceId}-${targetId}]${parentContext}`;
        return cId;
    };

    /** verify les INFLIGERSLIST invok summon list des states appliquer selon certain context global, lorsque des changement on operer */
    update(){
        if(this.__updateId!==this._updateId){
            console.log('this.__updateId: ', this.__updateId,this._updateId);
            this.__updateId = this._updateId; // doi ateindre __updateId;
            for (let i=0,contextId = Object.keys(this.PoolStates), l=contextId.length; i<l; i++) {
                const context = this.PoolStates[contextId[i]];
                context.update(this._updateId);
            };
            $players.updateStates();// todo: update des status, player aura getter de status lier a PoolStates ?
            $gui.States && $gui.States.refresh(); // todo: add un arg pour isoler et cibler un state
        };
    };

    /** @returns {_statesManager._StateBase } Return un state du pool*/
    getState(contextId){
        return this.PoolStates[contextId];
    };
    /** @returns {_statesManager._StateSprites Return le Sprite attacher au state du pool} */
    getStateSprite(contextId){
        return this.PoolStates[contextId].Sprite || this.PoolStates[contextId].createSprite();
    };

    /** remove  */
    removePool(contextId){
        this.PoolStates[contextId].Destroy();
        delete this.PoolStates[contextId];
        this._updateId++;
    };

    /** ajoute state au pool global, elle existe comme entiter, pour etablir les connextions */
    addToPool(State){
        this.PoolStates[State._contextId] = State;
        this._updateId++;
    };

    /** creer un states 
     * @param type {String} - Nom de la class State
     * @param sourceId {Number} - ID de la source battler
     * @param targetId {Number} - ID de la cible battler
     * @param parentId {String} - ContextId du parent qui a summon ce state
     * @param options {{color,itemId,orbId,pinSlotsId}} - Options arg passer pour le constructor
     * @return {_statesManager._StateSetting} - Le state dans le POOL
    */
    create(type,sourceId,targetId,parentId,options){
        !Number.isFinite(sourceId) && (sourceId='');
        !Number.isFinite(targetId) && (targetId='');
        const State = new _statesManager[type](sourceId,targetId,parentId,options);
        this.addToPool(State);
        return State;
    };

    /** creer des Infligers suplementaire selon les parametre de combat */
    createIngligers(Action,Boosters){
        const INFLIGERS = [];
        _statesManager.INFLIGERSLIST.forEach(State => {
            const Infligers = State.checkInfligersContext(Action,Boosters);
            if(Infligers.length){
                // creer un infliger sterile pour visuel seulement
                const Ingliger = new State().createSprite();
                Ingliger.Infligers = Infligers;
                INFLIGERS.push(Ingliger);
            }
        });
        return INFLIGERS;
    };

    /**
     * Creer une objet qui contien les statesFormula selon combatAction. return les ref states pour calcul future selon options;
     * @typedef {Object} StatesFormula
     * @property {_statesManager.atk} Action_atk - ref du state atk
     * @property {_statesManager.def} Action_def - ref du state def
     * @property {Array.<_statesManager.Item>} Items - ref des state items
     * @returns {StatesFormula}
     */
    createStatesForumla(combatAction,sourceId,targetId){
        //# atk ces (atk-def)+(booster)+(infligers) + (reciver:recoi des malus?toxic)
        if(combatAction==='attack'){
            //! base
            const Action_atk = this.create('atk',sourceId,targetId);
            Action_atk.update(); // mise a jour manuel des influers
            const Action_def = this.create('def',targetId,sourceId);
            Action_def.update(); // mise a jour manuel des influers
            //!boosters,items
            const Items = [];
            for (let i=0,PinSlotsIds=$gui.Combat.CombatActions_selected.slotsContentsId, l=PinSlotsIds.length; i<l; i++) {
                const pinSlotsId = PinSlotsIds[i];
                if(Number.isFinite(pinSlotsId)){
                    const itemId = $gui.PinBar.pinnedItems[pinSlotsId].Data._id;
                    const orbId = $gui.PinBar.pinnedOrbs[pinSlotsId].Data._id;
                    const state = this.create('Item',sourceId,targetId,null,{itemId,orbId,pinSlotsId});
                    state.update();
                    Items.push(state);
                };
            };
            return {Action_atk,Action_def,Items};
        };
    };

    /**
     * Combats Options
     * @typedef {Object} CombatOptions
     * @property {Boolean} combatOptions.min - Force les resulta minimal
     * @property {Boolean} combatOptions.max - Force les resulta maximal
     */
    /**
     * @param {StatesFormula} formula
     * @param {CombatOptions} options
     * @returns formulaResult
    */
    computeStatesFormula(combatAction,formula,options={}){
            if(combatAction==='attack'){
                const atk =  formula.Action_atk.computeValue(options);
                const def =  formula.Action_def.computeValue(options);
                let item = 0;
                for (let i=0, l=formula.Items.length; i<l; i++) {
                    item+=formula.Items[i].computeValue(options);
                };
                const result = (atk-def)+item;
                return result;
            }
    }

        //#region [rgba(200, 40, 0, 0.1)]
    /**@class Class de base pour gerer les grafics des sprite */
    static _StateSprites = class _StateSprites extends PIXI.Container{
        constructor(Data) {
            super();
            /**@type _statesManager._StateBase - lien de connection avec les data du state parent*/
            this.Data = Data;
            this.name = Data.name;
             /** @type {{ Orb:_objs.ContainerDN,Icon:_objs.ContainerDN,xButton_A:_objs.ContainerDN,txt_A:PIXI.Text,}} */
            this.child = {};
            /** store le timeout hover pour affiche description*/
            this._timeout = null;
            this.initialize();
        };
        /** return true si ces un state item par so constructor */
        get isItem() {
            return this.name === "Item";
        }
        /** obtien la texture name pour le state ou status */
        get textureName() { return this.isItem?`${this.Data._ItemId}`:`st_${this.name+(this.Data._color&&'_'+this.Data._color||'')}`};

        /** initialize display sprite of the states status */
        initialize(){
            this.initialize_sprite();
            this.initialize_interaction();
        };
        initialize_sprite(){ // todo: background ?
            const dataBase = this.isItem?$loader.DATA2.gameItems:$loader.DATA2.IconStates;
            const c = $objs.ContainerDN(dataBase,this.textureName,'State');
            c.d.anchor.set(0.5);
            c.n.anchor.set(0.5);
            this.addChild(c);
            this.child = this.childrenToName();
        };
        /** initialize interaction pour les cases */
        initialize_interaction(){
            this.interactive = true;
            this.on('pointerover' , this.pointerover_state ,this);
            this.on('pointerout'  , this.pointerout_state  ,this);
            this.on("pointerdown" , this.pointerdown_state ,this);
            this.on('pointerup'   , this.pointerup_state   ,this);
        };

        pointerover_state(e){
            this._timeout = setTimeout(() => {
                this.showDescriptions();
            }, 1000);
            
        };

        pointerout_state(e){
            clearTimeout(this._timeout);
        };
    
        pointerdown_state(e){

        };

        pointerup_state(e){
    
        };

        /** affiche descriptions dans la sourit */
        showDescriptions(){ //TODO:
            const desc = this.Data.getDescriptions();
            $mouse.showHelpBox(desc);
        };

        /** super destroy ref */
        Destroy(){
            TweenLite.to(this.scale, 0.4, {y:'1',ease:Back.easeIn.config(1.7)})
            TweenLite.to(this, 0.4, {y:'+=30',alpha:0}).eventCallback("onComplete", ()=>{
                this.destroy({children:true});
            });
            this.child = null;
            this.Data = null;
        };
  
    };
    //#endregion

    //#region [rgba(20, 40, 0, 0.3)]
    static _StateBase = class _StateBase{
            /**
             * @param {Number|_battler} source - Peut etre un id a un battler, ou lui une source _battler hors combat
             * @param {Number|_battler} target - Peut etre un id a un battler, ou lui une source _battler hors combat
             * @param {Number} contextID - prioriter de calcul. Par ordre croissant.
            */
            constructor(sourceId='',targetId='',parentId,options) {
                /** nom source du states */
                this.name = this.constructor.name
                /** A la creation d'un states, on lui pass un context applicatif */
                this._contextId = $statesManager.createContextId(this.name,sourceId,targetId,parentId,options);
                /** le parent state qui a creer ce state */
                this._parentId = parentId;
                /** source des infligers (peut etre id ou obj). En combat on pass des id pour eviter les memory leak destoy*/
                this._sourceId = sourceId;
                /** cible des infligers (peut etre id ou obj)*/
                this._targetId = targetId;
                /** list des influer qui affecteron le resulta du state */
                this.Influers = [];
                /** list des infliger generer via ce state (affect pas sont result) */
                this.Infligers = [];
                /** list des Recivers generer par ce state */
                this.Recivers = [];
                /** le updateMise en relations pour le compute() */
                this._updateId = 0;
                /**derniere valeur compute par le update */
                this._computeValue = 1;
                /**@type {_statesManager._StateSprites} Sprite lier au states si besoin: si pas !contextID, creer par default */
                this.Sprite = null;
            };
            get evoValue() {
                return this.source.evo.atk
            }
            /**@returns {Array.<_statesManager._StateSetting>} - Renvoi une list optimiser des states Classes qui peuvent seulement Influer sur ce state */
            get getInfluersClass() { return this.constructor.getInfluersClass || [] };
            /**@returns {Array.<_statesManager._StateSetting>} - Renvoi une list optimiser des states Classes qui peuvent seulement etre infliger par ce state */
            get getInfligerClass() { return this.constructor.getInfligerClass || [] };
            /** @returns  {_battler|_statesManager._StateSetting} - Renvoi la source connecter au state */
            get source(){ return isNaN(this._sourceId)? $statesManager.getState(this._sourceId):$players.getSourceFromID(this._sourceId) };
            /** @returns  {_battler} - Renvoi le target connecter au state*/
            get target(){ return $players.getSourceFromID(this._targetId) };
            /** @returns {Number} - Renvoi calcule une valeur de base brute , facteur utiliser pour calculer les conditions du state si beoin */
            getValue() { return this.source[this.name] };

            /** @returns {_statesManager._StateSprites} - Reference un sprite au state si besoin */
            createSprite(ax=0.5,ay=0.5,forceNew){
                return this.Sprite || (this.Sprite = new _statesManager._StateSprites(this));
            };

            /** clear - Influers - Infligers - Recivers  */
            clear(Influers,Infligers,Recivers){
                /** list des influer qui affecteron ce state */
                for (let i=0, l=this.Influers.length; i<l; i++) {
                    // si exist plus ? delette !
                    if(Influers.indexOf(this.Influers[i])===-1){
                        $statesManager._updateId++;
                    }
                };
                
                for (let i=0, l=this.Infligers.length; i<l; i++) {
                    // si exist plus ? delette !
                    if(Infligers.indexOf(this.Infligers[i])===-1){
                        $statesManager.removePool(this.Infligers[i]);
                    }
                };
                // todo, plutot fair un context de destroy conditioned?
                this.Influers = Influers;
                this.Infligers = Infligers;
                this.Recivers = Recivers;
            };
            /** clear et update du state et des contexts - Influers - Infligers - Recivers */
            update(){
                //!check les Influers, pass sur tous les class suggerer
                const Influers = [];
                for (let i=0,_Influers=this.getInfluersClass, l=_Influers.length; i<l; i++) {
                    // on recolte les influer qui peuvent influer sur ce state
                    const contextId = _Influers[i].checkInfluersContext(this);
                    if(contextId){ // si le context d'influence existe
                        if(Array.isArray(contextId)){ // pour les po et fo
                            Influers.push(...contextId); 
                        }else{
                            const context = $statesManager.getState(contextId);
                            Influers.push(context._contextId);  
                        }
                    };
                };
                if(!Influers.equals(this.Influers)){
                    this.Influers = Influers;
                    $statesManager._updateId++; // mise a jour global required
                }

                //!check les Infliger, pass sur tous les class suggerer
                const Infligers = [];
                for (let i=0,_Infligers=this.getInfligerClass, l=_Infligers.length; i<l; i++) {
                    // on recolte les influer qui peuvent influer sur ce state
                    const contextId = _Infligers[i].checkInfligersContext(this);
                    if(contextId){// si contextId et context exist pas ?
                        Infligers.push(contextId);
                        if(!this.Infligers.contains(contextId)){
                            const state =  $statesManager.create(_Infligers[i].name, this._sourceId, this._targetId, this._contextId);
                            if(!Number.isFinite(this._targetId) ){ //si pas de target? ajout au status de la source pour rendu visuel
                                this.source.addStatus(state._contextId);
                            }
                        }
                    };
                };

                if(!Infligers.equals(this.Infligers)){
                    //! destroy les infliger
                    for (let i=0, l=this.Infligers.length; i<l; i++) {
                        const oldId = this.Infligers[i];
                        if(!Infligers.contains(oldId)){ // verifi si les version old context son toujours disponible
                            $statesManager.removePool(oldId);
                        };
                    };
                    this.Infligers = Infligers;
                    $statesManager._updateId++; // mise a jour global required
                }
                //this.clear(Influers,Infligers);
            };

            /** return BASE DE CALCUL DUNE STATES selon les options
            * @param {Number} priority - prioriter de calcul. Par ordre croissant.
            * @param {Number} value - valeur de base obtenue
            * @param {Boolean} isPercent - indique si le context est un pourcentage
            * @param {Number} contextId - le id du context 1:atk,2:def ?
            * @param {Boolean} stateName - Nom de la state
            * @param {Boolean} parentName - Nom de la state parent qui track
            */
            createTrackingValues(from,priority,options){
                return {
                    parentId:from._contextId,
                    contextId:this._contextId,
                    priority:priority,
                    value:this.computeValue(options,true),
                    operation:'+',
                    get from() { return $statesManager.getState(this.parentId) },
                    get current() { return $statesManager.getState(this.contextId) },
                };
            };

            /** calcul une valeur de states avec tous ces context
            * @param {CombatOptions} option - options de calcul des contexts
            * @param {_statesManager.atk} from - options de calcul des contexts
            */
            computeValue(options={},from=this){ // todo: le update ne devrai pas est appeller a chaque calcule, mais globalement?
                //!trackingOnly && this.update(); // pas besoin de update une seconde foi
                //todo: this._updateId verifier si besoin de recomput
                let Value = this.getValue(from,options); // obtien la value du state (parfoi custom, voir la class)
                if(!this.Influers.length){ // si pas influenceur, ont calcul que la value de base du state
                    return  Value;
                }
                for (let i=0, l=this.Influers.length; i<l; i++) {
                    const contextId = this.Influers[i];
                    const priority = this._sourceId;
                    const State = $statesManager.getState(contextId);
                    const value = State.computeValue(options,from);
                    console.log('Influers: ', State.name);
                    console.log('Value: ', Value);
                    console.log('+=: ');
                    console.log('value: ', value);
                    Value+=value;
                    console.log1('restul Value: ', Value);
                };
                return Number(Value.toFixed(2));//todo: Math.ceil(total); 
                // creer une value tracking context
                /**
                 Il ya 4 states Maitresse qui guideront le calcule des tracking.
                 [0:sourcePriority,1>: targetPriority]
                 ATK: ((atk0*influer0)-(def1*influer1))*[po]
                 */
                
                /** 
                1: on creer un tracking value pour le State,
                2: on creer aussi des tracking values pour tous les influencer connecter au State
                3: Ont calcul et apply les math ???
                 */
                //! creer les tracking value
                //Values.push( this.createTrackingValues(priority++,options) );
               // const Tracking = this.createTrackingValues(priority++,options) 
                //let Priority = this.Influers.length;
                /*let Tracking = [];
                //# on veut toute les valeur des influer
                for (let i=0, l=this.Influers.length; i<l; i++) {
                    const contextId = this.Influers[i];
                    const priority = this._sourceId;
                    const State = $statesManager.getState(contextId);
                    //FIXME: parfoi le state peut avoir disparu et attendre la prochaine mise a jours global, a etudier un fix
                    Tracking.push(State.createTrackingValues(this,priority,options));
                };
                console.table('Tracking',Tracking);
                //Tracking = Tracking.sort((a, b)=>b.priority - a.priority);
                if(trackingOnly){
                    return Tracking;
                }else{
                    return this.computeTracking(Tracking);
                }*/
            };

            computeTracking(Tracking){
                const base = this.getValue(); // valeur de base avant influence
                let total = 0;

                Tracking.forEach(t => {
                    t.from
                    if(t.operation==='+'){
                        total+=t.value;
                    }
                    if(t.operation==='*'){
                        total*=t.value;
                    }
                    if(t.operation==='-'){
                        total-=t.value;
                    }
                });
                return Number(total.toFixed(2));//todo: Math.ceil(total); 
            };

            /** affiche descriptions dans la sourit */
            getDescriptions(){ //TODO:
                //! desc de base
                let desc = this.descriptions(this)+"\n";
                //! desc des influenceur du state
                for (let i=0, l=this.Influers.length; i<l; i++) {
                    const influer = this.Influers[i];
                    desc+=$statesManager.getState(influer).descriptions(this)+"\n";
                };
                //! desc des infligeur du state
                for (let i=0, l=this.Infligers.length; i<l; i++) {
                    const infliger = this.Infligers[i];
                    desc+=$statesManager.getState(infliger).descriptions(this)+"\n";
                };
                desc+=`Estimation: (${this.computeValue()})`;
                return desc;
            };

            /** Ajoute un influer au state */
            addInfluer(){
                for (let i=0, l=arguments.length; i<l; i++) {
                    const Influer = arguments[i];
                    Influer.interactive = false;
                    Influer.scale.set(0.38);
                    Influer.y = 45;
                    this.Influers.push(Influer);
                    this.addChild(Influer);
                };
            };

            /** destroy all reference and sprite */
            Destroy(){
                this.source.status.remove(this._contextId);
                this.Sprite && this.Sprite.Destroy();
                this.Sprite = null;
                this.Influers  = null;
                this.Infligers = null;
                this.Recivers  = null;
            };
        };
    //#endregion
    
    //#region [rgba(20, 40, 200, 0.1)]
    /**@class _StateSetting Modele base pour les method super() et les setting, Accesible par les parent states et status si disponible ou par default ici*/
    static _StateSetting = class _StateSetting extends _statesManager._StateBase{
            constructor(sourceId,targetId,parentId,options) {
                super(sourceId,targetId,parentId,options);
                //this.update();
            };


            /** return les references de d'autre state qui peuvent influer sur ce state selon des context specific
             * @param from {_statesManager._StateBase} - Le state Parent
             * @param Boosters {_statesManager._StateBase} - Les items 
             * @returns {Array.<_statesManager._StateSetting>} - Renvoi une list states */
            checkInfluersContext(from,Boosters){ 
                return null; 
            };
            /**@returns {String} un influer context id ? */
            checkInfligersContext(Action,Boosters){
                return null;
            };
            
            /** @returns {Number} - Renvoi calcule une valeur de base brute , facteur utiliser pour calculer les conditions du state si beoin */
            getValue() {
                return this.source[this.name];
            };

            /** @returns {String} - Renvoi une description selon le context du state */
            descriptions(from,contextID=this._contextId,source=this.source,target=this.target){
      
            };

             /** @returns {Boolean} - Renvoi true si le state peut utiliser ca valeur */
            applyCondition(option){

            };
        };
    //#endregion


    //#region [rgba(20, 40, 0, 0.3)]
    /**@class base pour les status method pour les states*/
    static _StateItem = class _StateItem extends _statesManager._StateSetting{
        constructor(sourceId,targetId,parentId,options) {
            super(sourceId,targetId,parentId,options);
            this._ItemId = options.itemId;
            this._OrbId = options.orbId;
            this._pinSlotsId = options.pinSlotsId;
            this._isItem = true;
            
        };
        /** obtien la texture name pour le state ou status */
        get textureName() { return this._ItemId};

        /**@returns {_Items._Item} */
        get Item() { return $items.Items[this._ItemId] };
        /**@returns {_Items._Orb} */
        get Orb() { return $items.Orbs[this._OrbId] };
    };
    //#endregion
    

    //#region [rgba(200, 0, 160, 0.05)]
    /**@class indicateur de vitaliter du battler */
    static hp = class hp extends _statesManager._StateSetting {// data2/System/states/SOURCE/images/st_hp.png
            constructor(sourceId,targetId,contextId) {
                super(sourceId,targetId,contextId);
            };
            /** list optimiser des states Influers qui peuve affecter ce states */
            static get getInfluersClass() {return []}
            /** @param from {_statesManager._StateBase} - Le state Parent, @param Boosters {_statesManager._StateBase} - Les items */
            static checkInfluersContext(from,Boosters){
                
            };
            /** return la desciptions */
            descriptions(from,contextID=this._contextId,source=this.source,target=this.target){
                switch (contextID) { //TODO: UTILISE LES LA CLASS $TEXTS
                    case 1: break;
                    default : return `(${this.name}): Indicateur de survie. Lorsque a 0, provoque une mort temporaire et cout des ressources`; break;
                };
            };
        };
    
    //#endregion
    
        //#region [rgba(200, 0, 160, 0.05)]
    /**@class indicateur de vitaliter du battler */
    static mp = (function() { // data2/System/states/SOURCE/images/st_mp.png
        return class mp extends _statesManager._StateSetting {
            constructor(sourceId,targetId,parentId) {
                super(sourceId,targetId,parentId);
            };
            /** list optimiser des states Influers qui peuve affecter ce states */
            static get getInfluersClass() {return []}
            /** @param from {_statesManager._StateBase} - Le state Parent, @param Boosters {_statesManager._StateBase} - Les items */
            static checkInfluersContext(from,Boosters){
         
            };
            /** return la desciptions */
            descriptions(from,contextID=this._contextId,source=this.source,target=this.target){
                switch (contextID) { //TODO: UTILISE LES LA CLASS $TEXTS
                    case 1: break;
                    default : return `(${this.name}): Permet la depense ou la catalisation de certaine action et competense\nUn click no reussie reduit egalement la mana`; break;
                };
            };
  
        };
    })();
    //#endregion

        //#region [rgba(200, 0, 160, 0.05)]
    /**@class indicateur de vitaliter du battler */
    static hg = (function() { // data2/System/states/SOURCE/images/st_hg.png
        return class hg extends _statesManager._StateSetting {
            constructor(sourceId,targetId,parentId) {
                super(sourceId,targetId,parentId);
            };
            /** list optimiser des states Influers qui peuve affecter ce states */
            static get getInfluersClass() {return []};
             /** list optimiser des states Infligers que peut infliger ce state */
            static get getInfligerClass() {return [_statesManager.hunger]};
           
            /** @param from {_statesManager._StateBase} - Le state Parent, @param Boosters {_statesManager._StateBase} - Les items */
            static checkInfluersContext(from,Boosters){
          
            };
            /** return la desciptions */
            descriptions(from,contextID=this._contextId,source=this.source,target=this.target){
                switch (contextID) { //TODO: UTILISE LES LA CLASS $TEXTS
                    case 1: break;
                    default : return `(${this.name}): En cas de famine vos ressource principal son reduite\nLa famine est reduit selon les efforce d'actions, la graviter de la planete\nSurvoler les case vert restor la famine.`; break;
                };
            };
        };
    })();
    //#endregion

        //#region [rgba(200, 0, 160, 0.05)]
    /**@class indicateur de vitaliter du battler */
    static hy = (function() { // data2/System/states/SOURCE/images/st_hy.png
        return class hy extends _statesManager._StateSetting {
            constructor(sourceId,targetId,parentId) {
                super(sourceId,targetId,parentId);
            };
            /** list optimiser des states Influers qui peuve affecter ce states */
            static get getInfluersClass() {return []}
            /** @param from {_statesManager._StateBase} - Le state Parent, @param Boosters {_statesManager._StateBase} - Les items */
            static checkInfluersContext(from,Boosters){
              
            };
            /** return la desciptions */
            descriptions(from,contextID=this._contextId,source=this.source,target=this.target){
                switch (contextID) { //TODO: UTILISE LES LA CLASS $TEXTS
                    case 1: break;
                    default : return `(${this.name}): La desydrations reduit vos ressource principal\nElle est reduit selon les effort d'action et la chaleur de la planette.\nSurvoler les case bleue augment votre hydratation`; break;
                };
            };
        };
    })();
    //#endregion

        //#region [rgba(200, 0, 160, 0.05)]
    /**@class indicateur de atk du battler */
    static atk = class atk extends _statesManager._StateSetting { // data2/System/states/SOURCE/images/st_atk.png
            constructor(sourceId,targetId,parentId) {
                super(sourceId,targetId,parentId);
            };
            /** list optimiser des states Influers qui peuve affecter ce states */
            static get getInfluersClass() {return [_statesManager.hunger,_statesManager.po,_statesManager.fo]}
            /** list optimiser des states Infligers que peut infliger ce state */
            static get getInfligerClass() {return [_statesManager.poison]};
            /** return un influer context id ? */
            static checkInfluersContext(from,Boosters){

            };
            /** return la desciptions selon contextID */
            descriptions(from,contextID=this._contextId,source=this.source,target=this.target){
                if(target){
                    return `(${this.name}): Inflige des degat physic de (${source.atk}): `;// ont peut utiliser ATK, car ce base sur la source sans target, donc la propagation est lier au source
                }
                if(from===this){
                    return `(${this.name}): Affect les dammage physic de base\nAugmente votre limite a porter des objets lourd`;
                }
            };

            getValue(from,options){
                return this.source.getEvoValue(this.name,true);
            };
        };
    //#endregion

        //#region [rgba(200, 0, 160, 0.05)]
    /**@class indicateur de vitaliter du battler */
    static def = (function() { // data2/System/states/SOURCE/images/st_def.png
        return class def extends _statesManager._StateSetting {
            constructor(sourceId,targetId,parentId) {
                super(sourceId,targetId,parentId);
                this._operator = '+';
                
            };
            /** list optimiser des states Influers qui peuve affecter ce states */
            static get getInfluersClass() {return []}
            /** @param from {_statesManager._StateBase} - Le state Parent, @param Boosters {_statesManager._StateBase} - Les items */
            static checkInfluersContext(from,Boosters){
                 if(from.target && from.name === 'atk'){
                    return from.target.states.def;
                 };
            };
            //TODO: RENDU ICI, DEF A 50% CHANCE DE BLOKER
            /** obtien la value def: a 50%*lck de bloquer */
            getValue(from,options) {
                if(options.min){//=> 50%
                    return this.source.getEvoValue(this.name,true);
                }
                if(options.max){
                    return 0;
                }
                return this.source.getEvoValue(this.name,true);
            };
            /** return la desciptions */
            //TODO: RENDU ICI, DEF A 50% CHANCE DE BLOKER
            descriptions(from,contextID=this._contextId,source=this.source,target=this.target){
                if(from===this){
                    return `${this.name}): Chance de bloquer et reduire les dammage physic de 50%\n Reduit les dammages spontaner des events`;
                }
                if(from.name===_statesManager.atk.name){
                    //TODO: PEUT ETRE ALLER CHERCHE AUSI LES INFLUGER SUB DESCRIPTIONS, FACILE
                    return `(${source._game_id})(${this.name}): a (${from.target.DEF/10})% chance de bloquer (${from.name}):`;
                }
            };



        };
    })();
    //#endregion

    //#region [rgba(200, 0, 160, 0.05)]
    /**@class indicateur de vitaliter du battler */
    static lck = (function() { // data2/System/states/SOURCE/images/st_lck.png
        return class lck extends _statesManager._StateSetting {
            constructor(sourceId,targetId,parentId) {
                super(sourceId,targetId,parentId);
            };
            /** list optimiser des states Influers qui peuve affecter ce states */
            static get getInfluersClass() {return []}
            /** @param from {_statesManager._StateBase} - Le state Parent, @param Boosters {_statesManager._StateBase} - Les items */
            static checkInfluersContext(from,Boosters){
                 let influers = [];
                 if(from.target && from.name === 'atk'){
                     //todo
                 };
                 return influers;
            };
            /** return la desciptions */
            descriptions(from,contextID=this._contextId,source=this.source,target=this.target){
                switch (contextID) { //TODO: UTILISE LES LA CLASS $TEXTS
                    case 1: break;
                    default : return `(${this.name}): Affect toutes les math aleatoire par tranche de (${source.lck})/10\nMeilleur chance d'obtenir de meilleur resulta\nAffect chance de critique et devasion`; break;
                  
                };
            };
        };
    })();
    //#endregion

        //#region [rgba(200, 0, 160, 0.05)]
    /**@class indicateur de vitaliter du battler */
    static int = (function() { // data2/System/states/SOURCE/images/st_int.png
        return class int extends _statesManager._StateSetting {
            constructor(sourceId,targetId,parentId) {
                super(sourceId,targetId,parentId);
            };
            /** list optimiser des states Influers qui peuve affecter ce states */
            static get getInfluersClass() {return []}
            /** @param from {_statesManager._StateBase} - Le state Parent, @param Boosters {_statesManager._StateBase} - Les items */
            static checkInfluersContext(from,Boosters){
                 let influers = [];
                 if(from.target && from.name === 'atk'){
                     //todo
                 };
                 return influers;
            };
            /** return la desciptions */
            descriptions(from,contextID=this._contextId,source=this.source,target=this.target){
                switch (contextID) { //TODO: UTILISE LES LA CLASS $TEXTS
                    case 1: break;
                    default : return `(${this.name}): Influe sur la resistance et les dammages magic, \nPermet d'obtenir de meilleur indice.\nPermet d'utiliser de meilleur capaciter.\nReduit le temp du perfectHit (${source.int})`; break;
                };
            };
        };
    })();
    //#endregion

    //#region [rgba(200, 0, 160, 0.05)]
    /**@class indicateur de vitaliter du battler */
    static sta = (function() { // data2/System/states/SOURCE/images/st_sta.png
        return class sta extends _statesManager._StateSetting {
            constructor(sourceId,targetId,parentId) {
                super(sourceId,targetId,parentId);
            };
            /** list optimiser des states Influers qui peuve affecter ce states */
            static get getInfluersClass() {return [_statesManager.hunger]}
            /** @param from {_statesManager._StateBase} - Le state Parent, @param Boosters {_statesManager._StateBase} - Les items */
            static checkInfluersContext(from,Boosters){
                 let influers = [];
                 if(from.target && from.name === 'atk'){
                     //todo
                 };
                 return influers;
            };
            /** return la desciptions */
            descriptions(from,contextID=this._contextId,source=this.source,target=this.target){
                switch (contextID) { //TODO: UTILISE LES LA CLASS $TEXTS
                    case 1: break;
                    default : return `(${this.name}): Additionner au stamina au debut d'un tour.\nAffecte votre vitesse en combat\n Augment votre vitesse de deplacement (${source.sta})`; break;
                };
            };
        };
    })();
    //#endregion

    //#region [rgba(200, 0, 160, 0.05)]
    /**@class indicateur de vitaliter du battler */
    static expl = (function() { // data2/System/states/SOURCE/images/st_expl.png
        return class expl extends _statesManager._StateSetting {
            constructor(sourceId,targetId,parentId) {
                super(sourceId,targetId,parentId);
            };
            /** list optimiser des states Influers qui peuve affecter ce states */
            static get getInfluersClass() {return []}
            /** @param from {_statesManager._StateBase} - Le state Parent, @param Boosters {_statesManager._StateBase} - Les items */
            static checkInfluersContext(from,Boosters){
                 let influers = [];
                 if(from.target && from.name === 'atk'){
                     //todo
                 };
                 return influers;
            };
            /** return la desciptions */
            descriptions(from,contextID=this._contextId,source=this.source,target=this.target){
                switch (contextID) { //TODO: UTILISE LES LA CLASS $TEXTS
                    case 1: break;
                    default : return `(${this.name}): Affect les limite de votre champ de vision\nVotre radius d'identification est augmenter\nLe malus des click est reduit (${source.expl})`; break;
                };
            };
        };
    })();
    //#endregion

    //#region [rgba(200, 0, 160, 0.05)]
    /**@class indicateur de vitaliter du battler */
    static mor = (function() { // data2/System/states/SOURCE/images/st_mor.png
        return class mor extends _statesManager._StateSetting {
            constructor(sourceId,targetId,parentId) {
                super(sourceId,targetId,parentId);
            };
            /** list optimiser des states Influers qui peuve affecter ce states */
            static get getInfluersClass() {return []}
            /** @param from {_statesManager._StateBase} - Le state Parent, @param Boosters {_statesManager._StateBase} - Les items */
            static checkInfluersContext(from,Boosters){
                 let influers = [];
                 if(from.target && from.name === 'atk'){
                     //todo
                 };
                 return influers;
            };
            /** return la desciptions */
            descriptions(from,contextID=this._contextId,source=this.source,target=this.target){
                switch (contextID) { //TODO: UTILISE LES LA CLASS $TEXTS
                    case 1: break;
                    default : return `(${this.name}): Affecte le cout des ressources\nAffecte les choix et prix proposer par les magasins\nAffect votre capaciter de guerison d'un status\nAugment votre decouvert d'or et d'objet (${source.mor})`; break;
                };
            };
        };
    })();
    //#endregion


    //#region [rgba(0, 200, 160, 0.05)]
    // data2/System/states/SOURCE/images/st_po_white.png
    // data2/System/states/SOURCE/images/st_po_pink.png
    // data2/System/states/SOURCE/images/st_po_blue.png
    // data2/System/states/SOURCE/images/st_po_red.png
    // data2/System/states/SOURCE/images/st_po_brown.png
    // data2/System/states/SOURCE/images/st_po_green.png
    // data2/System/states/SOURCE/images/st_po_black.png
    /**@class puissance orbics */
    static po = class po extends _statesManager._StateSetting {
        constructor(sourceId,targetId,parentId,options) {
            super(sourceId,targetId,parentId,options); // pass affixe texture
            this._influenceType = _statesManager.influenceType.pos;
            this._color = options.color;
        };
        /** list optimiser des states Influers qui peuve affecter ce states */
        static get getInfluersClass() {return []}
        /** @param from {_statesManager._StateBase} - Le state Parent, @param Boosters {_statesManager._StateBase} - Les items */
        static checkInfluersContext(from,Boosters){
            const puissanceOrbic = from.source.puissanceOrbic;
            if(from.target && puissanceOrbic.length){//todo: utiliser filter vers le target faiblesseOrbic
                return puissanceOrbic;
            }
        };
        /** verifi les context dans lequel peut etre creer ou infliger
         * @param {_statesManager._StateSetting} from
        */
        static checkInfligersContext(from){ // FIXME: applyInfligerContext

        };

        /** return une desciption selon le contextID */
        descriptions(from,contextID=this._contextId,source=this.source,target=this.target){
            if(from===this){
                return `(${this.name}):Puissance orbic ${this._color}\n Infuse une synergie elementaire positive a vos ressources.\nReduit les malus des cases de meme couleur.\nActive les case de meme couleur`; 
            }
            if(from.name==='atk'){
                const contextId = $statesManager.createContextId('fo', from._targetId,null,null,{color:this._color} );
                const state = $statesManager.getState(contextId);
                if(state){
                    return `(${this.name}) La (${state.name}) de la votre cible augmente de 20% votre attack`;
                };
            };
        };
        
        /** @returns  {Number} - valeur de base du states ,certain states on un value custom et conditionelle*/
        getValue(from) {
    
        };

    };
  
    //#endregion

    //#region [rgba(200, 200, 200, 0.05)]
    // data2/System/states/SOURCE/images/st_fo_white.png
    // data2/System/states/SOURCE/images/st_fo_pink.png
    // data2/System/states/SOURCE/images/st_fo_blue.png
    // data2/System/states/SOURCE/images/st_fo_red.png
    // data2/System/states/SOURCE/images/st_fo_brown.png
    // data2/System/states/SOURCE/images/st_fo_green.png
    // data2/System/states/SOURCE/images/st_fo_black.png
    /**@class puissance orbics */
    static fo = class fo extends _statesManager._StateSetting {
        constructor(sourceId,targetId,parentId,options) { 
            super(sourceId,targetId,parentId,options); // pass affixe texture
            this._influenceType = _statesManager.influenceType.neg;
            this._color = options.color;
        };
        /** list optimiser des states Influers qui peuve affecter ce states */
        static get getInfluersClass() {return []}
        /** @param from {_statesManager._StateBase} - Le state Parent, @param Boosters {_statesManager._StateBase} - Les items */
        static checkInfluersContext(from,Boosters){
            const faiblesseOrbic = from.source.faiblesseOrbic;
            if(from.target && faiblesseOrbic.length){//todo: utiliser filter vers le target faiblesseOrbic
                return faiblesseOrbic;
            }
        };
        /** verifi les context dans lequel peut etre creer ou infliger
         * @param {_statesManager._StateSetting} from
        */
        static checkInfligersContext(from){ // FIXME: applyInfligerContext

        };

        /** return une desciption selon le contextID */
        descriptions(from,contextID=this._contextId,source=this.source,target=this.target){
            if(from===this){
                return `(${this.name}):Faiblesse orbic ${this._color}\n Infuse une synergie elementaire negative a vos ressources.\nReduit les malus des cases de meme couleur.\nVous subiser des dammages suplementaire si elle provienne de meme source.\nActive les case de meme couleur`; 
            }
            if(from.name==='atk'){
                return `(${this.name})`; 
            }
        };

        /** @returns  {Number} - valeur de base du states ,certain states on un value custom et conditionelle*/
        getValue(from) {
    
        };
    };

    //#endregion

    //#region [rgba(5, 5, 50, 0.3)]
    // data2/System/states/SOURCE/images/st_poison.png
    /**@class Poison, ennemi perd 2% max HP par tour */
    static poison = class poison extends _statesManager._StateSetting {
        constructor(sourceId,targetId,parentId,options) {
            //TODO: VOIR SI IL SERAIT INTERESSANT DE PASSER UN contextId
            super(sourceId,targetId,parentId,options);
            this._influenceType = _statesManager.influenceType.neg;
            this._turn = 2;
            this._case = 2;
            this._end = false;
        };
        /** list optimiser des states Influers qui peuve affecter ce states */
        static get getInfluersClass() {return []}
        /** return un influer context id ? */
        static checkInfluersContext(from,Boosters){ //todo: a fair : example une option pourrait reduire le poison de 1%
            
        };
        /** return un influer context id ? */
        static checkInfligersContext(from,Boosters){
            if(from.target && from.name === 'atk'){ //TODO: JUST POUR TEST, a fair mettre tous les condition ici
                return $statesManager.createContextId(this.name, from._sourceId, from._targetId, from._contextId)
            }
        };

        /** return une desciption selon le contextID */
        descriptions(from,contextID=this._contextId,source=this.source,target=this.target){
            switch (contextID) { //TODO: UTILISE LES LA CLASS $TEXTS
                case 1: return `Votre atk a 20% de chance d'ingliger ${this.name} pour une durer entre 2-4 tour`; break;
                case 2: return `??`; break;
                default: return `(${this.name}): Reduit hp et hg de 5% de leur value actuel pendant un nombre de tour defenit`; break;
            };
        };
        getValue() { return '???' };
    };
    //#endregion

    //#region [rgba(5, 5, 50, 0.3)]
    // data2/System/states/SOURCE/images/st_hunger.png
    /**@class Famine*/
    static hunger = class hunger extends _statesManager._StateSetting {
        constructor(sourceId,targetId,parentId) {
            //TODO: VOIR SI IL SERAIT INTERESSANT DE PASSER UN contextId
            super(sourceId,targetId,parentId);
            this._influenceType = _statesManager.influenceType.neg;
            this._turn = 2;
            this._case = 2;
            this._end = false;
            this._operator = '*';
        };
        /** list optimiser des states Influers qui peuve affecter ce states */
        static get getInfluersClass() {return []}
        /** return un influer context id ? */
        static checkInfluersContext(from,Boosters){
            const contextSearch = $statesManager.createContextId(this.name,from._sourceId);
            for (let i=0,status=from.source.status, l=status.length; i<l; i++) {
                const state = $statesManager.getState(status[i]);
                if( state._contextId.contains(contextSearch) ){
                    return state._contextId
                }
            };
        };
        /** verifi les context dans lequel peut etre creer ou infliger
         * @param {_statesManager._StateSetting} from
        */
        static checkInfligersContext(from){ // FIXME: applyInfligerContext
            if(from.name==='hg'){
                const pass = from.source._HG/from.source.HG<0.5; // valeur de passage
                if(pass){ // si current hg est plus petit que 50% du total
                    return $statesManager.createContextId(this.name, from._sourceId, from._targetId, from._contextId)
                };
            };
        };

        /** return une desciption selon le contextID */
        descriptions(from,contextID=this._contextId,source=this.source,target=this.target){
            if(from===this){
                return `(${this.name}):Famine reduit votre atk et sta de maximum 50% selon votre famine`; 
            }
            if(from.name==='atk'){
                return `(${this.name}):reduit votre (atk:${from.source.atk}) de (${+this.getValue(from)}) : %rate:${(this.source.hgHG-0.5)*100}}%`; 
            }
            if(from.name==='sta'){
                return `(${this.name}):reduit votre sta:(${from.source.sta}) de (${+this.getValue(from)}) : %rate:${(this.source.hgHG-0.5)*100}}%`; 
            }
            if(from.name==='hg'){
                return `(${this.name}): vous ete en famine vos ressource sont reduite `; 
            }
        };

        /** @returns  {Number} - valeur de base du states ,certain states on un value custom et conditionelle*/
        getValue(from,options) {
            const hgHG = this.source.hgHG; // rate % famine
            if(from.name==='atk'){
                return from.source.atk * (hgHG-0.5); // reduit de max 50% ,si hgHG reduit , reduit de 50%
            }
            if(from.name==='sta'){
                return from.source.sta * (hgHG-0.5);
            }
            return '???';
        };

    };
    //#endregion

    //#region [rgba(0, 0, 0, 0.05)]
    /**@class indicateur de vitaliter du battler */ 
    static Item = class Item extends _statesManager._StateItem { //! item data2/Objets/gameItems/SOURCE/images/4.png
        constructor(sourceId,targetId,parentId,options) {
            super(sourceId,targetId,parentId,options);
            
        };

        /** return la desciptions */
        descriptions(from,contextID=this._contextId,source=this.source,target=this.target){
            return `(Booster de type gemDice) inflige (${this.Item.descDMG})`;// ont peut utiliser ATK, car ce base sur la source sans target, donc la propagation est lier au source
        };
        
        /** return une value selon context */
        getValue(from,options={}){
            if(options.min){
                return this.Item.minDMG;
            }
            if(options.max){
                return this.Item.maxDMG;
            }
            return this.Item.dmg;
        };
        
    };

    //#endregion

};


let $statesManager = new _statesManager();
console.log1('$statesManager', $statesManager);
