
/** monsters generator and data controler */
class _monsters extends _battler{
    //#region [Static]
    /** @type {Array.<_monsters>} POOL de tous les dataMonster existant*/
    static POOL = [];
    //#endregion
    /**@param {_DataBattlers} DataMonsters */
    constructor(DataMonsters) {
        super(DataMonsters);
        _monsters.POOL.push(this);
        this.child = null;
        this.initialize()
    }
    //#region [GetterSetter]

    //#endregion
    //#region [Initialize]
    initialize(){
        this.initialize_base();
        this.initialise_animations();
        //this.initialize_listeners();
        //this.setupTweens();
        //this.addInteractive();
    }

    initialise_animations(){
        const spine = this.s;
        spine.stateData.defaultMix = 0.1;
        spine.state.setAnimation(0, "idle", true);
        spine.skeleton.setSlotsToSetupPose();
        this.p.renderable = false;
        //TODO: EXPERIMENTAL wink eyes, use spine events random
    }
    //#endregion
   
        /** fait apparaitre le monstre */
    appear(){
        // todo: faire des data dans excel
        this.p.renderable = true;
        const spine = this.s;
        spine.state.setAnimation(0, "apear", false, 0).timeScale = (Math.random() * 0.6) + 0.6;
        spine.state.addAnimation(0, "idle", true, 0);
        $audio._sounds.BT_A.play("BT_A00");
    };

