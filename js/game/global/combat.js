/*:
// PLUGIN □────────────────────────────────□ COMBAT CORE ENGINE □───────────────────────────────┐
* @author □ Jonathan Lepage (dimisterjon),(jonforum) 
* @plugindesc manage combats
* V.0.1a
* License:© M.I.T
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
*/
// ┌-----------------------------------------------------------------------------┐
// GLOBAL $combats CLASS: _combats
//└------------------------------------------------------------------------------┘
//TODO: RENDU ICI, en mode combat utiliser un seul dice ou click pour attacker
class _combats {
    constructor() {
        /** Indicateur combat en cour */
        this._started = false;
        /** Indicateur dynamic des turn */
        this._startedTurn = false;
        /** le mode de combat actuel  */
        this._combatMode = $systems.COMBAT_MODE.TIMER;
        /** LE mode action choisis */
        this._actionMode = null;
        /** limite de temp asigner au combat  */
        this._timeLimit = 0;
        /** la cases initial au demmarage et de retour a la fin du comnbat */
        this.initialCase = null;
        /** battle ticks speed */
        this._battleSpeed = 30; // fast:10 , slow:100
        /** Identification du combat ID si event story*/
        this._combatId = null;
        /** les options passer au combat */
        this.options = {};
        /** List des monstres de combats */
        this.monsters = [];
        /** ref des obj environement masker en combat */
        this.hided_obj = [];
        /** ref des obj environement afficher en combat */
        this.showed_obj = [];
        /** list des case box garder pour combat */
        this.cases = [];
        /** store ref of light, les lumiere ne peuvent etre alpha:0 , mais on un traitement special*/
        this.lights = [];
        /**@type {Array.<_battler>} - liste global des battler par id */
        this.battlers = [];
        /**@type {_battler} - Le turn du battler Actif */
        this.currentBattlerTurn = null; //TODO EN FAIR UN GETTER SETTER CAR TROP DE CONDITIONELLE IF
        /**@type {_battler} - un battler selection par le currentBattler */ //TODO: ARRAYS ? ou creer un autre aray pour extendre a partir du battler selectionner
        this.targetBattlerSelected = null;
        /** Un event ou action est en cour, standby le ticker */
        this._busy = false;
    
        
    };
    /** obtien le id du battler en cour de turn */
    get sourceID() { return $combats.currentBattlerTurn._battlerID };
    /** obtien le id du battler comme cible */ //todo: fixme: penser au system de propagation multi-target 
    get targetID() { return $combats.targetBattlerSelected._battlerID };

    /** list des battlers vivant, partie et disponible */
    get activeBattlers(){return this.battlers.filter(b => !b.isDeath && !b.isRan ) }; // TODO: FAIR UN CACHE optimize pour le tikers

    
    //#region [rgba(255, 255, 255, 0.07)]
    /**initialise les etapes de combats, le setup du combat est passer en options.
     * @param {DataObj_Case} dataObj 
     * @param {Promise<Token>} resolve promise to the token.
     * */
    initialize(dataObj,resolve){
        this._started = true;
        $stage.interactiveChildren = false;
        this.initialCase = dataObj;
        this.intitialize_culling();
        this.intitialize_battlers();
        this.intitialize_tiker();
        this.intitialize_environement();
        this.battleStartAnimations();
        /** informaiton de bases des monstres generer par boot game ou aleatoire */ //TODO:
       // const dataMonsters = dataObj._bountyData.dataMonsters || $monsters.getRanDataMonsterList();
       //this.intitialize_environement();
       //
        
        //return this.intitialize_tweens();
    };

