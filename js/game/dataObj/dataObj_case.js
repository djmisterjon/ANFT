
class _DataObj_Case extends _DataObj_Base {
    //#region [Static]
    /** store le SpidersSucces pour le pathfinding */
    static SpidersSucces = null;
    /** lorsque click sur cases, commence le parcour selon les les path */
    static ActivePath = [];
    //#endregion

    /**
     *Creates an instance of _DataObj_Case.
     * @param {string} _dataBaseName
     * @param {string} _textureName
     * @param {_Factory} [factory]
     * @memberof _DataObj_Case
     */
    constructor(_dataBaseName,_textureName, factory) {
        super(_dataBaseName,_textureName, factory);
        /**@type {Number} Id global cases dans le jeux */
        this._globalCaseId = Infinity;
        /**@type {Number} Id local cases dans la scene */
        this._localCaseId  = Infinity;
        /** allow generate random color */
        this._randomColor = true;
        /** allow generate random bounty */
        this._randomBounty = true;
        /** couleur type de la case */
        this._color = '';
        /** prime type de la case */
        this._bounty = '';
        /** les data generer pour le bounty si besoin (combat,golds...) */ //TODO: DOI ETRE UN ID
        this._bountyData = Infinity; //TODO: CREER UN POOL POUR LES BOUNTYDATA
        /** connextion des paths */
        this.pathConnexion = {};
        /** si la case a eter visiter */
        this._visited = false;
        /**Contien les element grafic input pour help ou action xbox */
        //this.input = [];
        /**battlers id onCase: identifier le id du battlers pour combat */
        //this._battlerID = null;
        /** @type {{ 'CaseColor': PIXI.projection.Sprite3d, 'CaseBounty':PIXI.projection.Sprite3d }} */
        this.child = null;
        Object.defineProperty(this, 'child',{enumerable:false});
        //todo: enumerable false pour certain props
    }

    //#region [GetterSetter]
    /** return  */
    get bountyData() {//TODO:
        return $systems.bountyDataFromId //this._bountyData;
    }
    /** obtien couleur du case*/
    get color() {
        return this._color;
    }
    
    /** Change la couleur du case */
    set color(value) {
        this._color = value || 'white';
        this.child.CaseColor.tint = this._color? $systems.colorsSystem[this._color] : 0xffffff;
    }
    /** return texture bounty, ou vierge default */
    get bounty() {
        return this._bounty;
    }
    set bounty(value) {
        this._bounty = value || 'caseEvent_hide';
        const texture = $loader.DATA2.CasesBounties.textures[this._bounty];
        this.child.CaseBounty.texture = texture;//todo: voir comment cible le childrentoname ?
    }
    //#endregion

    //#region [Initialize]
    initialize(){
        this.initialize_base();
        this.initialize_interactive();
    }
    initialize_base(){
        const dataBase = this.dataBase;
        const dataBase2 = $loader.DATA2['CasesBounties'];
        //cage color 
        const CaseColor = new PIXI.projection.Sprite3d(dataBase.textures.cColor).setName('CaseColor');
            CaseColor.anchor.set(0.5);
            CaseColor.position3d.set(0,-80,0);
            CaseColor.parentGroup = PIXI.lights.diffuseGroup;
        const CaseBounty = new PIXI.projection.Sprite3d(dataBase2.textures[this.bounty] ).setName('CaseBounty');
            CaseBounty.anchor.set(0.5,1);
            CaseBounty.position3d.set(0,-80,0);
            CaseBounty.parentGroup = PIXI.lights.diffuseGroup;
            CaseBounty.euler.x = Math.PI/3;
        this.p.addChild(CaseColor,CaseBounty);
        this.child = this.p.childrenToName(this.p.child);
        //TODO: RENDU ICI , SYSTEM FONCTIONELL CHILDRENTO NAME
        // les type objet on leur prop child cibler, mais on doit heviter s'asimiler les child des container
    }
    /** Interaction de base qui peuvent appeller les super interaction*/
    initialize_interactive(){
        const Container = this.p;
        Container.interactive = true; 
        Container.on('pointerover' , this.pointerover ,this);
        Container.on('pointerout'  , this.pointerout  ,this);
        Container.on("pointerdown" , this.pointerdown ,this);
        Container.on('pointerup'   , this.pointerup   ,this);
    }
    //#endregion

