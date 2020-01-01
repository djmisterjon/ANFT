/*:
// PLUGIN □────────────────────────────────□PIXI MAP EDITOR□─────────────────────────────────────────┐
* @author □ Jonathan Lepage (dimisterjon),(jonforum) 
* @plugindesc EDITOR GUI for create map with object sprine JSON (texture packer, spine)
* V.2.0
* License:© M.I.T
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
*/
document.addEventListener('keydown', (e)=>{
    if(!window.$PME && e.key=== "F1"){
        console.log0('__________________initializeEditor:__________________ ');
        $PME = new _PME();
        $stage.addChild($PME);
        console.log1('$PME: ', $PME);
    };
});
// ┌-----------------------------------------------------------------------------┐
// GLOBAL $PME CLASS: _PME for SPRITE LIBRARY LOADER
//└------------------------------------------------------------------------------┘
class _PME extends _PME_TOAST {
    constructor(stageOldValue) {
        super();
        this.parentGroup = $displayGroup.group[5];
        /** editor child gui*/
        this.child = {buttons:[],gui:{},txt:{}};
        this.initialize()
    };

    get DATA2(){return $loader.DATA2};

    /** initialise l'editeur */
    initialize(){
        $stage.scene.interactiveChildren = true;
        $gui.hideAll();
        (async () => {
            await this.load_Editor();
            await this.load_libs  ();
            await this.showGuiEditor ();
            this.initialize_interaction();
            this.initialize_editor();
        })();
    };

    /** Convertie la scene et l'affichage */
    setupScene(){
        $camera._culling = false;
        $objs.LOCAL.forEach(dataObj=>{
            dataObj.remove_interaction && dataObj.remove_interaction(); // remove les interaction du jeux
            dataObj.asignFactory(); // reasign le factory par default;
            dataObj.child.renderable = true; // car culling peut les avoir disable
            dataObj.child.visible = true;// car culling peut les avoir disable
            this.create_debug(dataObj);
            dataObj.child.interactive = true;
            dataObj.child.on('pointermove'      , this.pointermove_sprite      , this);
            dataObj.child.on('pointerover'      , this.pointerover_sprite      , this);
            dataObj.child.on('pointerout'       , this.pointerout_sprite       , this);
            dataObj.child.on('pointerdown'      , this.pointerdown_sprite      , this);
            dataObj.child.on('pointerup'        , this.pointerup_sprite        , this);
            dataObj.child.on('pointerupoutside' , this.pointerupoutside_sprite , this);
            this.update_debug(dataObj)
        })
    };

    load_Editor(){
        return new Promise((resolve, rej) => {
            iziToast.warning( this.izit_loading1($stage) );
            const loader = new PIXI.loaders.Loader();
            loader.add("gui", "_EDITOR/pixiMapEditor1.json").load().onComplete.add((l,res) => {
                this.child.gui = new PIXI.spine.Spine(res.gui.spineData);
                resolve();
            });
        })
    };

    load_libs () {
        return new Promise((resolve, rej) => {
            PIXI.utils.clearTextureCache();
            $loader.loadScene('Scene_Boot'); // load tous le jeux via editor
            const check = setInterval(() => {
                if(!$loader._isLoading){
                    clearInterval(check);
                    resolve();
                };
            }, 80);
        })
     };

     //start From $Loader
     showGuiEditor () {
        return new Promise((resolve, rej) => {
            const GUI = this.child.gui;
            this.addChild(GUI);
            GUI.stateData.defaultMix = 0.1;
            GUI.state.setAnimation(0, 'idle', true);
            GUI.state.setAnimation(1, 'start0', false);
            //GUI.state.setAnimation(2, 'hideTileSheets', false);
            GUI.state.tracks[1].listener = {
                complete: (trackEntry, count) => { resolve() }
            };
        })
    };

//#region [rgba(250, 0, 0,0.03)]
// ┌------------------------------------------------------------------------------┐
// START INITIALISE
// └------------------------------------------------------------------------------┘
    /** Initialise les variable de lediteur*/
    initialize_editor(){
        /** Si click sur un spriteMap, inMouse et procteger du delete click droite */
        this.protectRigtClickhDelete = null;
        /** affcihe les element debug des object */
        this._debugMode = true;
        /** indic une key clavier holding */
        this._keycode = null;
        /** Allow scroll map */
        this._scrollable = true;
        /** interaction referece $app.renderer.plugins.interaction*/
        this.interaction = $app.renderer.plugins.interaction;
        /** dataObj link to mouse? */
        this.inMouse = null;
        /** flag si list des thumbs est affichers ou cacher */
        this._showList = false;
        /** thumbs filters list show libs */
        this.thumbsfilters = {
            spriteSheets   :true,
            spineSheets    :true,
            animationSheets:true,
            multiPacks     :true,
            video          :true,
            Background     :true,
            Light          :true,
        };
        /** fastMode utility data */
        /*this.FASTMODES = {//TODO:  si utiles
            _keyGroupId:0, // lorsque key plusieur fois, increment position3d=>pivot3d=>euler..
            groupkey:['position3d','pivot3d','euler'],
            keys:{
                x:'position3d',
                y:'pivot3d',
                z:'pivot3d',
            },
            target:null,
        };*/
        /** category filters list show libs */
        this.categoryFilters = {};
        const totalCatLibs = {};
        Object.values(this.DATA2).map(d=>d._category).filter((v, i, s) => {
            totalCatLibs[v]? totalCatLibs[v]++ : totalCatLibs[v] = 1 ;
            return s.indexOf(v) === i;
        }).forEach(cat => {
            this.categoryFilters[cat] = true;
        });
        this.categoryFilters_total = totalCatLibs;
        /** filters list */
        this.FILTERS = {
            OutlineFilterx10       : new PIXI.filters.OutlineFilter     (10, 0x000000, 1 ),
            OutlineFilterx16      : new PIXI.filters.OutlineFilter     (16, 0x000000, 1),
            OutlineFilterx6White  : new PIXI.filters.OutlineFilter     (4, 0xffffff, 1 ),
            OutlineFilterx8Green  : new PIXI.filters.OutlineFilter     (4, 0x16b50e, 1 ),
            OutlineFilterx8Green_n: new PIXI.filters.OutlineFilter     (8, 0x16b50e, 1 ), // need x2 because use x2 blendMode for diffuse,normal
            OutlineFilterx8Red    : new PIXI.filters.OutlineFilter     (8, 0xdb120f, 1 ),
            ColorMatrixFilter     : new PIXI.filters.ColorMatrixFilter (               ),
            PixelateFilter12      : new PIXI.filters.PixelateFilter    (12             ),
            BlurFilter            : new PIXI.filters.BlurFilter        (10, 3          ),
        };
             
        this.LIBRARY_BASE = this.create_LIBRARY_BASE();
        this.LIBRARY_TILE = this.create_LIBRARY_TILE();
        this.sort_LIBRARY_BASE();
        this.setupScene();  
        //this.create_datGui();
        //this.LIBRARY_TILE = this.createLibrary_tile();
        //this.FASTMODES = this.createFastModes();
        //this.refresh_LIBRARY_BASE();
        //this.setupScroll();
        //this.setupListener();
        //$stage.interactiveChildren = true;
        //this.changeDisplayGroup(1);
        

    };
//#endregion