    /** prepare le culling pour le combat:*/
    intitialize_culling(){
        $camera._culling = false;
        const zoom = [$camera._zoom,0.5];
        const perspective = [$camera._perspective,-1];
        $camera.zoom = zoom[1];
        $camera.perspective = perspective[1];
        $camera.doCulling(false,true);
        $camera.zoom = zoom[0];
        $camera.perspective = perspective[0];
    };
    /** execute les methods preparatoire du combat lier a l'environement. on peut passer des options special si story */
    intitialize_environement(){
        this.intitialize_visibleObjs();
        this.intitialize_combatCases ();
        this.intitialize_monstersPositions   ();
        this.intitialize_background   ();
        this.intitialize_huds   ();
        //this.setupInteractive  (clear);
        //this.setupCombatTime   (clear);
    };
    /** calcule et trouve les case potentiel en combat pouvant etre utiliser selon le culling */
    intitialize_combatCases(){
        this.cases = $objs.CASES_L.filter(c => c.child.renderable );
        //!passe les case visible ne mode combat
        this.cases.forEach(Case => {
            Case.setCombatMode(true);
        });
    };
    /** asigne un emplacement strategique dans l'environement au monsters */
    intitialize_monstersPositions(dataObj = this.initialCase){
        //!positioning monsters
        const avaible = this.cases.slice(); // copy
        const monsters = this.monsters.slice();
        avaible.remove($players.p0.inCase);
       // avaible.remove($player2.inCase); TODO:
        //#pass1 asign les monstre selon une distance ideal.
        const idealDistance = 200;
        for (let i=0, l=avaible.length; i<l; i++) {
            const cases = avaible[i];
            const dist = $camera.getDistanceFrom( $players.p0.p, cases.child );
            if( dist.d > idealDistance ){
                const monster = monsters.pop();
                monster.p.position3d.copy(cases.child.position3d);
                monster.transferToCase(cases);
                if(!monsters.length){break};
            }
        };
        //!pass2 force asignation des monstre dans une case aleatoire.
        if(monsters.length){

        }
    };
    /** calcule une list obj de l'environement a masquer/affiche durant le combat */
    intitialize_visibleObjs(){
        $objs.LOCAL.forEach(dataObj => {
            const cat = dataObj.dataBase._category;
            if(['Grass','Trees'].contains(cat)){ //#showed_obj
                this.showed_obj.push(dataObj);
            }else{ //!hided_obj
                this.hided_obj.push(dataObj);
            };
        });
    };

    intitialize_background(){
        const spriteCombatBg = $stage.scene.background.child.c;
        $stage.scene.background.child.addChild(...spriteCombatBg);
        spriteCombatBg[0].alpha = 0;
        spriteCombatBg[1].alpha = 0;
    };

    /** update les battlers disponible */
    intitialize_battlers(bountyData = this.initialCase._bountyData){
        bountyData.forEach(_monster_Base => {
            const monster = $monsters.create(_monster_Base);
            this.monsters.push( monster );
            $stage.scene.addChild(monster.p);
        });
        this.battlers = [...$players.group];
        //!asign un id de combat unique et permanent
        for (let i=0, l=this.battlers.length; i<l; i++) {
            this.battlers[i]._battlerID = i;
        };
    };