    //#region [Interactive]
    /**@param {PIXI.interaction.InteractionEvent} e */
    pointerover (e) {
        const ee = e.currentTarget; // this.child.container
        $audio._sounds.BT_A.play("BT_A07").Speed(1.4).Volume(0.2);
        ee.d._filters = [ $systems.PixiFilters.OutlineFilterx4white ];
        if($combats._started){ //FIXME: en move move permetre ???? :
            //$combats.selectTarget(this._battlerID);
        }else{
            this.initializePathFinding(ee);
            this.showCasesPath(ee);
        }
        this.showXboxInput();
        this.showSelector();
    }
    pointerout(e) {
        const ee = e.currentTarget; // this.child.container
        ee.d._filters = null;
        if($combats._started){ //FIXME: probleme en mode combat. Il faut permet ca en  mode `move`, mais pas en mode attack
            
        }else{
            this.clearCasesPath(ee);
        }
        this.hideXboxInput();
        this.hideSelector();
    };
    
    pointerdown(e) {
        const ee = e.currentTarget; // this.child.container
        if(this.__Selector){
            TweenLite.fromTo(this.__Selector.scale3d, 0.4, {x:1.2,y:1.2},{x:1,y:1, ease:Back.easeOut.config(1.7)})
        }
    }

    pointerup(e) {
        const c = e.currentTarget;
        if($combats._started){ //FIXME: probleme en mode combat. Il faut permet ca en  mode `move`, mais pas en mode attack
            return $combats.selectTarget(this._battlerID);
        }else
        if(_DataObj_Case.SpidersSucces && $gui.Travel.sta>0) {
            // start move path
            _DataObj_Case.ActivePath = _DataObj_Case.SpidersSucces.travel.splice($gui.sta); // remove les path selon stamina possible
            $players.p0.initialisePath();
            this.playFX_landing();
            this.pointerout(e);
        };
    }
    //#endregion
    
    /** update des getter speciaux */
    update(){
        this.color = this._color;
        this.bounty = this._bounty;
    }

    /**Affiche le chemin des cases selon les spiders */
    showCasesPath(){
        if(_DataObj_Case.SpidersSucces){
            const SpidersSucces = _DataObj_Case.SpidersSucces;
            const LOCAL = $objs.LOCAL; // getter
            for (let i=0, l=SpidersSucces.travel.length; i<l; i++) {
                const id = SpidersSucces.travel[i];
                const dataObj = LOCAL[id];
                const f = i<$gui.Travel.sta+1? $systems.PixiFilters.OutlineFilterx8Green : $systems.PixiFilters.OutlineFilterx8Red
                dataObj.p.d.filters = [f];
                TweenLite.fromTo(f, 0.3, {thickness:0},{thickness:5,ease:Power4.easeOut});
            };
        }
    };
    /**clear chemin des cases spiders */
    clearCasesPath(){
        if(_DataObj_Case.SpidersSucces){
            _DataObj_Case.SpidersSucces.travel.forEach(id => {
                const LOCAL = $objs.LOCAL; // getter
                const dataObj = LOCAL[id];
                dataObj.p.d.filters = null;
            });
            _DataObj_Case.SpidersSucces = null;
        }
    };