    initialize_interaction(){
        const GUI = this.child.gui;
        // asign buttons interactive
        GUI.skeleton.slots.filter(slot => {
            return slot.data.name.contains("icon_") || slot.data.name.contains("gb");
        }).forEach(slot => {
            slot.currentSprite.interactive = true;
            slot.currentSprite.on('pointerover'      , this.pointerover_button      , this);
            slot.currentSprite.on('pointerout'       , this.pointerout_button       , this);
            slot.currentSprite.on('pointerdown'      , this.pointerdown_button      , this);
            slot.currentSprite.on('pointerup'        , this.pointerup_button        , this);
            slot.currentSprite.on('pointerupoutside' , this.pointerupoutside_button , this);
            slot.currentSprite.slot = slot; // ref the slot in sprite for events
            this.child.buttons.push( slot );
        });
        const titleSheets = new PIXI.Text('Hello World', {fill: "white"});
        GUI.skeleton.findSlot("TileBarLeft").currentSprite.addChild(titleSheets);
        titleSheets.position.set(-290,-15);
        this.child.txt.titleSheets = titleSheets;
        // listener
        const canvas = $app.view;
        canvas.addEventListener("mousemove", (e)=>{ this.pointermove_editor(e) });
        canvas.addEventListener("mouseover", ()=>{ });
        canvas.addEventListener("mouseout" , (e)=>{ this.mouseout_editor(e) });
        canvas.addEventListener("mousedown", ()=>{ });
        canvas.addEventListener("mouseup"  , (e)=>{ this.mouseup_canvas(e) });
        //# scroller map
        let force = 1; // _displayXY power for scroll map
        let speed = 10;
        let [ScrollX,ScrollY] = [$camera.view.position3d.x, $camera.view.position3d.z];
        PIXI.ticker.shared.add(() => {
            let [mX,mY] = [$mouse.p.x,$mouse.p.y];
            if(this._scrollable){
                let scrolled = false;
                (mX<8 && (ScrollX-=force) || mX>1920-8 && (ScrollX+=force)) && (scrolled=true);
                (mY<8 && (ScrollY+=force) || mY>1080-8 && (ScrollY-=force)) && (scrolled=true);
                scrolled && (force+=0.5) || (force=1);
            };
            if(this._keycode === 'ControlLeft'){ // scale Y
                $camera.view.position3d.y+=(ScrollY- $camera.view.position3d.y);
                const next = $camera._ang+(ScrollX- $camera._ang)/2000;
                $camera._ang = Math.max(-Math.PI/2,Math.min(next,Math.PI/2))
                
            }else{
                $camera.view.position3d.z+=(ScrollY- $camera.view.position3d.z)/(speed);
                $camera.view.position3d.x+=(ScrollX- $camera.view.position3d.x)/(speed);
            }
        });
        //#keyInput
        document.addEventListener('keydown', (e) => {
            this._keycode = e.code;
            ScrollY = $camera.view.position3d.y
            ScrollX = $camera._ang
        });
        document.addEventListener('keyup', (e) => {
            this._keycode = null;
            ScrollY = $camera.view.position3d.z
            ScrollX = $camera.view.position3d.x
        });
        document.addEventListener('wheel', (e) => { // zoom
            // autorize zoom just quand sourit dans canvas
            if (e.path.contains($app.renderer.view)) {
                const hitTest = $mouse.interaction.hitTest($mouse.p.position);
                // Dispatch scroll event
                (hitTest && hitTest._events.mousewheel)?hitTest.emit('mousewheel',e,hitTest) : $camera.onMouseWheel.call($camera,e)
            };
        });
        document.addEventListener('keydown', (e) => {
            // key for FASTMODES
            if(this.FASTMODES){
                if(e.key === e.key.toUpperCase()){ throw console.error('ERREUR LES CAPITAL SON ACTIVER!')}
                if(["p","y","w","s","r","u"].contains(e.key)){
                    this.FASTMODES._mode = e.key;
                    this.activeFastModes(this.FASTMODES.target);
                }
            }else if(isFinite(e.key) && !e.code.contains('Numpad')){ // si pas focus dans un input, autoriser number
                this.changeDisplayGroup(+e.key)
            }
            if(e.keyCode === 116){ 

            };
        });
    };
    create_LIBRARY_BASE(){
        const C = new PIXI.Container();
        const THUMBS = new PIXI.Container();
        C.THUMBS = C.addChild(THUMBS);
        C.position.set(80,950);
        const mask = new PIXI.Sprite(PIXI.Texture.WHITE);
            mask.anchor.y = 1;
            C.mask = mask;
            mask.width = 1800;
            mask.height = 110;
            mask.position.set(C.x,C.y+mask.height);
            mask.interactive = true;
            mask.on('pointermove', this.pointermove_maskLIBRARY_BASE, this);
            mask.on('pointerup', this.pointerup_maskLIBRARY_BASE, this);
            this.addChild(mask);
        Object.values(this.DATA2).forEach(data => {
            const c = new PIXI.Container();
            //basetextures
            const bt_d = data.BaseTextures.d;
            const bt_n = data.BaseTextures.n || data.BaseTextures.d;
            const base_d = new PIXI.Sprite(bt_d);
            const base_n = new PIXI.Sprite(bt_n);
            base_d.scale.set( $app.getRatio(base_d, 134, 96));
            // bg
            const bg = new PIXI.Sprite(PIXI.Texture.WHITE);
            bg.name = 'bg'
            bg.alpha = 0.2;
            [bg.width,bg.height] = [base_d.width+30,96]; // 30 pour place au icons type
            // test icons type
            c.icons = [];
            ['isSpriteSheets','isSpineSheets','_normal','isAnimationSheets','isMultiPacks'].forEach(test => {
                if(data[test]){
                    const ico = new PIXI.Sprite.from(`_EDITOR/images/${test}.png`);
                    ico.position.set(bg.width-30,30*c.icons.length);
                    c.icons.push(ico);
                };
            });
            // txt info
            const txt = new PIXI.Text(data._dataBaseName,{fontSize: 16})
            txt.scale.set(Math.min($app.getRatio(txt, 134, 96),1) );
            const bgTxt = new PIXI.Sprite(PIXI.Texture.WHITE);
            [bgTxt.width,bgTxt.height] = [txt.width,txt.height];
            [txt.y,bgTxt.y] = [96-10,96-10];
            // events
            c.interactive = true;
            c.on('pointerover'    , this.pointerover_thumbs    , this);
            c.on('pointerout'     , this.pointerout_thumbs     , this);
            c.on('pointerdown'    , this.pointerdown_thumbs    , this);
            c.on('pointerup'      , this.pointerup_thumbs      , this);
            c.on('mouseupoutside' , this.pointerupoutside_thumbs , this);
        // ref
            c.data = data;
            c.addChild(bg,base_d,bgTxt,...c.icons,txt);
            c.child = c.childrenToName();
            THUMBS.addChild(c);
        });
        return this.addChild(C);
    };

