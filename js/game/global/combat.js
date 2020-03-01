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
class _Combats {
    /**@type {_Combats} - La scene Combat en cour*/
    static Active = null;
    constructor(bountyData) {
        /** @type {Array.<_monster_Base>} */
        this.bountyData = bountyData;
        /** @type {Array.<_monsters>} */
        this.Monsters = [];
        /** @type {Array.<_player0|_monsters>} */
        this.Battlers = [];
        /** @type {Array.<_DataObj_Case>} */
        this.combatCases = null;
        /** temp limit de combat  par tour*/
        this._timeLimit = 100;
        /** vitesse des tour */
        this._timeSpeed = 3;
        /** @type {_player0|_monsters} active current battler turn */
        this.currentBattlerTurn = null;
        this.child = null;
        this.initialize();
    }
    //#region [GetterSetter]
    get battleSpeed() {
        return 30; // fast:10 , slow:100 //todo: options
    }

    //#endregion
    
    //#region [Initialize]
    /**initialise les etapes de combats, le setup du combat est passer en options.
     * @param {_DataObj_Case} dataObj 
     * @param {Promise<Token>} resolve promise to the token.
     * */
    initialize(){
        _Combats.Active = this;
        $stage.interactiveChildren = false;
        this.intitialize_environement();
        this.intitialize_battlers();
        this.intitialize_huds();
        

        this.intitialize_tiker();
        gsap.TimeoutCallId(0.1, ()=>this.startBootAnimation(), 'startBootAnimation')
        //this.intitialize_environement();
        //this.battleStartAnimations();
        Inspectors.Combats();

    }
    intitialize_environement(){
        this.intitialize_culling     ();
        this.intitialize_visibleObjs ();
        this.intitialize_combatCases ();
    }
    
    intitialize_culling(){
        $camera._culling = false;
        const cullZoom = 0.5; // norme culling pour combat
        const cullPerspective = -1; // norme culling pour combat
        const zoom = $camera._zoom;
        const perspective = $camera._perspective;
        $camera.zoom = cullZoom;
        $camera.perspective = cullPerspective;
        $camera.doCulling(false,true);
        $camera.zoom = zoom;
        $camera.perspective = perspective;
        $camera._planeUpdate = true; // en combat seulement , test
    }

    /** calcule une list obj de l'environement a masquer/affiche durant le combat */
    intitialize_visibleObjs(){
        const objsToHide = [];
        const objsToKeep = [];
        const keepCat = ['Grass','Trees','Case']; // cat que on gard en combat
        $objs.LOCAL.filter(dataObj=>dataObj.p.renderable)
        .forEach((dataObj)=>{
            const cat = dataObj.dataBase._category;
            if(keepCat.contains(cat)){ objsToKeep.push(dataObj) }
            else{ objsToHide.push(dataObj) }
        })
        this.objsToHide = objsToHide;
        this.objsToKeep = objsToKeep;
    }

    intitialize_combatCases(){
        const combatCases = [];
        $objs.CASES_L.filter((dataObj)=>dataObj.p.renderable).forEach(dataObj => {
            combatCases.push(dataObj);
            dataObj.setCombatMode(true);
        })
        this.combatCases = combatCases;
    }

    /** creer les battlers disponible */
    intitialize_battlers(){
        const Monsters = [];
        this.bountyData.forEach(DataMonsters => {
            const Monster = new _monsters(DataMonsters);
            Monsters.push( Monster );
        })
        //!positionning
        const combatCases = this.combatCases.slice(); //copy
        const playerCase = $players.p0.inCase;
        const combatCasesSorted = combatCases.map(c=> {
            return { id:c._localCaseId ,d:$camera.getDistanceFrom( c.p, playerCase.p ).d };
        })
        .sort((a, b) => a.d-b.d).slice(-(Monsters.length+1)).sortRandom(); // +1 laisse 1 case potentielement aleatoir
        Monsters.forEach((m,i) => m.transferToCase(combatCasesSorted[i].id) );
        //!asign un id de combat unique et permanent
        const Battlers = [...$players.group,...Monsters];
        for (let i=0, l=Battlers.length; i<l; i++) {
            Battlers[i]._battlerID = i;
        }
        this.Battlers = Battlers;
        this.Monsters = Monsters;
        $stage.scene.addChild(...Monsters.map(m=>m.p));
    }
    /** prepare le timer du combat et la gestion de tour */
    intitialize_tiker(){
        this.Battlers.forEach(b => { b._battleTime = this._timeLimit });// assign a tous les personage la limite
        PIXI.ticker.shared.add(this.update, this);
    }
    /** prepare et ajoute les huds a la scene et pass en mode combatle hud pinBar*/
    intitialize_huds(){
        $gui.Minimap.hide();
        $gui.BattlersSelectors.show(this.Battlers);

    }
    //#endregion


