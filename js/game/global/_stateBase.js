/** Base dun state */
class _StateBase extends PIXI.Container{
            /**
             * @param {Number|_battler} source - Peut etre un id a un battler, ou lui une source _battler hors combat
             * @param {Number|_battler} target - Peut etre un id a un battler, ou lui une source _battler hors combat
             * @param {Number} contextID - prioriter de calcul. Par ordre croissant.
            */
            constructor(sourceId='',targetId='',parentId,options) {
                super();
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
        