    create_LIBRARY_TILE(){
        const C = new PIXI.Container();
        const TILES = new PIXI.Container();
        const mask = new PIXI.Sprite(PIXI.Texture.WHITE);
        C.TILES = TILES;
        mask.anchor.set(1,0);
        mask.x = 640;
        C.position.set(1270,52);
        [mask.width, mask.height] = [640, 850];
        C.addChild(mask,TILES);
        C.mask = mask;
        // events
        mask.interactive = true;
        mask.on('pointermove'    , this.pointermove_maskLIBRARY_TILE , this);
        mask.on('pointerover'    , this.pointerover_maskLIBRARY_TILE   , this);
        mask.on('pointerout'     , this.pointerout_maskLIBRARY_TILE    , this);
        mask.on('pointerdown'    , this.pointerdown_maskLIBRARY_TILE    , this);
        mask.on('pointerup'      , this.pointerup_maskLIBRARY_TILE     , this);
        mask.on('mouseupoutside' , this.pointerupoutside_maskLIBRARY_TILE , this);
        C.renderable = false;
       return this.addChild(C);
    };

    /** filter from datgui case */
    filtering_LIBRARY_BASE(){
        const list = this.LIBRARY_BASE.THUMBS.children;
        list.forEach(thumb => {
            const cat = thumb.data._category;
            const type = thumb.data._type;
            const disable = !this.categoryFilters[cat] || !this.thumbsfilters[type];
            thumb.renderable = !disable;
        });
        this.sort_LIBRARY_BASE();
    };

    /** trie, filtre sort la library */
    sort_LIBRARY_BASE(sortOption){
        const list = this.LIBRARY_BASE.THUMBS.children; // TODO: FILTERS AND SORT
        for (let i=0,x=0,y=0,maxX=1700, l=list.length; i<l; i++) {
            const e = list[i];
            if(!e.renderable){continue};
            TweenLite.to(e.position, 1, {x:x,y:y,ease:Power4.easeOut});
            if((x+=e.width+12)+e.width>maxX){
                x = 0;
                y-=e.height+10;
            };
        };
    };


//#region [rgba(40, 0, 0, 0.2)]
// ┌------------------------------------------------------------------------------┐
// EVENTS INTERACTION LISTENERS
// └------------------------------------------------------------------------------┘

/** disable enable objet map interactiove */
    setObjsInteractive(value,protect){
        $stage.scene.children.forEach(e => {
            e.interactive = value;
        });
        protect && (protect.interactive = !value); // protect obj
    };

    start_mouseHold(dataObj,callBack){
        clearTimeout(this._holdTimeOut);
        if(dataObj){ // active mouse MouseHold after 160 ms
            this._holdTimeOut = setTimeout(() => {
                callBack && callBack.call(this,dataObj);
            }, 190);
        };
    };

    //#tileLibs mask
    pointermove_maskLIBRARY_TILE(e){
        const ee = e.currentTarget;
        if($mouse._hold){
            this.LIBRARY_TILE.TILES.interactiveChildren = false;
            const x = e.data.originalEvent.movementX;
            const y = e.data.originalEvent.movementY;
            this.LIBRARY_TILE.TILES.x+=x*2;
            this.LIBRARY_TILE.TILES.y+=y*2;
        };
    };

    pointerover_maskLIBRARY_TILE(e){
        const ee = e.currentTarget;
        this.LIBRARY_TILE.TILES.children.forEach(TILES => {
            TILES.Debug.bg.renderable = true;
        });
    };
    pointerout_maskLIBRARY_TILE(e){
        const ee = e.currentTarget;
        this.LIBRARY_TILE.TILES.children.forEach(TILES => {
            TILES.Debug.bg.renderable = false;
        });
    };
    pointerdown_maskLIBRARY_TILE(e){
        const ee = e.currentTarget;
    };
    pointerup_maskLIBRARY_TILE(e){
        const ee = e.currentTarget;
        this.LIBRARY_TILE.TILES.interactiveChildren = true;
    };
    pointerupoutside_maskLIBRARY_TILE(e){
        const ee = e.currentTarget;
    };
    //#thumbsLibs mask
    pointermove_maskLIBRARY_BASE(e){
        if($mouse._hold){
            this.LIBRARY_BASE.THUMBS.interactiveChildren = false;
            const y = e.data.originalEvent.movementX;
            this.LIBRARY_BASE.THUMBS.children.forEach(ee => {
               ee.y-=y*2;
            });
        };
    };
    pointerup_maskLIBRARY_BASE(e){
        const ee = e.currentTarget;
        this.LIBRARY_BASE.THUMBS.interactiveChildren = true;
        if(e.isRight){
            this.toggle_thumbsLibs();
        };
    };

    //#thumbs
    pointerover_thumbs(e){
        const ee = e.currentTarget;
        ee.child.bg.alpha = 0.8;
        ee.filters = [ new PIXI.filters.OutlineFilter(4, 0xa0c1ff, 1 )];
        $mouse.p.alpha = 0.2;
        $mouse.p.state.setAnimation(0, 'point_up', true);
        this.showPreviewThumbs(ee);
    };

    pointerout_thumbs(e){
        const ee = e.currentTarget;
        ee.child.bg.alpha = 0.2;
        ee.filters = null;
        $mouse.p.alpha = 1;
        $mouse.p.state.setAnimation(0, 'idle', true);
        this.hidePreviewThumbs(ee);
    };

    pointerdown_thumbs(e){
        const ee = e.currentTarget;
        // replace la libs sur la selections y:0
        if(ee.y!==0){
            const move = ee.y;
            this.LIBRARY_BASE.THUMBS.children.forEach(b => {
                TweenLite.to(b.position, 1, {y:`-=${move}`,ease:Power4.easeOut});
                ee === b && TweenLite.from(b, 2, {alpha:0,ease:Power4.easeOut});
             });
        };
        if(this._showList){ // si la list thumbs etais afficher, fermer
            this.toggle_thumbsLibs();
        };
    };

    pointerup_thumbs(e){
        const ee = e.currentTarget;
        this.showTilesLibs(ee);
        
    };

    pointerupoutside_thumbs(e){
        this.pointerup_thumbs(e)
    };
    
    //#button slots
    pointerover_button(e){
        const ee = e.currentTarget;
        ee.slot.color.a = 1;
        ee.filters = [ new PIXI.filters.OutlineFilter(2, 0xffffff, 1 )];
        TweenMax.to(ee.scale, 0.2, {x:1.25,y:-1.25, ease: Back.easeOut.config(2.5) });
    };

    pointerout_button(e){
        const ee = e.currentTarget;
        ee.slot.color.a = 0.4;
        ee.filters = null;
        TweenMax.to(ee.scale, 0.2, {x:1,y:-1, ease: Back.easeOut.config(1.4) });
    };

    pointerdown_button(e){
    };

    pointerup_button(e){
        const ee = e.currentTarget;
        this.execute_buttons(e,ee);
    };

    pointerupoutside_button(e){

    };

    //#Tile dans libs
    pointerover_tile(e){
        const ee = e.currentTarget;
        ee.filters = [this.FILTERS.OutlineFilterx10]
        
    };