    /** affiche indicateur xbox input */
    showXboxInput(){
        //!data2/System/xboxButtonHelper/SOURCE/images/xb_A.png
        const dataBase4 = $loader.DATA2.XboxButonsHelper;
        const xButton_A = $objs.ContainerDN(dataBase4, 'xb_A','xButton_A');
        xButton_A.convertTo3d();
        xButton_A.parentGroup = $displayGroup.group[2];
        xButton_A.d.anchor.set(0.5);
        xButton_A.n.anchor.set(0.5);
        xButton_A.position.set(0);
        const value = _DataObj_Case.SpidersSucces && `Cost: ${_DataObj_Case.SpidersSucces.travel.length}` || `SELECT TARGET`;
        const txt_A = new PIXI.Text(value,$systems.styles[0]);
            txt_A.name = 'txt_A';
            txt_A.anchor.set(1,0.5);
            txt_A.position.x = -40;
            xButton_A.addChild(txt_A);
            xButton_A.euler.x = Math.PI/2;
            xButton_A.position3d.z = -200;
        this.p.addChild(xButton_A);
        this.input = [xButton_A];
    };
    
    /** clear xbox button helper */
    hideXboxInput(){
        if(this.input.length){
            this.input.forEach(c => {
                this.p.removeChild(c);
                c.destroy();
            });
            this.input = [];
        }
    };
    /** affiche un selector */
    showSelector(){
        //!data2/System/Selectors/SOURCE/images/selector_bigCircle.png
        const dataBase = $loader.DATA2.Selectors;
        const Selector = new PIXI.projection.Sprite3d(dataBase.textures.selector_bigCircle);
        Selector.anchor.set(0.5);
        Selector.parentGroup = $displayGroup.DiffuseGroup;
        Selector.position3d.y = -65
        Selector.euler.x = -0.15
       // Selector.proj.euler.pitch = 0.2
        this.p.addChildAt(Selector,0);
        TweenLite.fromTo(Selector.scale3d, 0.2, {x:0,y:0},{x:1,y:1, ease:Back.easeOut.config(1.7)})
        TweenMax.to(Selector.proj.euler, 4, {z:Math.PI*2, ease:Linear.easeNone, repeat:-1});
        this.__Selector = Selector;
    };
    /** affiche un selector */
    hideSelector(){
        if(this.__Selector){
            this.__Selector.destroy({children:true}) //todo:
            TweenLite.killTweensOf(this.__Selector.proj.euler);
        }
        this.__Selector = null;
    };

    /** lorsque hover une cases, calcul un chemin du player vers la case selectionner */
    initializePathFinding(target){
        return _DataObj_Case.SpidersSucces = this.computePathTo(target); // si on un spider valide
    };

    /** calcule chemin cases */
    computePathTo(target){
        /**@class SPIDER */
        function SPIDER(id,currentID,parentSprite) {
            this._id = id;
            this._lastID = null;
            this._currentId = currentID;
            this.travel = parentSprite?[...parentSprite.travel]:[]; // indicateur parcouru
            this.parentSpiders = parentSprite || null;
            this._succeed = false;
            this._death = false;
        };
        const LOCAL = $objs.LOCAL; // getter
        const START = $players.p0.inCase._localId+'';
        const END = target.DataObj._localId+'';
        //# spider: pour chaque direction, le spider ce duplique.
        let Spiders = [new SPIDER(0,START)]; // les spiders vivant
        let SpidersSucces = null; // le premier spider arriver a destination
        let SpidersDeath = []; // DELETEmE DEBUG ONLY: normalment il ne sont pas stoquer!
        let Visited = [];

        while (!SpidersSucces && Spiders.length) {
            for (let i=0, l=Spiders.length; i<l; i++) {
                const spider = Spiders[i];
                spider.travel.push(spider._currentId);
                Visited.push(spider._currentId);
                const dataObj = LOCAL[spider._currentId];
                !dataObj && console.error('dataObj dans pathFinding est undefined') //TODO: REPENSER LE SYSTEM ID VIA EDITOR quand un delete une case, sa fuck
                const pathConnexion = dataObj && Object.keys(LOCAL[spider._currentId].pathConnexion).remove(...Visited) || [];
                //#STEP1 check succes 
                if(spider._currentId===END){
                    spider._succeed = true;
                    SpidersSucces = spider;
                    break;
                }else
                //!STEP2 check death 
                if(!pathConnexion.length){
                    spider._death = true;
                    SpidersDeath.push( Spiders.splice(i,1) );
                    l=Spiders.length;
                    i--;
                    continue;
                }else{
                    //#STEP3 update
                    const nextId = pathConnexion.pop(); //next step premier id
                    spider._lastID = spider._currentId;
                    spider._currentId = nextId;
                };
                //#STEP4 duplicate spider id remain connextion
                if(pathConnexion.length){
                    pathConnexion.forEach(id => {
                        Spiders.push(new SPIDER(Spiders.length, id, spider));
                        l=Spiders.length;
                   });
                };
            };
        }
        return SpidersSucces;
    };