    /** prepare et ajoute les huds a la scene et pass en mode combatle hud pinBar*/
    intitialize_huds(){
        $gui.MiniMap.hide();
        $gui.Combat_Selector.initialize(this.battlers);
        
    };
    /** Start l'animation de combat (BOOT) */
    battleStartAnimations(){
        const master = new TimelineMax();
        const zoomFilter_d = $systems.PixiFilters.ZoomBlurFilter_d;
        const zoomFilter_n = $systems.PixiFilters.ZoomBlurFilter_n;
        const ShockwaveFilter = $systems.PixiFilters.ShockwaveFilter;
        const SceneBackgroundCombat = $stage.scene.background.child.c;
        const maskCircle = new PIXI.Graphics();
            maskCircle.lineStyle(0).beginFill(0xffffff, 1).drawCircle(0, 0, 200).endFill(); //todo: do it in photoshop
            const maskCircleSprite = new PIXI.Sprite($app.renderer.generateTexture(maskCircle));
        $camera._planeUpdate = true; // en combat seulement , test

        const initMask = () => {
            const tl = new TimelineMax();
                tl.call(() => { // the scale of mask is update in 'doShockWave' ticks and sync with ShockwaveFilter.time
                    maskCircleSprite.anchor.set(0.5);
                    maskCircleSprite.position.set(1920/2,600);
                    $stage.scene.background.child.c[0].mask = maskCircleSprite;
                    $stage.addChild(maskCircleSprite);
                } ,null,null,0);
            return tl;
        };

        const initShockWave = () => {
            const tl = new TimelineMax();
                tl.call(() => {
                    zoomFilter_d.center = [1920/2,600];
                    zoomFilter_n.center = [1920/2,-145];
                    ShockwaveFilter.time = 0;
                    $displayGroup._layer_diffuseGroup.filters = [zoomFilter_d,ShockwaveFilter];
                    $displayGroup._layer_normalGroup .filters = [zoomFilter_n];
                    SceneBackgroundCombat[0].filters = [ShockwaveFilter];
                    $audio._sounds.TRA_A.play("TRA_A26");
                    $audio.bgm.length && tl.to($audio.bgm, 2, { speed:0, ease: Power2.easeInOut });//TODO:
                } ,null,null,0);
            return tl;
        };

        const doZoomShake = () => {
            const tl = new TimelineMax();
                tl.to(zoomFilter_d, 2, { strength:0.09, innerRadius:110,radius:-28.18, ease: Power4.easeOut },0);
                tl.to(zoomFilter_n, 2, { strength:0.7, innerRadius:250,radius:-1, ease: Power4.easeOut },0);
                tl.to($camera, 2, {_focus:1000, ease:Expo.easeOut },0);
                tl.to($camera, 2, {_perspective:-0.1,_ang:$camera._ang*-1, ease:Expo.easeOut },0);
                tl.to($camera, 2, {_zoom:1.4, ease: RoughEase.ease.config({ template:  Power2.easeOut, strength: 0.2, points: 70, taper: "in", randomize: false, clamp: false}) },0);
                tl.to($mouse.l.falloff, 1, {'0':16.1,'1':-30.7,'2':15.2, ease:Power4.easeOut },0);
                tl.to($mouse.l, 1, {brightness:6,lightHeight:0.2, ease:Power4.easeOut },0);
                tl.call(() => {
                    $audio._sounds.TRA_A.play("TRA_A5").speed = 0.8;
                    $audio._sounds.TRA_A.play("TRA_A30");
                } ,null,null,(2-$audio._sounds.TRA_A.sprites.TRA_A5.duration*0.8));
            return tl;
        };

        //!hide objet environement
        const hideObjs = () => {
            const tl = new TimelineMax();
            for (let i=0, l=this.hided_obj.length; i<l; i++) {
                const dataObj = this.hided_obj[i];
                if( !dataObj.isCases ){
                    tl.to(dataObj.child.euler, 1+Math.random(), {x:-Math.PI/2, ease:Bounce.easeOut },0 );
                    tl.to(dataObj.child, 1, {alpha:0, ease:Bounce.easeOut },1 );
                };
            };
            return tl;
        };

        const doShockWave = () => {
            const tl = new TimelineMax();
                tl.fromTo(SceneBackgroundCombat, 1, {alpha:0.2},{alpha:1, ease:Power3.easeOut },0);
                tl.fromTo(ShockwaveFilter, 3, {time:0,speed:200,brightness:1.2,wavelength:0,amplitude:-200},{time:5,amplitude:0,wavelength:350, ease:Expo.easeOut },0);
                tl.to($mouse.l.falloff, 1, {'0':0.8,'1':3,'2':20, ease:Power4.easeOut },0);
                tl.to($mouse.l, 1, {brightness:0.8,lightHeight:0.02, ease:Power4.easeOut },0);
                tl.call(() => {
                    zoomFilter_d.center[1] = 400;
                    $audio._sounds.battleA0.play({start:15.7}).Volume(0.5);
                } ,null,null,0);
                tl.eventCallback("onUpdate", ()=>{
                    maskCircleSprite.scale.set(ShockwaveFilter.time);
                });
            return tl;
        };

        const showMonsters = () => {
            const tl = new TimelineMax();
            tl.to(zoomFilter_d, 1, {innerRadius:260, ease: Power4.easeOut },0.5);
            //TODO: FILTRER LES MONSTRE NON DECOUVERT DANS LE MONSTERBOOK
            const monsters = this.monsters.filter(m=>m.isRegisteredInMbook); //TODO:
            if(!monsters.length){//TODO: SI AUCUN NOUVEAU MONSTRE A PRESENTER pass
                tl.to(zoomFilter_d, 0.5, { strength:0, innerRadius:0,radius:-1, ease: Back.easeIn.config(1.7) },0);
                tl.to(zoomFilter_n, 0.5, { strength:0, innerRadius:0,radius:-1, ease: Back.easeIn.config(1.7) },0);
                tl.add( $camera.moveToTarget($players.p0,2,Power4.easeOut,'combat2'),0);
                for (let i=0, l=this.monsters.length; i<l; i++) {
                    const m = this.monsters[i];
                    tl.call(() => {
                        m.appear();
                    } ,null,null,i/l);
                };
            }else{
                for (let i=0,delay=3.5,angle=0.4, l=monsters.length; i<l; i++) {
                    const m = monsters[i];
                    const to = m.p.position3d;
                    const time = delay*i;
                    angle = -angle;
                    if(monsters[i-1]){ // met les ennie transparent pour pas gener la vue
                        tl.fromTo(monsters[i-1].p, 0.5, {alpha:1},{alpha:0.1, ease:Power4.easeOut },time);
                    };
                    //! initiale from
                    tl.to($camera.view.position3d, 0.2, { x:to.x, y:-45, z:to.z, ease:Power4.easeOut },time);
                    tl.to($camera, 0.5, {_focus:800, ease:Power4.easeOut },time);
                    tl.to($camera, 0.2, {_perspective:-0.1,_ang:angle, ease:Power1.easeOut },time);
                    tl.to($camera, 0.5, {_zoom:0.39, ease:Power1.easeInOut },time);
                    //! end back littlebit
                    tl.to($camera, 2, {_focus:900, ease:Power1.easeInOut},1+time);
                    tl.to($camera, 2.5, {_perspective:-0.2,_ang:-angle, ease:Power1.easeIn },1+time);
                    tl.to($camera, 2.5, {_zoom:0.5, ease:Power1.easeInOut },1+time);
                    tl.call(() => {
                        $gui.Combat.show_CombatMathBox({monster:m});
                        m.appear();
                    } ,null,null,time+0.7);
                };
            };
            return tl;
        };

        const ending = () => {
            const tl = new TimelineMax();
            tl.to(zoomFilter_d, 0.2, { strength:0, innerRadius:0,radius:-1, ease: Back.easeIn.config(1.7) },0);
            tl.to(zoomFilter_n, 0.2, { strength:0, innerRadius:0,radius:-1, ease: Back.easeIn.config(1.7) },0);
            tl.add( $camera.moveToTarget($players.p0,0.4,Power4.easeOut,'combat2'),0);
            //!clear
            tl.call(() => {
                $displayGroup._layer_diffuseGroup.filters = null;
                $displayGroup._layer_normalGroup .filters = null;
                $stage.scene.background.child.c[0].mask = null;
                SceneBackgroundCombat[0].filters = null;
                $stage.removeChild(maskCircleSprite);
                this.start();
            });
            return tl;
        };

        master.add( initMask(),'initialize');
        master.add( initShockWave(),'initialize');
        master.add( doZoomShake(),'zoom');
        master.add( hideObjs(),'shock');
        master.add( doShockWave(),'shock');
        master.add( showMonsters(),'shock');
        master.add( ending(),'ending');
        //!debug
        Inspectors.Filters(ShockwaveFilter);
        Inspectors.Filters(zoomFilter_d);
        Inspectors.Timeline(master);  //DELETEME: DEBUG ONLY
    };