    pointerout_tile(e){
        const ee = e.currentTarget;
        ee.filters = null;
 
    };

    pointerdown_tile(e){

    };

    pointerup_tile(e){
        $stage.scene.interactiveChildren = true; //permet de reprendre les click dans editeur si change de scene
        const ee = e.currentTarget;
        const ctrlKey = e.data.originalEvent.ctrlKey;
        const cLeft   = e.data.button===0; // <== 
        const cRight  = e.data.button===2; // ==>
        const cCenter = e.data.button===1; // >|<
        if(cRight){
            return this.showTilesLibs(ee); // will close tiles
        }
        const dataObj = $objs.createFrom(ee.dataObj.clone(true));
        dataObj.asignFactory(ee.dataObj.factory);
        $objs.addToGlobalRegister(dataObj,$objs.GLOBAL.findEmptyIndex());
        $objs.addtoLocalRegister (dataObj,$objs.LOCAL .findEmptyIndex());
        //dataObj.initializeFactory();
        this.add_toMap(dataObj);
        this.add_toMouse(dataObj);
        console.log1('dataObj: ', dataObj);
    };

    pointerupoutside_tile(e){
        
    };

    //#Sprite on map
    pointermove_sprite(e){
        const ee = e.currentTarget;
    };
    pointerover_sprite(e){
        const ee = e.currentTarget;
        ee.Debug.bg.filters = [this.FILTERS.OutlineFilterx10];
        if(this._pathMode && e.data.buttons === 1){this.checkPathMode(ee.dataObj)};
    };
    pointerout_sprite(e){
        const ee = e.currentTarget;
        ee.Debug.bg.filters = null;
    };
    pointerdown_sprite(e){
        const ee = e.currentTarget;
        this.start_mouseHold(ee.dataObj,this.initialize_fastMode);
    };
    pointerup_sprite(e){
        const ee = e.currentTarget;
        // si click sur sprite en mode path cases
        if(this._pathMode){ return this.computeDrawPathBuffers(ee.dataObj) };

        const ctrlKey = e.data.originalEvent.ctrlKey;
        const cLeft   = e.data.button===0; // <== 
        const cRight  = e.data.button===2; // ==>
        const cCenter = e.data.button===1; // >|<
        const isInMouse = (this.inMouse === ee.dataObj);
        this.start_mouseHold(false);
        if(isInMouse){
            if(cLeft){ // <== 
                this.remove_toMouse(ee.dataObj);
                const dataObj = $objs.createFrom(ee.dataObj.clone(true));
                dataObj.asignFactory(ee.dataObj.factory);
                $objs.addToGlobalRegister(dataObj,$objs.GLOBAL.findEmptyIndex());
                $objs.addtoLocalRegister (dataObj,$objs.LOCAL .findEmptyIndex());
                this.add_toMap(dataObj);
                return this.add_toMouse(dataObj);
            };
            if(cRight && this.protectRigtClickhDelete){// ==>
                //TODO: BACK TO FACTORY
                ee.asignFactory();
                this.protectRigtClickhDelete = false;
                this.remove_toMouse(ee.dataObj);
                this.setObjsInteractive(true);
                return this.showEditor();
           }
            if(cRight){// ==>
                this.remove_toMouse(ee.dataObj);
                this.setObjsInteractive(true);
                ee.dataObj.removeFromRegister();
                return this.showEditor();
           }
        }else{ // inmap click
            if(cLeft){// <== 
                this.add_toMouse(ee.dataObj,true);
            }
            if(cRight && ctrlKey){// ==> +ctrl (delete obj de la scene)
                ee.dataObj.removeFromRegister();
                return;
            }
            if(cRight){// ==>
                // si etait deja dans ce mode?
                if(!this.remove_Inspector(ee.dataObj)){
                    Inspectors.DataObj(ee.dataObj)
                    this.hideEditor();
                }else{
                    this.showEditor();
                }
            }
        };
    };
    pointerupoutside_sprite(e){
        const ee = e.currentTarget;
    };
    //#Canvas editor
    pointermove_editor(){
        this.update();
    };
    mouseout_editor(){
    };
    
    mouseup_canvas(e){
        if(Inspectors.__busySlider){
            $stage.interactiveChildren = true;
        }
    };
    //endregion

    //#region [rgba(40, 110, 0, 0.1)]
    create_grids(){
        if(this.__grid){
            $stage.scene.Background.removeChild(this.__grid);
            return delete this.__grid;
        };
        const color = [0xffffff,0x000000,0xff0000,0x0000ff,0xffd800,0xcb42f4][~~(Math.random()*6)];
        const gridSize = 48;
        const [w,h] = [$camera._sceneW,$camera._sceneH];
        const grids = new PIXI.Graphics();
        grids.lineStyle(1, color, 1);
        // Vertical line
        for (let i=0, l=w/48; i<l; i++) {
            grids.lineStyle(1, 0xFFFFFF, 1).moveTo(i*48,0).lineTo(i*48, h)
        };
        for (let i=0, l=h/48; i<l; i++) {
            grids.moveTo(0,i*48).lineTo(w, i*48)
        };
        // draw center
        grids.lineStyle(3, 0xee82ff, 1).moveTo(w/2,0).lineTo(w/2, h).moveTo(0,h/2).lineTo(w, h/2);
        grids.endFill();
        

        const sprite = new PIXI.projection.Sprite3d( $app.renderer.generateTexture(grids) );
        sprite.alpha = 0.4;
        sprite.anchor.set(0.5);
        //sprite.euler.x = Math.PI/2;
        sprite.parentGroup = PIXI.lights.diffuseGroup;
        //sprite.zIndex = 0;
        this.__grid = $stage.scene.Background.addChild(sprite);


    };