    // creer un FX sur la case
    playFX_landing(){
        const textureName = "casesHitsG";
        const dataBase = $loader.DATA2.caseFXhit1;
        const fx = $objs.create(null,dataBase,'casesHitsG');
        fx.parentGroup = $displayGroup.group[0]
        fx.a.anchor.set(0.5);
        fx.n.anchor.set(0.5);
        fx.position3d.z = -25;
        this.p.addChildAt(fx,0);
    };

    // defenir couleur number ou 'string'
    setCaseColor(color){
        const clist = $systems.colorsSystem.keys;
        color = Number.isFinite(color) && clist[color] || color;
        if(clist.indexOf(color)<0){return console.error(`${color} n'existe pas dans $systems.colorsSystem`)}
        const c = this.attache;
        c.caseColor = color;
        // asign les couleur hex pour case seulement selon le color string
        let hexc;
        switch (color) {
            case 'white' : hexc=0xffffff; break;// #ffffff
            case 'red'   : hexc=0xff0000; break;// #ff0000
            case 'green' : hexc=0x00ff3c; break;// #00ff3c
            case 'blue'  : hexc=0x70a6ff; break;// #70a6ff
            case 'pink'  : hexc=0xf600ff; break;// #f600ff
            case 'purple': hexc=0x452d95; break;// #452d95
            case 'yellow': hexc=0xfcff00; break;// #fcff00
            case 'white' : hexc=0x000000; break;// #000000
            default:break;
        }
        hexc && (c.Sprites.cd.tint = hexc);
    };

    // defenir type number ou 'string'
    setCaseType(type){
        const tlist = $systems.caseTypes.list;
        type = Number.isFinite(type) && tlist[type] || type;
        if(tlist.indexOf(type)<0){return console.error(`${type} n'existe pas dans $systems.caseTypes`)}
        const c = this.attache;
        c.caseType = type;
        // swap textures TODO: player stats permetra de afficher les vrai icon ?
        c.Sprites.td._texture = $Loader.Data2.caseEvents.textures[type     ] ;
        c.Sprites.tn._texture = $Loader.Data2.caseEvents.textures_n[type+'_n'] ;
    };
    

    // TRY execute _actionType de la case, appelle normalement pas la $player
    executeCasesBounty(){
        return $stage.interactiveChildren = true; //TODO: SOIS FAIR UN CHECK PENDANT UN UPDATE et aussi comparer les couleurs des orbsSynegies pour activer event
        if(this._visited){
            // malus , retour sur case visited
        }else{
            const CaseColor  = this.p.child.CaseColor ;
            const CaseBounty = this.p.child.CaseBounty;
            $audio._sounds.TRA_A.play("TRA_A29");
            $players.p0.s.state.addAnimation(3, "visiteCase", false,0);
            CaseBounty.parentGroup = $displayGroup.group[2];
            TweenLite.to($camera.view.position3d, 1, {y:-150, ease:Power4.easeInOut } );
            const tl = new TimelineMax();
                tl.to(CaseBounty.position3d, 2, { z:'-=250', ease: Elastic.easeOut.config(0.6, 0.5) },0)
                tl.to(CaseBounty.scale3d, 0.3, { x:0.5, ease: Power4.easeOut },0)
                tl.to(CaseBounty.scale3d, 0.5, { x:2,y:2, ease:  Power4.easeOut },0.3)
                tl.call(() => {
                    //! resolve est retourner lorsque la fin de l'event bounty. inclu les combat et minigame.
                    switch (this._bounty) {
                        case "caseEvent_monsters":
                            this.execute__caseEvent_monsters();
                        break;
                        case "caseEvent_gold":
                            this.endEventBounty(); //this.execute__caseEvent_gold().then((e) => this.endEventBounty(e)); //TODO:
                        break;
                        default:this.endEventBounty();//DELETEME: FAIRE TOUS LES SCENARIO
                    };
                 });
        }
    };