    /** Start l'animation de combat (BOOT) */
    startBootAnimation(){
        const tl = gsap.timeline();
        const zoomFilter_d = $systems.PixiFilters.ZoomBlurFilter_d;
        const zoomFilter_n = $systems.PixiFilters.ZoomBlurFilter_n;
        const ShockwaveFilter = $systems.PixiFilters.ShockwaveFilter;
        const Background = $stage.scene.Background;
            Background.c.renderable = true;
            Background.c.visible = true;
        //todo: do it in photoshop
        const MaskCircle = new PIXI.Sprite( $app.renderer.generateTexture(
            new PIXI.Graphics().lineStyle(0).beginFill(0xffffff, 1).drawCircle(0, 0, 200).endFill()
        ));
        MaskCircle.scale.set(0);
        

        const initialize = function() {
            const tl = gsap.timeline({id:'initialize'});
            tl.add(() => { // initialize mask
                MaskCircle.anchor.set(0.5);
                MaskCircle.position.set(1920/2,600);
                Background.c.mask = MaskCircle;
                $stage.addChild(MaskCircle);
            })
            tl.add(() => { // initialize initShockWave
                zoomFilter_d.center = [1920/2,600];
                zoomFilter_n.center = [1920/2,-145];
                ShockwaveFilter.time = 0;
                $displayGroup._layer_diffuseGroup.filters = [zoomFilter_d,ShockwaveFilter];
                $displayGroup._layer_normalGroup .filters = [zoomFilter_n];
                Background.c.filters = [ShockwaveFilter];
                $audio._sounds.TRA_A.play("TRA_A26");
                $audio.bgm.length && tl.to($audio.bgm, 2, { speed:0, ease: Power2.easeInOut });//TODO:
            })
            return tl.to({},{});
        }

        const zoomShaker = function() {
            const shaker = RoughEase.ease.config({ 
                template:  Power2.easeOut, strength: 0.2, points: 70, taper: "in", randomize: false, clamp: false
            });
            const tl = gsap.timeline({id:'zoomShaker'});
            tl.to(zoomFilter_d, 2, { strength:0.09 , innerRadius:110, radius:-28 },0);
            tl.to(zoomFilter_n, 2, { strength:0.7  , innerRadius:250, radius:-1  },0);
            tl.to($camera, 2, {_focus:1000 , _perspective:-0.1, _ang:$camera._ang*-1 },0);
            tl.to($camera, 2, {_zoom:1.4, ease:shaker },0);
            tl.to($mouse.l.falloff, 1, {'0':16.1,'1':-30.7,'2':15.2, ease:Power4.easeOut },0);
            tl.to($mouse.l, 1, {brightness:6,lightHeight:0.2, ease:Power4.easeOut },0);
           tl.add(() => { // initialize initShockWave
                $audio._sounds.TRA_A.play("TRA_A5").speed = 0.8;
                $audio._sounds.TRA_A.play("TRA_A30");
                //$audio._sounds.TRA_A.sprites.TRA_A5.duration
            })
            return tl;
        }


        const hideObjs = ()=>{
            const tl = gsap.timeline({id:'hideObjs'});
            tl.add(() => {
                for (let i=0, l=this.objsToHide.length; i<l; i++) {
                    const dataObj = this.objsToHide[i];
                    tl.to(dataObj.p.euler, 1+Math.random(), {x:-Math.PI/2, ease:Bounce.easeOut },0 );
                    tl.to(dataObj.p, 1, {alpha:0, ease:Bounce.easeOut },1 );
                };
            })
            return tl;
        }


        const doShockWave = ()=>{
            const tl = gsap.timeline({id:'doShockWave'})
            const ease = SlowMo.ease.config(0.1, 0.7, false);
                tl.fromTo(Background.c, 1, {alpha:0.2},{alpha:1, ease:ease },0);
                tl.fromTo(ShockwaveFilter, 2,
                    { time:0, amplitude:-100, wavelength:0  , speed:200,brightness:1.3,                    },
                    { time:5, amplitude: 10  , wavelength:390, speed:250,brightness:1.6  , ease:ease },0 );
                tl.to($mouse.l.falloff, 1, {'0':0.8,'1':3,'2':20, ease:Power4.easeOut },0);
                tl.to($mouse.l, 1, {brightness:0.8,lightHeight:0.02, ease:Power4.easeOut },0);
                tl.add(() => {
                    zoomFilter_d.center[1] = 400;
                    $audio._sounds.battleA0.play({start:15.7}).Volume(0.5);
                })
                tl.eventCallback("onUpdate", ()=>{
                    MaskCircle.scale.set(ShockwaveFilter.time+0.5);
                })
            return tl;
        }

        const showMonsters = () => {
            const tl = gsap.timeline({id:'showMonsters'})
            //tl.to(zoomFilter_d, 1, {innerRadius:260 },0.5);
            //TODO: FILTRER LES MONSTRE NON DECOUVERT DANS LE MONSTERBOOK
            const Monsters = this.Monsters//.filter(m=>m.isRegisteredInMbook); //TODO:

            tl.to(zoomFilter_d, 0.5, { strength:0, innerRadius:0,radius:-1, ease: Back.easeIn.config(1.7) },0);
            tl.to(zoomFilter_n, 0.5, { strength:0, innerRadius:0,radius:-1, ease: Back.easeIn.config(1.7) },0);
            tl.add( $camera.moveToTarget($players.p0,2,Elastic.easeOut.config(1, 0.8),'combat2'),0);
            Monsters.forEach(m => {
                tl.add( ()=>m.appear() ,0);
            })
            return tl;
        };
        const ending = () => {
            const tl = gsap.timeline({id:'ending'})
            tl.add( $camera.moveToTarget($players.p0,0.4,Power4.easeOut,'combat2'),0);
            //!clear
            tl.add(() => {
                $displayGroup._layer_diffuseGroup.filters = null;
                $displayGroup._layer_normalGroup .filters = null;
                Background.c.mask = null;
                Background.c.filters = null;
                $stage.removeChild(MaskCircle);
                this.startTimer();
            })
            return tl;
        };
        tl.add( initialize(),'initialize');
        tl.add( hideObjs(),'shock');
        tl.add( zoomShaker(),'shock');
        tl.add( doShockWave(),'showMonsters');
        tl.add( showMonsters(),'showMonsters');
        tl.add( ending(),'ending-=0.1');

        //!debug
       Inspectors.Filters(ShockwaveFilter);
       //Inspectors.Filters(zoomFilter_d);
       Inspectors.Timeline(tl);  //DELETEME: DEBUG ONLY
    }
    