    //#region [rgba(200, 200, 20, 0.1)]
    /**@class creer une antiter monster */
    static _monster = class _monster extends _battler {
        constructor(id,data,generateData) {
            super(id,data,'m',generateData._id);
            /** @type {{ 'ContainerSpine':_Container_Spine, 'BB':, 'CC':, 'DD':, 'EE':, 'FF':, }} */
            this.child = null;
            this.initialize(generateData);
        };
        //get name() { return $loader.DATA.base.monster_0.info._game_id[0] };//TODO: TEMP FIX NAME A refaire et debugger
        get id() {
            return this._monster_Base._id;
        }
        initialize(generateData){
            this.initialize_sprites(generateData);
            //this.initialize_states();
            this.initialize_stats(1,true);
          
            //this.initialize_listeners();
            //this.setupTweens();
            //this.addInteractive();
        };

        /** initialise monster grafics from dataBase */
        initialize_sprites(generateData) {
            const dataBase = $loader.DATA2[`m${generateData._id}`]
            const ContainerSpine = $objs.create(null,dataBase,'idle').setName('ContainerSpine'); //TODO: passer un type player ou chare ? qui defeni tosu ca ?
            this.child = ContainerSpine.childrenToName();

           const spine = this.s;
            this.p.parentGroup = $displayGroup.group[1];
            spine.scale.set(this._default_heigth/spine.height); //TODO: passer les base info dans battlers ou _monster ?
            spine.scale.setZero();
            spine.stateData.defaultMix = 0.1;
            this.p.renderable = false; // see appear()
        };
        /** ajoute les states viseul pour les monster, diferent des players ..*/
        initialize_states() {
            const hp = this.states.hp.Sprite;
            const hpTxt = this.hpTxt = new PIXI.Text(`${this.HP}`,$systems.styles[5]);
                hpTxt.anchor.set(0.5);
                hp.scale.set(0.5);
            this.p.addChild(hp,hpTxt);
            this.hideStates();
        };
        
        /** fait apparaitre le monstre */
        appear(){
            // todo: faire des data dans excel
            this.p.renderable = true;
            const spine = this.s;
            spine.state.setAnimation(0, "apear", false, 0).timeScale = (Math.random() * 0.6) + 0.6;
            spine.state.addAnimation(0, "idle", true, 0);
            $audio._sounds.BT_A.play("BT_A00");
        };

        /** clear et refresh les po et fo */
        updateOrbic(){
            //! puissance orbic
            this.data.orbsSynegies.po_base.forEach(color => {
                this.puissanceOrbic.push($statesManager.create('po', this._id, null,null,{color})._contextId);
            });
            //! faiblesse orbic
            this.data.orbsSynegies.fo_base.forEach(color => {
                this.faiblesseOrbic.push($statesManager.create('fo', this._id, null,null,{color})._contextId);
            });
        };

        /** reflextion pour un actions "Thinking" */
        checkActions(){ //TODO: RENDU ICI
            this.showThinking();
            const intentions = [];
            _Combats.battlers.forEach(target => {
                // creer des entry d'intention pour chaque battlers
                intentions.push({ target:target, ...this._monster_Base.combatActions });
            });
            //! update intentions values
            intentions.forEach(entry => {
                    // system de valeur intentionnelle, lorsque pass!fail: increment [1] les valeurs d'intentions d'actions (valeyur haut = fort intention)
                //TODO: SI TOUS LES INTENTION SONT A 0 ,(possible en cas de status) NE PEUT RIEN FAIRE ! le monsytre peut parler ?
                let highValue = 0; // facilite lextractions
                for (const key in this._monster_Base.combatActions) {
                    switch (key) {
                        case 'attack' : highValue = Math.max(this.checkIntention_attack (entry),highValue); break;
                        case 'defense': highValue = Math.max(this.checkIntention_defense(entry),highValue); break;
                        case 'cBook'  : highValue = Math.max(this.checkIntention_cBook  (entry),highValue); break;
                        default:break;
                    };
                };
                entry._highValue = highValue;
            });
            const maxValue =  Math.max(...intentions.map(o=>o._highValue));
            let intention = intentions.filter(o => o._highValue === maxValue  );
            intention = intention[ ~~(Math.random() * intention.length) ]; // si plusieur a la meme valeur! reasigne un intention aleatoir dans la list
            const target = intention.target;
            const type = Object.keys(this._monster_Base.combatActions).reduce((a, b) => intention[a] === intention._highValue ? a : b);
            if(target && type){
                //this.doAction(target,type);
                _Combats.selectTarget(0);//todo: simul selection target player1
                setTimeout(()=>{
                    _Combats.doAction()
                },2000)
                
            }else{  //TODO: si aucune intention possible ?! pourrait arriver avec des status.
                console.error('erreur intention impossible ',type);
            }
        };

        /** affiche anime un icon IA reflechi "Thinking"! */
        showThinking(){
            const icon = new PIXI.Text('Thinking...',$systems.styles[2] );
            icon.y = -this.p.height;
            this.p.addChild(icon);
        };

        /** affiche les informations , status states du monsters */
        showStates(){ //TODO: lors de l'initialisations
            const contextId = this.states.hp;
            const SpriteState = $statesManager.getStateSprite(contextId, true);
            this.p.addChild(SpriteState);
            const y = -this._default_heigth;
            TweenLite.fromTo(SpriteState.position, 0.4,{y:y-65}, {y:y, ease:Power4.easeOut } );
            TweenLite.fromTo(SpriteState.scale, 0.4,{x:1,y:1}, {x:0.4,y:0.4, ease:Power4.easeOut } );
            //TweenLite.fromTo(this.hpTxt.position, 0.6,{y:y-70}, {y:y, ease:Bounce.easeOut } );
        };
        /** remove informations */
        hideStates(){ //TODO: lors de l'initialisations
            const contextId = this.states.hp;
            const SpriteState = $statesManager.getStateSprite(contextId, true);
            this.p.removeChild(SpriteState);
        };
        
        /** update valeur intentionelle pour attack */
        checkIntention_attack(entry){
            if(entry.target===this){return entry.attack = 0 }; // cant self target atk (peut pas s'attaquer sois meme)
            if(entry.target === $players.p0){ // favorise atk sur p0 si possible //TODO:
                entry.attack+=1;
            }
            return entry.attack;
        };
        /** update valeur intentionelle pour defense */
        checkIntention_defense(entry){
            return entry.defense;
        };
        /** update valeur intentionelle pour cBook "competenceBook" */
        checkIntention_cBook(entry){
            return entry.cBook;
        };

        /** monster custom do actions ??? */
        /*doAction(target,type){
            //TODO: les attack fire les events dans spine qui eu appelle l'actions
            this.needReversX(target.p) && this.reversX();
            const isRevers = this.isRevers && Math.PI || 0;
            //$combats.doAction($players.p1) //TODO: 
            const dist = $camera.getDistanceFrom(this.p, target.p);
            const hitBone = this.s.skeleton.findBone('hitBone');
            const zeroX = hitBone.x; // just a temp backup

            this.s.state.setAnimation(3,'atk0',false,0);
            this.s.state.addEmptyAnimation(3,0.2,0);
            const tl = new TimelineMax();
            tl.to($camera, 1, {_ang:dist.a/Math.PI*(isRevers?-1:1),_perspective:-0.28, _zoom:0.5, ease:Power4.easeOut },0);
            tl.to(this.s.euler, 0.2, { y:dist.a+isRevers, ease: Power4.easeOut},0);
            
            tl.to(hitBone, 0.1, {x:zeroX-(dist.d/this.s.scale3d.zero._x), ease:Back.easeIn.config(1.2) },1);
            tl.call(() => {
                target.s.state.setAnimation(3,'hit0',false,0);
            } ,null,null,'+=0.1');
            tl.to(hitBone, 0.2, {x:zeroX, ease:Back.easeIn.config(1.2) },'+=1');
            tl.to(this.s.euler, 0.2, { y:0, ease: Power4.easeOut});
            tl.to($camera, 1, {_ang:0,_perspective:-0.6, _zoom:0.8, ease:Power4.easeOut });
            tl.call(() => {
                // battler.backToCase();
                $combats.start(2000); //!end turn
            } ,null,null,'+=1');
            // const bone = this.s.skeleton.findBone('hitBone').convert3d();
            // bone.euler.y = 1;
            // bone.position3d.z = 400; 

        };*/
    };
    //#endregion
}