    create_debug(dataObj){
        const C = dataObj.child;
        const [W,H] = [C.width,C.height];
        function drawRec(x, y, w, h, c, a, r, l_c_a) {
            const rec = new PIXI.Graphics();
                rec.beginFill(c||0xffffff, a||1);
                l_c_a && rec.lineStyle((l_c_a[0]||0), (l_c_a[1]||c||0x000000), l_c_a[2]||1);
                r && rec.drawRoundedRect(x, y, w, h, r) || rec.drawRect(x, y, w, h);
                rec.endFill();
            return rec;
        };

        function createBackground(w,h,a=1,color=0xffffff){
            //const texture = dataObj.dataBase.textures[dataObj._textureName];
            //const extrudeSprite = new PIXI.projection.Sprite3d(texture);
            const extrudeBg = drawRec( 0,0,w,h,color,a );
            //extrudeSprite.tint = 0x000000;
            //extrudeSprite.alpha = 0.5;
            //extrudeSprite.addChild(extrudeBg);
            const bg = new PIXI.projection.Sprite3d ( $app.renderer.generateTexture( extrudeBg ) );
            bg.anchor.set(0.5,1);
            bg.name = "debug-bg";
            //bg.alpha = a;
            bg.tint = color;
            bg.parentGroup = PIXI.lights.diffuseGroup;
            return bg;
        };
        function createPivot (w,h) {
            function drawLine(from,to) { 
                const line = new PIXI.Graphics();
                // set a fill and line style
                line.beginFill(0xffffff).lineStyle(10, 0xffd900, 1)
                line.moveTo(from[0], from[1]).lineTo(to[0],to[1]).endFill();
                return line;
            }
            const PIV = new PIXI.Container();
            const pivX = new PIXI.Sprite( $app.renderer.generateTexture( drawLine( [0,0],[w,0] ) ) ); // x, y, w, h, c, a, r, l_c_a
            const pivY = new PIXI.projection.Sprite3d ( $app.renderer.generateTexture( drawLine( [0,0],[0,h] ) ) ); // x, y, w, h, c, a, r, l_c_a
            console.log('pivY: ', pivY);
           //const txt = new PIXI.Text("(P)",{fontSize:26,fill:0x000000,strokeThickness:6,stroke:0xffffff,fontWeight: "bold"});
           //piv.name = "debug-piv";
           //piv.anchor.set(0.5,1);
           //txt.scale.set(0.5), txt.anchor.set(0.5);
           //piv.position.copy(c.pivot);
           //piv.line = line;
           //piv.txt = txt;
           //line.anchor.set(0.5,0.5);
           //line.addChild(txt);
            PIV.addChild(pivX,pivY);
            return PIV;
        };
        /** create a debug Axis for a target elements */
        function createDebugAxis(w,h){
            function drawLine(from,to,color,txt){
                const line = new PIXI.Graphics();
                line.beginFill().lineStyle(4, color, 0.5);
                line.moveTo(from[0], from[1]).lineTo(to[0],to[1]).endFill();
                line.endFill();
                const t = new PIXI.Text(txt,{fill:0xffffff});
                line.addChild(t)
                return line;
            };
            const PIV = new PIXI.projection.Container3d();
            const lineZ = new PIXI.projection.Sprite3d ( $app.renderer.generateTexture( drawLine( [0,0],[0,-h/2],0xf44242,'z' ) ) );
            const lineX = new PIXI.projection.Sprite3d ( $app.renderer.generateTexture( drawLine( [0,0],[-w/2,0],0x06d328,'x' ) ) );
            const lineY = new PIXI.projection.Sprite3d ( $app.renderer.generateTexture( drawLine( [0,0],[0,h/2],0x0540d2,'y' ) ) );
            lineZ.euler.x = Math.PI/2;
            lineY.pivot.y = lineY.height;
            PIV.addChild(lineX,lineY,lineZ);
            return PIV;
            //target.addChild(lineZ,lineX,lineY);
        };
        /** storage des path grafique pour les cases */
        const createPath = () => {
            const path = new PIXI.projection.Container3d();
            path.graficConection = []; // store grafic conection line
            path.texts = []; // store text id
            return path;
        };
        const bg = createBackground(W,H,0.5);
        //const piv = createPivot(W,H);
        const piv = createDebugAxis(W,H);
        const path = createPath(); // for debug pathMode for cases only
        C.Debug = {bg,piv,path};
        C.addChild(...Object.values(C.Debug));
        C.addChildAt(bg,0);
    };

    // toggle , hide show debug mode
    toggle_debugMode(forceValue){
        if(forceValue !== void 0){
            this._debugMode = forceValue
        }else{
            this._debugMode = !this._debugMode
        }
        $objs.LOCAL.forEach(c => {
            if(c && c.child.Debug){
                c.child.Debug.bg && (c.child.Debug.bg.renderable = this._debugMode)
                c.child.Debug.piv && (c.child.Debug.piv.renderable = this._debugMode)
            }
        });
    };

    initialize_fastMode(dataObj){
        this.FASTMODE = dataObj;
        const c = new PIXI.Container();
        const style = {fontSize:16,fill:0x000000,strokeThickness:10,stroke:0xffffff,lineJoin: "round",fontWeight: "bold",};
        const txt0 = new PIXI.Text("P: pivot from position"   ,style);
        const txt1 = new PIXI.Text("Y: position from pivot"   ,style);
        const txt2 = new PIXI.Text("W: skew mode"             ,style);
        const txt3 = new PIXI.Text("S: Scale mode"            ,style);
        const txt4 = new PIXI.Text("R: Rotation mode"         ,style);
        const txt5 = new PIXI.Text("U: Rotate Textures Anchor",style);
        c.addChild(txt0,txt1,txt2,txt3,txt4,txt5);
        c.children.forEach((txt,i)=>txt.position.set(120,30*i));
        $mouse.p.addChild(c);
    };
    
    update_fastMode(dataObj) {
        return console.log('update_fastMode: ', 'TODO:');
        // compute diff
        //const diff = new PIXI.Point(($mouse.x-this.FASTMODES.freeze.x), ($mouse.y-this.FASTMODES.freeze.y));
        const C = dataObj.child;
        switch (this.FASTMODES._mode) { // ["p","y","w","s","r","u"]
            case "p": // pivot from position"
                cage.pivot.set(this.FASTMODES.zero.pivot.x-diff.x, this.FASTMODES.zero.pivot.y-diff.y);
                cage.Debug.piv.position.copy(cage.pivot);
                this.FASTMODES.infoTarget.text = `x:${cage.pivot._x.toFixed(2)} \ny:${cage.pivot._y.toFixed(2)}`;
            break;
            case "y": // position from pivot
                cage.position.set(this.FASTMODES.zero.position.x-diff.x, this.FASTMODES.zero.position.y-diff.y);
                cage.pivot.set((this.FASTMODES.zero.pivot.x-diff.x)/cage.scale._x, (this.FASTMODES.zero.pivot.y-diff.y)/cage.scale._y);
                cage.Debug.piv.position.copy(cage.pivot);
                this.FASTMODES.infoTarget.text = `x:${cage.pivot._x.toFixed(2)} \ny:${cage.pivot._y.toFixed(2)}`;
            break;
            case "w": // skew mode
                cage.skew.set(this.FASTMODES.zero.skew.x-(diff.x/400), this.FASTMODES.zero.skew.y-(diff.y/400));
                this.FASTMODES.infoTarget.text = `x:${cage.skew._x.toFixed(2)} \ny:${cage.skew._y.toFixed(2)}`;
            break;
            case "s": // Scale mode
                cage.scale.set(this.FASTMODES.zero.scale.x-(diff.x/200), this.FASTMODES.zero.scale.y-(diff.y/200));
                this.FASTMODES.infoTarget.text = `x:${cage.scale._x.toFixed(2)} \ny:${cage.scale._y.toFixed(2)}`;
            break;
            case "r": // Rotation mode
                cage.rotation = this.FASTMODES.zero.rotation-(diff.x/100);
                this.FASTMODES.infoTarget.text = `r:${cage.rotation.toFixed(3)} \ndeg°:${(cage.rotation*180/Math.PI).toFixed(2)}`;
            break;
            case "u": // Rotation textures
                cage.d.rotation = this.FASTMODES.zero.rotation-(diff.x/100);
                cage.n.rotation = this.FASTMODES.zero.rotation-(diff.x/100);
                this.FASTMODES.infoTarget.text = `r:${cage.d.rotation.toFixed(3)} \ndeg°:${(cage.d.rotation*180/Math.PI).toFixed(2)}`;
            break;
        }
    };