    /** fin de l'event bounty lorsque promise resolve() */
    endEventBounty(e){
        $camera.interactiveChildren = true;
        $stage.scene.interactiveChildren = true;
        this._visited = true;
        $players.p0.s.state.addEmptyAnimation(3,0.4,0);
    };

    /** execute case bounty caseEvent_monsters*/
    execute__caseEvent_monsters(){
        const choice = new Promise((resolve, reject) => { // resolve()
            //const combatOptions = { monstersData:$data_monsters.getRanDataMonsterList() }; // TODO: PREPARER LES OPTIONS DU COMBAT
            $gui.CombatScreenChoice.show(resolve,this._bountyData);

        }).then((value) => {
            if(value==='xButton_A'){ // fight
                $combats.initialize(this);
            }
            this.endEventBounty();
        });
        

 /*        //DELETEME: TEST ZOOM
        $camera._planeUpdate = true;
        TweenLite.to($camera, 0.5, {_focus:500, ease:Power4.easeOut } );
        TweenLite.to($camera, 1, {_zoom:1.2, ease:Back.easeIn.config(2) } );
        const LOCAL = $objs.LOCAL;
        LOCAL.forEach((dataObj,i) => {
            if( !dataObj.isCases ){
                TweenLite.to(dataObj.child.euler, 2+(i/10), {x:-Math.PI/2, ease:Bounce.easeOut } );
                TweenLite.to(dataObj.child, 1, {alpha:0, ease:Bounce.easeOut, delay:2+(i/10) } );
            };
        });

        const tl2 = new TimelineMax();
            // hack filter
            const zoomFilter_d = $systems.PixiFilters.ZoomBlurFilter_d;
            const zoomFilter_n = $systems.PixiFilters.ZoomBlurFilter_n;
            //const KawaseBlurFilter_d = $systems.filtersList.KawaseBlurFilter_combatBG;
            zoomFilter_d.center = [1920/2,1080/2];
            zoomFilter_n.center = [1920/2,1080/2];
            $displayGroup._layer_diffuseGroup.filters = [zoomFilter_d];
            $displayGroup._layer_normalGroup .filters = [zoomFilter_n];
            //$stage.scene.background.c.filters = [KawaseBlurFilter_d];
            //$stage.scene.background.child.d.renderable = false;
            //$stage.scene.background.c.renderable = true;

            
            $audio.bgm && tl2.to($audio.bgm, 2, { speed:0, ease: Power2.easeInOut },0);
            tl2.call(() => { $audio._sounds.TRA_A.play("TRA_A26"); } ,null,null,0);
            tl2.fromTo(zoomFilter_n, 1.5, { strength:0,innerRadius:800 },{ strength:0.38,innerRadius:250, ease: Power4.easeOut },0);
            tl2.to(zoomFilter_n, 1.2, { strength:0.3,innerRadius:400, ease: Power4.easeIn },1.5);
            tl2.to($camera, 1.2, { _zoom:'-=0.2', ease: Power1.easeIn },1.5);
            
            tl2.call(() => {
                $audio._sounds.TRA_A.play("TRA_A5").speed = 0.8;
                $audio._sounds.TRA_A.play("TRA_A30");
            } ,null,null,1.5);
            tl2.fromTo(zoomFilter_d, 0.8, { strength:0,innerRadius:200 },{ strength:0.2,innerRadius:300, ease:  RoughEase.ease.config({ template:  Power4.easeIn, strength: 2.4, points: 30, taper: "in", randomize: false, clamp: true}) },1.5);
            tl2.to(zoomFilter_d, 3, { strength:0,innerRadius:400, ease: Power4.easeOut },2.3);
            tl2.to(zoomFilter_n, 5, { strength:0,innerRadius:0   , ease: Power4.easeOut },2.3);
            tl2.call(() => {
                $audio._sounds.battleA0.play({start:15.8}).Volume(0.5);
                $player1.s.state.addEmptyAnimation(3,0.4);
                $camera.moveToTarget($player1,3,Elastic.easeOut.config(0.6, 0.5),'combat1');
                TweenLite.to($camera, 3.5, {_focus:6000, ease:Power4.easeInOut });
            } ,null,null,2.5 ); // ,null,null,2.4
            tl2.call(() => { // end remove filter
              //  $displayGroup._layer_diffuseGroup.filters = null;
              //  $displayGroup._layer_normalGroup .filters = null;
            });
*/
    };