    /**Start Combat timer 
     * @param {Number} timeout - timeout permetant dinitialiser le tour avec un delay avant start timer
    */
    startTimer(timeout=1){
        $stage.interactiveChildren = true;
        //this.clearTurn();
        setTimeout(() => { this._startedTurn = true; }, timeout);
    };


    /** Update timer Combat engine for battlers turn*/
    update(delta){
        if(this._startedTurn){
            if(!this.currentBattlerTurn){
                const next = this.update_turn();
                //$gui.Combat.update_timers();
                next && this.startTurn(next);
            }
        }
    }

    /** update les battlers turn time et assign un currentBattlerTurn */
    update_turn(){
        for (let i=0, l = this.Battlers.length; i<l; i++) {
            const Battler = this.Battlers[i];
            if(Battler._battleTime<=0){
                return Battler;
            }
            const value = (Battler.sta/10)*this._timeSpeed
            Battler._battleTime-=(value);
        }
        $gui.BattlersSelectors.update_turn()
    }

    /** start setup turn */
    startTurn(Battler){
        this.currentBattlerTurn = Battler;
        // $mouse._busy = false; // prevent global mouse event
        // selon le player changer les icon tetxure huds options
        
        //$hud_pinBar.setOptionSlotsTextures("monsterBook", "capaBook|magicBook", "atk", "def", "move", "run", "asimilation|identification")
        if(Battler.isPlayers){
           $gui.BattlersCommands.show();
           $gui.BattlersSelectors.startTurn();
           // $gui.Combat.initialize_turn(battler._battlerID);
           // this.setupCombatMode($systems.COMBAT_MODE.SELECT_ACTION);
        };
        if(Battler.isMonsters){
            //$gui.Combat.initialize_turn(battler._battlerID);
            //  this.setupCombatMode('timer');
            //  battler.checkActions();
            //!monster IA
        };
        //this.setCombatModeTo(0);
    }

    startRoll(){
        $mouse.showHelpBox('Combat roll');
    }

    focusOnBattler(battlerID){
        const battler = this.Battlers[battlerID];
        $camera.moveToTarget(battler,0.2,Power4.easeOut,'combat2')
    }
}