    /** create animation timeLine and return */
    intitialize_tweens(){
        //TODO: AJOUTER UN FOCUS SUR MONSTRER MASTER OU NOUVELLE MONSTERBOOK
        const tl = new TimelineMax();
        tl.to([...this.lights,...this.lights.map((l)=>l.l)], 3, { alpha:0.1, ease: Expo.easeOut },0)
        tl.to(this.hided, 3, { alpha:0, ease: Expo.easeOut },0)
        tl.call(() => {
            $combats.start();
        } ,null,null,5 ); // ,null,null,2.4
        return tl;
    };

    /** prepare le timer du combat et la gestion de tour */
    intitialize_tiker(){ //TODO: sort par id selon sta
        // comput max combat time
        let MaxTimeLimit = 0;
        this.battlers.forEach(b => { MaxTimeLimit+=b.sta });
        this._timeLimit = MaxTimeLimit;
        
        this.battlers.forEach(battler => { battler._battleTime = MaxTimeLimit });// assign a tous les personage la limite
        PIXI.ticker.shared.add(this.update, this);
    };

    //#endregion

    //#region [rgba(100, 100, 255, 0.05)]

    /**Start Combat timer 
     * @param {Number} timeout - timeout permetant dinitialiser le tour avec un delay avant start timer
    */
    start(timeout){
        this.clearTurn();
        timeout? setTimeout(() => { this._startedTurn = true; }, timeout) : this._startedTurn = true;
    };

    /** clear turn et reset */
    clearTurn(){
        if(this.currentBattlerTurn){
            this.currentBattlerTurn._battleTime = this._timeLimit; // reset timer of the battler
        };
        this._startedTurn = false;
        this.currentBattlerTurn = null;
        this.targetBattlerSelected = null;
        $gui.Combat.clearTurn();
        this.setupCombatMode($systems.COMBAT_MODE.TIMER);
    };

    /** Update timer Combat engine for battlers turn*/
    update(delta){
        if(!this._startedTurn || this.currentBattlerTurn ){return};
        if(!this.currentBattlerTurn){
            const next = this.update_turn();
            $gui.Combat.update_timers();
            next && this.startTurn(next);
        };
    };

    /** update les battlers turn time et assign un currentBattlerTurn */
    update_turn(){
        for (let i=0, battlers = this.activeBattlers, l = battlers.length; i<l; i++) {
            const b = battlers[i];
            if(b._battleTime<=0){
                return b;
            };
            b._battleTime-=(b.sta/this._battleSpeed);
        };
    };

    /** start setup turn */
    startTurn(battler){
        this.currentBattlerTurn = battler;
        // $mouse._busy = false; // prevent global mouse event
        // selon le player changer les icon tetxure huds options
        
        //$hud_pinBar.setOptionSlotsTextures("monsterBook", "capaBook|magicBook", "atk", "def", "move", "run", "asimilation|identification")
        if(battler.isPlayers){
            $gui.Combat.initialize_turn(battler._battlerID);
            this.setupCombatMode($systems.COMBAT_MODE.SELECT_ACTION);
        };
        if(battler.isMonsters){
            $gui.Combat.initialize_turn(battler._battlerID);
          //  this.setupCombatMode('timer');
          //  battler.checkActions();
            //!monster IA
        };
        //this.setCombatModeTo(0);
    };