    //endregion
    
    //#region [rgba(244, 125, 66, 0.1)]
    /** show editor *///#
    showEditor(){
        this.showEditor_thumbs();
        this.showEditor_tiles();
    };
    showEditor_thumbs(){
        if(!this.LIBRARY_BASE.renderable){
            this.LIBRARY_BASE.renderable = true;
            this.LIBRARY_BASE.interactiveChildren = true;
            this.child.gui.state.setAnimation(1, 'showEditor_thumbs', false);
        };
    };
    showEditor_tiles(){
        if(!this.LIBRARY_TILE.renderable){
            this.LIBRARY_TILE.renderable = true;
            this.LIBRARY_TILE.interactiveChildren = true;
            this.child.gui.state.setAnimation(2, 'showEditor_tiles', false);
        };
    };

    
    /** hide editor*///#
    hideEditor(){
        this.hideEditor_thumbs();
        this.hideEditor_tiles();
    };
    hideEditor_thumbs(){
        if(this.LIBRARY_BASE.renderable){
            this.LIBRARY_BASE.renderable = false;
            this.LIBRARY_BASE.interactiveChildren = false;
            this.child.gui.state.setAnimation(1, 'hideEditor_thumbs', false);
        };
    };

    hideEditor_tiles(){
        if(this.LIBRARY_TILE.renderable){
            this.LIBRARY_TILE.renderable = false;
            this.LIBRARY_TILE.interactiveChildren = false;
            this.child.gui.state.setAnimation(2, 'hideEditor_tiles', false);
        };
    };

        /** affiche les tiles dun sheets selectionner dans thumbs libs*/
    showTilesLibs(ee){ // TODO: CREER D'AVANCE LES TEXTURES
        const dataBase =  ee.data || ee.dataObj.dataBase;
        // si click double, fermer
        if(this.child.txt.titleSheets.text === dataBase._dataBaseName){
            this.child.txt.titleSheets.text = '';
            return this.hideEditor_tiles();
        }else{
            this.showEditor_tiles();
            this.child.txt.titleSheets.text = dataBase._dataBaseName;
        }
        this.LIBRARY_TILE.TILES.removeChildren();
        const list = [];
        const textures = dataBase.textures? Object.keys(dataBase.textures) : dataBase.data.skins.map(s=>s.name);
        textures.forEach(textureName => {
            const dataObj = $objs.create(dataBase,textureName); //$objs.newContainer_dataBase(dataBase,textureName,true);
            //dataObj.child.parentGroup = $displayGroup.group[1]; //TODO: linker au mode global de l'editeur
            dataObj.initializeFactory();
            this.create_debug(dataObj);
            this.activeNormals(dataObj,null);
            list.push(dataObj.child);
            // interactions
            dataObj.child.interactive = true;
            //dataObj.child.on('pointerdown', this.pDW_Library_tile_mask , this);
            dataObj.child.on('pointerover', this.pointerover_tile , this);
            dataObj.child.on('pointerout' , this.pointerout_tile, this);
            dataObj.child.on('pointerup'  , this.pointerup_tile , this);
            //dataObj.child.on('mousewheel'     , this.pWEEL_Library_tile_mask , this);
        });
        this.computeTilesPosition(list);
    };

    
    toggle_thumbsLibs(button=this.child.gui.skeleton.findSlot('icon_darkMode').currentSprite){
        this._showList = !this._showList;
        if(this._showList){
            this.create_Inspector_thumbsLibs();
            this.child.gui.state.setAnimation(1, 'expendThumbsLibs', false);
            TweenMax.to(this.LIBRARY_BASE.mask, 0.7, {height:700, ease: Power4.easeInOut });
            if(this.LIBRARY_TILE.renderable){ // si tilelibs activer, cacher
                this.hideEditor_tiles();
            }
        }else{
            this.create_Inspector_thumbsLibs(true);
            this.child.gui.state.setAnimation(1, 'colapseThumbLibs', false);
            TweenMax.to(this.LIBRARY_BASE.mask, 0.4, {height:110, ease: Power4.easeOut });
        };
    };

    //endregion

    /** ajout dataObj au registe $objs */

    /** ajoute un dataObj a la map, indique si on engiristre */
    add_toMap(dataObj) { // add new sprite to map
       // const dataObj = $objs.createFrom(_dataObj.clone(true));
        //!dataObj.factory && dataObj.initializeFactory();
        this.create_debug(dataObj);
        //this.create_Debug(_dataObj);
        dataObj.child.interactive = true;
        dataObj.child.on('pointermove'      , this.pointermove_sprite      , this);
        dataObj.child.on('pointerover'      , this.pointerover_sprite      , this);
        dataObj.child.on('pointerout'       , this.pointerout_sprite       , this);
        dataObj.child.on('pointerdown'      , this.pointerdown_sprite      , this);
        dataObj.child.on('pointerup'        , this.pointerup_sprite        , this);
        dataObj.child.on('pointerupoutside' , this.pointerupoutside_sprite , this);
        $stage.scene.addChild(dataObj.child);
        // set positon to mouse
        let pos = this.interaction.mouse.getLocalPosition($stage.scene.Background, new PIXI.Point(), this.interaction.mouse.global);
        dataObj.child.position3d.set(pos.x,0,-pos.y);
        return dataObj;
    };

    /** ajoute un dataObj a la sourie */
    add_toMouse(dataObj,protectRigtClickhDelete){ // attache to mouse update
        this.protectRigtClickhDelete = !!protectRigtClickhDelete;
        this.setObjsInteractive(false,dataObj.child);
        this.hideEditor();
       
        Inspectors.DataObj(dataObj)
        this.enlargeHitZone(dataObj);
        this.inMouse = dataObj;
        dataObj.child.parentGroup = $displayGroup.group[1]; // DELETEME:
        this.update_debug(dataObj);
       //if(this.remove_toMouse(this.inMouse) && ignor){ return };
       //this.setObjsInteractive(false);
       
       //this.hideTileLibs();
       //this.hideEditor();
        return dataObj;
        
        
        //force current sprite inMouse interactivity
        //dataObj.child.interactive = true;
    };
    remove_toMouse(dataObj,doFactory){ // detach from mouse
        this.inMouse = null;
        dataObj.initializeFactory()
        this.remove_Inspector(dataObj);
        this.enlargeHitZone(dataObj,'remove');
        // is registered ? on apply factory, sinon ces quil est suprimer.

        
       
    
       // $stage.scene.removeChild(this.inMouse.child);
        //this.removeDatGui(dataObj)
       
       // if(!cage){return false}
       // const wasIn = this.inMouse === cage;
       // this.enlargeHitZone(cage,'remove');
       // this.inMouse = false;
       // cage.Debug.hitZone.tint = 0x000000;
       // this.setObjsInteractive(true);
       // return wasIn;
    };