    /** Passe en mode combat, lorsque un combat est initialiser */
    setCombatMode(value){
        value = value?0:1;
        this.p.child.CaseColor.alpha = value;
        this.p.child.CaseBounty.alpha = value;
    };

    /** start event from type*/
    caseEvent_monsters(type){ // TODO: FAIR UN MANAGER
        const tl = new TimelineMax();
            // hack filter
            const zoomFilter_d = $systems.filtersList.ZoomBlurFilter_d;
            const zoomFilter_n = $systems.filtersList.ZoomBlurFilter_n;
           // const KawaseBlurFilter_d = $systems.filtersList.KawaseBlurFilter_combatBG;
            zoomFilter_d.center = [1920/2,1080/2];
            zoomFilter_n.center = [1920/2,1080/2];
            $displayGroup._layer_diffuseGroup.filters = [zoomFilter_d];
            $displayGroup._layer_normalGroup .filters = [zoomFilter_n];
            //$stage.scene.background.c.filters = [KawaseBlurFilter_d];
            $stage.scene.background.d.renderable = false;
            $stage.scene.background.c.renderable = true;

          
            tl.to($audio.bgm, 2, { speed:0, ease: Power2.easeInOut },0);
            tl.call(() => { $audio._sounds.TRA_A.play("TRA_A26"); } ,null,null,0);
            tl.fromTo(zoomFilter_n, 1.5, { strength:0,innerRadius:800 },{ strength:0.38,innerRadius:250, ease: Power4.easeOut },0);
            tl.to(zoomFilter_n, 1.2, { strength:1,innerRadius:400, ease: Power4.easeIn },1.5);
            tl.to($camera, 1.2, { _zoom:'-=0.2', ease: Power1.easeIn },1.5);
            tl.call(() => {
                $audio._sounds.TRA_A.play("TRA_A5").speed = 0.8;
                $audio._sounds.TRA_A.play("TRA_A30");
            } ,null,null,1.5);
            tl.fromTo(zoomFilter_d, 0.8, { strength:0,innerRadius:200 },{ strength:0.2,innerRadius:300, ease:  RoughEase.ease.config({ template:  Power4.easeIn, strength: 2.4, points: 30, taper: "in", randomize: false, clamp: true}) },1.5);
            tl.to(zoomFilter_d, 3, { strength:0,innerRadius:400, ease: Power4.easeOut },2.3);
            tl.to(zoomFilter_n, 5, { strength:0,innerRadius:0   , ease: Power4.easeOut },2.3);
            tl.call(() => {
                $audio._sounds.battleA0.play({start:15.8}).Volume(0.5);
                $player.child.s.state.addEmptyAnimation(3,0.4);
                $camera.moveToTarget($player,7,5,Elastic.easeOut.config(0.6, 0.5));
            } ,null,null,2.5 ); // ,null,null,2.4
            tl.call(() => { // end remove filter
                $displayGroup._layer_diffuseGroup.filters = null;
                $displayGroup._layer_normalGroup .filters = null;
            });
        return tl;
        $systems
        /*if(inCase.caseEventType === "caseEvent_gold"){ //TODO:
            console.log('recive gold:', ~~(Math.random(100)*100));
        }
        if(inCase.caseEventType === "caseEvent_monsters"){
            console.log('start Combats', 'monster ???');
        }*/
    };

};//END CLASS