    /** clear tous les elements apres un turn */
    endTurn(){
        //todo: fait quelque chose de fin tour ?
   

       this.start(2500); // wait 1000ms et restard le ticks
    };
    //#endregion
    
    
    //#region [rgba(200, 200, 40, 0.05)]
    /** setup le mode rendu de combat selon des event et action click pendant les choix */
    // TODO: SETUP COMBAT MODE SELON LES ACTION CLICK RENDU ICI
    setupCombatMode(combatMode=this._combatMode, actionMode = this._actionMode ){
        this._combatMode = combatMode; //todo: id avec un getter a id combatMode{timer:0,selectAction:1...}
        this._actionMode = actionMode; //todo: id avec un getter a id combatMode{timer:0,selectAction:1...}
        //this.currentBattlerTurn && (ctype!==undefined) && ( this.currentBattlerTurn.setCombatActionType(ctype) ); // asign le type action selectionner
        //!kill les camera car les mode utilise des camera dynamic
        //TweenLite.killTweensOf($camera);
        //TweenLite.killTweensOf($camera.view.position3d);
        switch (combatMode) {
            // mode animation, camera, attente d'un tour
            case $systems.COMBAT_MODE.TIMER: this.setCOMBAT_MODE_TIMER(); break;
            // mode information++ et choix action
            case $systems.COMBAT_MODE.SELECT_ACTION: this.setCOMBAT_MODE_SELECT_ACTION(); break;
            // selection d'un target lorsque action est defenie + setup booster
           // case 'selectTarget': this.setCombatMode_selectTarget (); break;
           // case 'setupAction' : this.setCombatMode_setupAction  (); break;
        };
    };
    /** mode combat timer (attente timers battlers) */
    setCOMBAT_MODE_TIMER(){
        $stage.interactiveChildren = false;
        const delay = Math.max(Math.min(...this.activeBattlers.map(b=>b._battleTime)),0.8); //apriximation du prochain tours avec camera de recul min:0.8 seconde
        TweenLite.to($camera, delay, {_zoom:1.1,_focus:2400,_perspective:-0.58,_ang:0, ease:Power1.easeIn } );
        $gui.Combat.show_CombatMathBox();
    };

    /** choisi une action menue */
    setCOMBAT_MODE_SELECT_ACTION(){
        $stage.interactiveChildren = true;
        //!affiche les monster info
        this.focusBattler(null);
        $gui.Combat.show_CombatActions();
        $gui.Combat.enable_CombatSelectors(false);
        $gui.Combat.show_CombatMathBox();
        $gui.PinBar.showOptions(true);
        $camera.moveToTarget(this.currentBattlerTurn,2,Power4.easeOut,'combat2');
        //TweenLite.to($camera, 1, {_zoom:0.6, _ang:0.12,_perspective:-0.5,_focus:5000, ease:Expo.easeOut } );
        //TweenLite.to($camera.view.position3d, 1, {y:-100, ease:Expo.easeOut } ); //TODO: TARGET
        //$stage.scene.interactiveChildren = false;
    };

    /** mode de selection une cible */
    setCombatMode_selectTarget(){
         $gui.Combat.enable_CombatSelectors(true);
         $gui.PinBar.showOptions(false);
         $stage.scene.interactiveChildren = true;
         TweenLite.to($camera, 4, {_zoom:0.7, _ang:0.1,_perspective:-0.55,_focus:4500, ease:Elastic.easeOut.config(1, 0.46) } );
         TweenLite.to($camera.view.position3d, 2, { y:-100, ease:Expo.easeOut } ); //TODO: TARGET
         const mCases = this.checkPossibleActionInteraction();
         this.showed_obj.forEach(obj => { // TODO: DISABLE OBJ INTERACTIVE
             obj.child.interactive = false;
         });
        $gui.Combat.show_CombatMathBox();

    };