    /** enlarge hit zone from mouse */
    enlargeHitZone(dataObj,remove){
        // disable other interactive obj map
       //cage.Debug.hitZone.clear();
       //cage.Debug.hitZone.lineStyle(2, 0xff0000, 1).drawRect(LB.x, LB.y, LB.width, LB.height);
        if(remove){
            dataObj.child.hitArea = null;
            dataObj.child.removeChild(dataObj.child.Debug.hitArea);
            delete dataObj.child.Debug.hitArea;
            //cage.hitArea = null;
        }else{
            const LB = dataObj.child.getLocalBounds();
            LB.pad(1920,1080);
            dataObj.child.hitArea = LB;
            //TODO: METRE DANS DEBUG
            const hitZone = dataObj.child.Debug.hitArea = new PIXI.Graphics();
            hitZone.name = "debug-hitZone";
            hitZone.lineStyle(3, 0xffffff, 1).drawRect(LB.x, LB.y, LB.width, LB.height);
            hitZone.endFill();
            dataObj.child.addChild(hitZone);
        }
    };

    /** affiche les preview des baseTexture */
    showPreviewThumbs(ee){
        if(ee.__previewBase){this.hidePreviewThumbs(ee)};
        const cage = new PIXI.Container();
        const bg = new PIXI.Sprite(PIXI.Texture.WHITE);
        const base = Object.values(ee.data.BaseTextures).map(b=>new PIXI.Sprite(b));
        base.forEach((b,i) => {
            b.scale.set($app.getRatio(b, 460, 300));
            base[i-1] && (b.x = base[i-1].width*i);
        });
        cage.addChild(bg,...base);
        // info
        const info = new PIXI.Text(`${JSON.stringify(ee.data.data.meta?ee.data.data.meta.size:ee.data.data.skeleton)}\n${ee.data._url}`);
        info.y = cage.height+4;
        cage.addChild(info);
        this.addChild(cage);
        [bg.width,bg.height] = [cage.width,cage.height];
        ee.__previewBase = cage;
    };

    /** cache les preview des baseTexture */
    hidePreviewThumbs(ee){
        this.removeChild(ee.__previewBase);
        ee.__previewBase = null;
    };

    /** dispatch buttons interaction */
    execute_buttons(e,button = e.currentTarget) {
        const slot = button.slot;
        const name = slot.currentSpriteName;
        switch (name) {
            case "icon_darkMode" : this.toggle_thumbsLibs(button); break; // TOGGLE SHOW/HIDE thumbs list
           case "icon_Save" : this.create_Inspector_save(); break;
           // case "icon_light" : this.add_light(ee) ;break;
           case "icon_showHideSprites": this.toggle_debugMode(); ;break;
           case "icon_grid" : this.create_grids ( ) ;break;
           case "icon_pathMaker" : this.toggle_drawPathMode(e ); ;break;
          // case "icon_masterLight" : this.open_dataInspector ($stage.LIGHTS.ambientLight ); ;break;
            case "icon_setup" : this.create_datGui_sceneSetup ();break;
          // case"gb0":case"gb1":case"gb2":case"gb3":case"gb4":case"gb5":case"gb6": this.changeDisplayGroup(+name.substr(2)); ;break;
          // case "icon_drawLine" : this.create_lines(); ;break;
          // default: throw console.error(' le button name existe pas , TODO'); break;
        };
    };

    /** mode dessin de path des cases */
    toggle_drawPathMode(e) {
        const ee = e.currentTarget;
        // si click droite, permet effacer tous les pathConnexion
        if(e.data.button === 2){// clicl rigth
            const ask = confirm("DELETE ALL pathConnexion?");
            if (ask) {
               // $objs.CASES_L.forEach(c => { c.pathConnexion = {}, c.dataObj.p.pathConnexion = {} });
                iziToast.warning( this.iziMessage('','All Path cleared') );
            };
            return;
        };
        //SHOW PATH
        if(this._pathMode = !this._pathMode){
            this.pathBuffer = [];
            this.hideEditor();
            ee.slot.color.set(1,1,0.1,1); // (r, g, b, a)
            ee.scale.set(1.5,-1.5);
            $objs.LOCAL.forEach(dataObj => {
                const isCase = dataObj instanceof DataObj_Case;
                dataObj.child.interactive = isCase;
                dataObj.child.d && (dataObj.child.d.renderable = isCase);
                dataObj.child.s && (dataObj.child.s.renderable = isCase);
            });
            this.refreshPath();
        }else{
            delete this.pathBuffer;
            this.showEditor();
            ee.slot.color.set(1,1,1,1); // (r, g, b, a)
            ee.scale.set(1,-1);
            $objs.LOCAL.forEach(dataObj => {
                dataObj.child.interactive = true;
                dataObj.child.d && (dataObj.child.d.renderable = true);
                dataObj.child.s && (dataObj.child.s.renderable = true);
            });
            /** on recrit le factory des cases pour update path */
            $objs.CASES_L.forEach(dataObj=>{
                dataObj.initializeFactory();
            });            
        };
    };

    /** scan tous les pathConnexion des cases local pour les identifier */
    refreshPath() {
        this.pathBuffer = [];
        const CASES_L = $objs.CASES_L;
        const LOCAL = $objs.LOCAL; // parceque les localID sont pas pour CASES_L
        let BufferTxtDist = []; // buffer pour ecrire txt dist 1 seul foi
        CASES_L.forEach(dataObj => {
            // reset
            dataObj.child.Debug.path.removeChildren();
            dataObj.child.Debug.path.graficConection = [];
            dataObj.child.Debug.path.texts = [];
            if(this._pathMode){
                // dra local and global id.
                const txtGL = new PIXI.Text(`G:${dataObj._globalId}\nL:${dataObj._localId}`,{fontSize:32,fill:0xffffff,strokeThickness:4,stroke:0x000000});
                dataObj.child.Debug.path.addChild(txtGL);
                
                Object.keys(dataObj.pathConnexion).forEach(id => { // connextion id to sprite ID
                    const dist = dataObj.pathConnexion[id];
                    const line = new PIXI.Graphics();
                    line.lineStyle(2, 0x4286f4, 0.5)
                    .moveTo(0,0).bezierCurveTo(0, 70, dist, 70, dist, 0)//.lineTo(dist.d, 0)
                    .endFill();
                    const lineSprite = new PIXI.projection.Sprite3d ( $app.renderer.generateTexture( line,1,2 ) );
                        lineSprite.rotation = this.getDistanceFrom(dataObj.child,LOCAL[id].child).a; //!
                        lineSprite.euler.x = -Math.PI/2;
                        lineSprite.scale3d.set(~~1/dataObj.child.scale3d.x);
                        if(!BufferTxtDist.contains(Math.abs(dist))){
                            BufferTxtDist.push(Math.abs(dist));
                            const txt = new PIXI.Text(`Dist: ~${~~dist}`,{fill:"white"});
                            const reverseX = dataObj.child.position3d.x>LOCAL[id].child.position3d.x? -0.4:0.4;
                            txt.anchor.set(0.5);
                            txt.scale.set(reverseX,-0.4);
                            txt.position.set(dist/2,50);
                            lineSprite.addChild(txt)
                            dataObj.child.Debug.path.addChild(lineSprite);
                        }
         
                });
            }
        });
    };