    /** configur l'actions, si un objet est tenue,'utilise */
    setCombatMode_setupAction(){
        const battlerID = this.targetBattlerSelected._battlerID;
        this.focusBattler(battlerID);
        $gui.Combat.select_CombatSelectors(battlerID);
        $gui.Combat.show_CombatMathBox();
        //$huds.pinBar.interactiveChildren = true;
        ////!cache les autres monster info, garde le target
        //this.monsters.forEach(monster => {
        //    if(this.targetBattlerSelected !==monster ){
        //        monster.hideStates();
        //        monster.p.alpha = 0.1;
        //        monster.inCase.child.interactive = false;
        //    }
        //});
        //$camera.moveToTarget( this.targetBattlerSelected ,1,Expo.easeOut,'combat3'); //zoom $huds.Combat.selected.target
        //const distZ = this.currentBattlerTurn.p.position3d._z-this.targetBattlerSelected.p.position3d._z;
        //TweenLite.to($camera.view.pivot3d, 2, { y:320, ease:Expo.easeOut } ); //TODO: CENTRE L'ECRANT SELON DISTANCE
        //$huds.Combat.showCombatHuds(this.currentBattlerTurn);
        //
        //$huds.pinBar.showOptions(false); //TODO: FOCUS SLOT
        // version information
        //const DMG = new _combats._DMG(this.currentBattlerTurn,$huds.Combat.selected.target,$huds.pinBar.selected._ctype); //TODO :NEED
        //$huds.Combat.showCombatMath(this.currentBattlerTurn,$huds.Combat.selected.target);// pass objet DMG pour utiliser ces method de calcul
    
    };

    /** verify les case interactive possible pour une actions */
    checkPossibleActionInteraction(){
        const mCases = this.monsters.map(m=>m.inCase);
        //TODO: creer les math forule pour verifier les collision?
        this.cases.forEach(c => {
            c.child.interactive = mCases.contains(c) || false;
        });
        return mCases;
    };

    /** Lorsque hover case ou selector, affiche les optionsPossible sur le target de la cases */
    selectTarget(battlerID){
        const battler = this.battlers[battlerID];
        if(this._combatMode===''){
            $combats.setupCombatMode('selectTarget', this._actionType);
            this.setupCombatMode(mode,ctype)
        };
        this.targetBattlerSelected = battler;
        $gui.Combat.select_CombatSelectors(battlerID);
        $camera.moveToTarget(battlerID,2,Power4.easeOut,'combat2')
    };
    /** Lorsque hover case, affiche les optionsPossible sur le target de la cases */
    unSelectTarget(){//todo: verifier si pas bug
        /**@type _monsters._monster */
        if(this.targetBattlerSelected){
            this.targetBattlerSelected = null;
            this.focusBattler(null);
        }
    };

    /** focus sur un blattler selectioner */
    focusBattler(battlerID){
        for (let i=0, l=this.battlers.length; i<l; i++) { // hide les battler unselected
            const battler = this.battlers[i];
            if(!Number.isFinite(battlerID) || (battler._battlerID === battlerID) || (battler._battlerID === this.currentBattlerTurn._battlerID) ){
                battler.p.alpha = 1;
            }else{
                battler.p.alpha = 0.1;
            }
        };
        Number.isFinite(battlerID) && this.currentBattlerTurn.needReversX(this.battlers[battlerID].p) && this.currentBattlerTurn.reversX(true);
        //battler.s.skeleton.slots.forEach(s=>s.currentSprite?s.currentSprite.filters = [$systems.PixiFilters.OutlineFilterx4white]:null ); //TODO: meilleur approche pour filtre sur spine
    }
    //#endregion

    /** affiche un dammage */
    showDmg(target){
        const dmgValue = $gui.Combat.CombatMathBox.getResult();
        const c = new PIXI.projection.Container3d();
        const dmg = new PIXI.Text(dmgValue,$systems.styles[3]);
        c.position3d.set(target.p.position3d.x,-target.p.height,target.p.position3d.z);
        c.proj.affine = 3;
        c.addChild(dmg);
        $stage.scene.addChild(c);
        const tl = new TimelineMax();
        tl.fromTo(c.scale3d, 3, {x:2.2,y:2.2},{x:1,y:1, ease:Elastic.easeOut.config(1.2, 0.6) },0);
        tl.from(c.position3d, 4,{y:'-=100', ease:Expo.easeOut },0);
        tl.to(c.scale3d, 1,{x:'+=0.1',y:'+=0.1', ease:Expo.easeOut },3);
        tl.to(c, 1.1,{alpha:0, ease:Power3.easeOut },3);
        tl.call(() => { c.destroy() } );
    };