    // lorsque MouseHold, on ajoute les casesIn dans un buffer, lorsque mouseHold release, on Compute le buffer
    checkPathMode(dataObj) {
        // si pas deja dans buffer: ajouter les connextion
        if(!this.pathBuffer.contains(dataObj)){
            this.pathBuffer.push(dataObj);
            // create debug number
            const txt = new PIXI.Text(this.pathBuffer.length,{fontSize:42,fill:0xff0000,strokeThickness:8,stroke:0x000000});
            dataObj.child.Debug.path.addChild(txt);
        };
    };
    
    /** get distance between 2 3dpoint */
    getDistanceFrom(t1,t2){
        const p1 = t1.position3d;
        const p2 = t2.position3d;
        const deltaX = p1.x - p2.x;
        const deltaY = p1.y - p2.y;
        const deltaZ = p1.z - p2.z;
        return {
            d:Math.sqrt( deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ ),
            a:-Math.atan2(p2.z - p1.z, p2.x - p1.x),
        };
    };
    // finalise compute path draw in buffers, convert buffer in pathConnexion
    computeDrawPathBuffers() {
        const CASES_L = $objs.CASES_L;
        for (let i=0, l=this.pathBuffer.length; i<l; i++) {
            const preview = this.pathBuffer[i-1];
            const current = this.pathBuffer [i  ];
            const next    = this.pathBuffer [i+1];
            const preview_id = preview && preview._localId;
            const current_id = current && current._localId;
            const next_id    = next    && next   ._localId;
            //TODO: FIXME: compute distance via global position for Math.hypot
            if(preview){
                current.pathConnexion[String(preview_id)] = +this.getDistanceFrom(current.child,preview.child).d.toFixed(2);
            };
            if(next){
                current.pathConnexion[String(next_id)] = +this.getDistanceFrom(current.child,next.child).d.toFixed(2);
            };
        };
        this.refreshPath();
    };

    /** calcule les position des tiles dans la library tiles */
    computeTilesPosition(LIST){
        const list = [];
        for (let i=0,x=0,y=0,ma=10,maxY=this.LIBRARY_TILE.mask.height, l=LIST.length; i<l; i++) {
            const tile = LIST[i];
            const h = tile.height;
            if(y+ma+h>maxY && y>0){ // hors de porter y , decal X=>marge
                x+=ma;
                y=0;
                i--;
                continue;
            }
            tile.position.set(x,y);
            const hit = list.find((tt)=>{ return $app.hitCheck(tile, tt) });
            if(hit){
                y+=hit.height+ma;
                i--;
                continue;
            }
            list.push(tile);
        };
        this.LIBRARY_TILE.TILES.addChild(...list);
        // perfect positioning
        this.LIBRARY_TILE.TILES.position.set(0);
        const mb = this.LIBRARY_TILE.mask.getBounds();
        const tb = this.LIBRARY_TILE.TILES.getBounds();
        this.LIBRARY_TILE.TILES.position.set(Math.abs(tb.x-mb.x),Math.abs(tb.y-mb.y));
    };

    update(){
        if(Inspectors.__busySlider){return};
        if( this.inMouse ){
            const c = this.inMouse.child;
            let pos = this.interaction.mouse.getLocalPosition($stage.scene.Background, new PIXI.Point(), this.interaction.mouse.global);
            c.position3d.set(pos.x,c.position3d._y,-pos.y);
        };
        if(this.FASTMODE){
            this.update_fastMode(this.FASTMODE);
        };
    };

    update_debug(dataObj){
       //dataObj.child.Debug.piv.pivot3d.x = -dataObj.child.pivot3d.x;
       //dataObj.child.Debug.piv.pivot3d.y = -dataObj.child.pivot3d.y;
       //dataObj.child.Debug.piv.pivot3d.z = -dataObj.child.pivot3d.z;
        dataObj.child.Debug.piv.position3d.copy(dataObj.child.pivot3d);
       // dataObj.child.Debug.bg.position3d.copy(dataObj.child.pivot3d);
        
    };

    /** disable normal dun dataObj, car dans libs on veut pas de normal */
    activeNormals(dataObj,value){
        if(dataObj.dataBase.isSpineSheets){
            const slots = dataObj.child.s.hackAttachmentGroups("_n",value&&PIXI.lights.normalGroup, value&&PIXI.lights.diffuseGroup);
            slots[1].forEach(s=>{
                s.renderable = false;
            })
        }
        if(dataObj.dataBase.isSpriteSheets){
            dataObj.child.d.parentGroup = value&&PIXI.lights.diffuseGroup;
            dataObj.child.n.parentGroup = value&&PIXI.lights.normalGroup;
            dataObj.child.n.renderable = value;
        }

    };
    /** clear la scene map et tous objet */
    clearScene(){
        $objs.LOCAL.forEach(obj=>{
            obj && $stage.scene.removeChild(obj.child);
            $objs.LOCAL[obj._localId] = null;
            $objs.GLOBAL[obj._globalId] = null;
        });
    };
        //#region [rgba(100, 5, 0,0.2)]
        // ┌------------------------------------------------------------------------------┐
        // SAVE COMPUTE JSON
        // └------------------------------------------------------------------------------┘
    startSaveDataToJson(options) { //  from: dataIntepretor save 
        this.hideEditor();
        const BLUR = this.FILTERS.BlurFilter;
        $displayGroup._layer_diffuseGroup.filters = [BLUR];
        TweenLite.fromTo(BLUR, 0.5, { blur:0},{ blur:11, ease: Power2.easeOut }).eventCallback("onComplete", ()=>{$displayGroup._layer_diffuseGroup.filters = null})
            $stage.interactiveChildren = false; // disable stage interactive
        this.create_JSON(options).then(() => {
            $stage.interactiveChildren = true; // disable stage interactive
            iziToast.warning( $PME.savedComplette() );
        });
    };

    create_JSON(options) {
        return new Promise((resolve, reject) => {
            const _lights      = {ambientLight:false,DirectionalLight:false,PointLight:false}
            const _objs        = $objs.LOCAL.filter(a=>a).map(a=>a.factory);//$objs.get_list;
            const _background  = $stage.scene.Background.name || ""; // factory dataValues//FIXME: just le nom
            const _sheets      = Array.from( new Set(_objs.map(dataObj=>dataObj.g._dataBaseName.value)).add(_background) ) ; // Set: remove les duplicata
            const SYSTEM = {}; // TODO:
            ///const SYSTEM = {memoryUsage:dataValues.memoryUsage,timeElasped:PIXI.ticker.shared.lastTime / 1000, data: new Date().toDateString()};
            const json = { SYSTEM, _lights , _background, _sheets, _objs, };
            const fs = eval("require('fs')");
            function writeFile(path,content){
                // backup current to _old.json with replace() rename()
                fs.rename(`${path}`, `${path.replace(".","_OLD.")}`, function(err) {
                    if ( err ) { console.log('ERROR:rename ' + err) };
                    fs.writeFile(path, content, 'utf8', function (err) { 
                        if(err){return console.error(path,err) }
                        resolve();
                        return console.log9("WriteFile Complette: "+path,JSON.parse(content));
                    });
                });
            };     
            writeFile(`data/scene/${$stage.scene.constructor.name}.json` , JSON.stringify(json, null, '\t') );
        });
    };
    //#endregion

   
};//END 