    /** execute l'actions choisis 
     * @param CombatMath
     * @param Items
    */
    doAction(ItemsSprites){
        $stage.interactiveChildren = false;
        //! setup var
        const source = this.currentBattlerTurn;
        const target = this.targetBattlerSelected;
        const sourcePos = source.p.position3d;
        const targetPos = target.p.position3d;
        //! math var
        const distX = source.p.position3d._x-target.p.position3d._x; //distance between source <=> target
        const sign = Math.sign(distX); // sybol de distance for dynamic range
        const x0 = targetPos._x+(300*sign);
        const w = 100;
        const l = ItemsSprites.length;
        //! map items transform
        const It_scale3d =  ItemsSprites.map(it=>it.scale3d);
        const It_position3d =  ItemsSprites.map(it=>it.position3d);
        const It_euler =  ItemsSprites.map(it=>it.euler);

        //#DMG : permetra des click pour maximiser les dmg crt .. 
        let bonusFactor = 0;
        //! ease pre-setup
 
        //! timeline actions
        source.s.state.timeScale = 2;//todo: voir si on peut combiner le temp d'animation avec un tween vide ?
        const master = new TimelineMax();
        /** focus hit du actionHud ansi que ces slots */
        function itemsFocus() {
            const tl = new TimelineMax();
            tl.add("ItemFocus",0);
            tl.add("ItemMove",0);
            tl.to(It_scale3d, 1, { x:1.4, y:1.4, ease: Back.easeIn.config(3) },'ItemFocus');
            tl.to(It_euler, 1, { z:Math.PI*3, ease:  SlowMo.ease.config(0.5, 0.7, false) },'ItemFocus');
            tl.to(It_position3d, 0.5, { x:`+=${250}`,y:`+=${65*l}`,z:(i)=> `+=${(i - (l - 1) / 2) * w}`,  ease: Expo.easeOut},'ItemFocus');
            return tl;
        }
        /** move les Items vers la source */
        function moveItemsToSource() {
            const tl = new TimelineMax();
            tl.to(It_scale3d, 0.2, { x:1, y:1, ease: Back.easeIn.config(3) },0);
            tl.to(It_euler, 0.2, { z:-Math.PI*3, ease:  SlowMo.ease.config(0.5, 0.7, false) },0);
            tl.to(It_position3d, 0.2, { x:(i)=> sourcePos.x+100*sign,y:(i)=>sourcePos.y-20,z:(i)=>sourcePos.z,  ease:Expo.easeIn },0);
            return tl;
        }

        /** move source entre le target pour action */
        function moveSourceHalfTarget() {
            const tl = new TimelineMax();
                tl.call(() => {
                    source.s.state.setAnimation(3,'moveHalf',false,0);
                } ,null,null,'0');
                tl.to(sourcePos, 0.2, { x:x0, z:targetPos.z-1, ease: Power4.easeIn },0 );
            return tl;
        }

        /** move les Items vers la source */
        function cameraFocusToPlayer() {
            const tl = new TimelineMax();
                tl.to($camera, 1, {_focus:1600, ease:Expo.easeOut },0);
                tl.to($camera, 1, {_perspective:-0.28,_ang:$camera._ang*sign, ease:Expo.easeOut },0);
                tl.to($camera, 1, {_zoom:0.65, ease:Expo.easeOut },0);
                tl.to($camera.view.position3d, 1, {x:sourcePos.x,z:targetPos.z, ease:Expo.easeOut },0);
            return tl;
        };
        /** prepare action avec les item */
        function prepareItem() {
            const tl = new TimelineMax();
                tl.call(() => {
                    source.s.state.setAnimation(3,'atkSlotFocus',false,0);
                } ,null,null,'0');
                tl.to($camera, 0.5, {x:`-=${200*sign}`,_zoom:0.5, ease:Expo.easeOut },0);
                tl.to(It_position3d, 0.5, { x:sourcePos.x+(165*sign),y:(i)=> `-=${i* w}`,  ease: Expo.easeInOut},0 );
                tl.to(It_euler, 0.5, { z:-Math.PI*2,  ease: Expo.easeInOut},0 );
            return tl;
        }
        /** effectu l'action, atk,def */
        function moveToTarget() {
            const tl = new TimelineMax();
                tl.call(() => {
                    source.s.state.setAnimation(3,'atk0',false,0);
                } ,null,null,0);
                tl.to($camera, 1, {_focus:1400, ease:Expo.easeOut },0.2);
                tl.to($camera, 1, {_perspective:-0.20,_ang:$camera._ang*sign, ease:Expo.easeOut },0.2);
                tl.to($camera, 1, {_zoom:0.4, ease:Expo.easeOut },0.2 );
                tl.to($camera.view.position3d, 0.3, {x:targetPos.x,z:targetPos.z, ease:Back.easeIn.config(1.2) },0.2 );
                tl.to(sourcePos, 0.2, { x:targetPos.x+((target.p.width/1.5)*sign), z:targetPos.z-1, ease: Back.easeIn.config(1.2) },0.2 );
                tl.call(() => {
                    target.s.state.setAnimation(3,'hit1',false); //todo: hit0 face, hit1 si reverse
                } ,null,null,0.4);
            return tl;
        };
        /** effectu l'action, move items */
        function moveToTargetItem() {
            const tl = new TimelineMax();
                tl.to(It_position3d, 0.4, { x:targetPos.x,y:-target.p.height/2,z:targetPos.z+1,  ease: Back.easeIn.config(1.5)},0 );
                tl.to(It_euler, 0.4, { z:Math.PI*2,  ease:  Back.easeIn.config(1.5)},0 );

                tl.to(It_position3d, 0.4, { x:(i)=> `+=${(i - (l - 1) / 2) * w}+${Math.randomFrom(1,400)}` ,y:-target.p.height, ease: Power4.easeInOut },0.4 );
                tl.to(It_euler,1, { z:-Math.PI*2,  ease: Expo.easeInOut},0.4 );
                tl.to(It_scale3d, 1, { x:1.2,y:1.2, ease: Power4.easeInOut }, 0.4);

            return tl;
        };
        /** effectu l'action, move items */
        function disipeItems() {
            const tl = new TimelineMax();
                //!disipation random x
                const xx = Math.randomFrom(-300,400);
               // tl.to(It_position3d, 2, { x:(i)=> `+=${xx*0.8}`,y:'-=15', ease: Power4.easeOut },1.2 );
               // tl.to(It_scale3d, 2, { x:1,y:1, ease: Power4.easeInOut }, 1.2);
                tl.to(It_euler,4, { z:0,  ease: Power3.easeInOut},0 );
                //!dissipe
                tl.to(It_position3d, 1, {  x:(i)=> `+=${Math.randomFrom(-300,400)}`,y:targetPos.y, ease: Power4.easeInOut },2.2 );
                tl.to(It_scale3d, 1, { x:0.4,y:0.4, ease: Power2.easeInOut }, 2.2);
                tl.call(() => {
                    ItemsSprites.forEach(Item => { //remetre en sorting
                        Item.parentGroup = $displayGroup.group[1];
                    });
                } ,null,null,2.5);
   
               
               // tl.to(It_position3d, 0.4, {  x:(i)=> `+=${xx*0.1}`,y:'-=50', ease: Power4.easeOut } );
               // tl.to(It_position3d, 0.4, {  y:targetPos.y, ease: Bounce.easeOut } );
                return tl;
        };

        /** source hit target */
        function hitTargetWithSource() {
            const tl = new TimelineMax();
                tl.to($camera, 1, {_focus:1400, ease:Expo.easeOut },0);
                tl.to($camera, 1, {_perspective:-0.3,_ang:$camera._ang*sign, ease:Expo.easeOut },0);
                tl.to($camera, 1, {_zoom:0.4, ease:Expo.easeOut },0 );
                tl.to(sourcePos, 1, { x:`+=${30*sign}`, ease: Power1.easeInOut },0 );
            return tl;
        };

        const showDmg = () => {
            const tl = new TimelineMax();
                tl.call(() => {
                    this.showDmg(target)
                } ,null,null,0);
        return tl;
        };

        
        /** revien au point initial */
        function comeBack() {
            const tl = new TimelineMax();
                tl.call(() => {
                    source.s.state.setEmptyAnimation(3,1)
                } ,null,null,'0');
                tl.to(sourcePos, 0.5, { x:source.inCase.child.p.position3d.x,z:source.inCase.child.p.position3d.z, ease: Power4.easeOut },0.5 );
                tl.to($camera, 0.5, {_focus:1750, ease:Expo.easeOut },0.5);
                tl.to($camera, 0.5, {_perspective:-0.7, ease:Expo.easeOut },0.5);
                tl.to($camera, 0.5, {_zoom:0.64, ease:Expo.easeOut },0.5 );
            return tl;
        };


        const haveItem = !!ItemsSprites.length;
        master.add('cameraToSource',0);

        haveItem&&master.add( itemsFocus(),'cameraToSource' );//si item
        master.add( moveSourceHalfTarget(),'cameraToSource');
        master.add( cameraFocusToPlayer(),'cameraToSource');
        haveItem&&master.add( moveItemsToSource() );//si item
        haveItem&&master.add( prepareItem(),'prepare' );//si item
        //! si prend prapare hit button, combot ?
        master.add( moveToTarget(),'action' );
        master.add( hitTargetWithSource(),'action' );
        haveItem&&master.add( moveToTargetItem(),'action' );//si item
         //!show dmg
        master.add('dmg',haveItem?'-=1':'-=0.8')
        master.add( showDmg(),'dmg' );
        haveItem&&master.add( disipeItems(),'dicipeItem-=1' );//si item
        master.add( comeBack(),'dicipeItem+=2' );//si item
        /*master.call(() => {
            $stage.interactiveChildren = true;
            //this.endTurn();
        } ,null,null,'+=0.2');
        master.timeScale(1.5);*/
        Inspectors.Timeline(master);  //DELETEME: DEBUG ONLY
    
        
    };

};

let $combats = new _combats();
console.log1('$combats', $combats);



