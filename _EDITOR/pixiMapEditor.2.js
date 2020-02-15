/*:
// PLUGIN □────────────────────────────────□PIXI MAP EDITOR□─────────────────────────────────────────┐
* @author □ Jonathan Lepage (dimisterjon),(jonforum) 
* @plugindesc EDITOR GUI for create map with object sprine JSON (texture packer, spine)
* V.3.0
* License:© M.I.T
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
*/

let $PME;
document.addEventListener('keydown', (e)=>{
    if(!$PME && e.key=== "F1"){
        console.log0('__________________initializeEditor:__________________ ');
        $PME = new _PMEditor();
    };
});

class _PMEditor {
    //#region [Static]
    /** mode dessin des path pour les cases */
    static _pathMode = false;
    /** pool array des cases hover pendant drawpath, le pool est vider lorsque click relacher 
     * @type {Array.<_PME_ObjMapDebug>}
    */
    static PathPool = [];
    /**@type {_PME_ObjMapDebug} */
    static SCOPE = null;
    /**@type {PIXI.spine.Spine} */
    static GUI = null;
    static DATA2 = null;
    static FILTERS = {
        OUTLINE1:new PIXI.filters.OutlineFilter(20,0xef2ac4),
        OUTLINE2:new PIXI.filters.OutlineFilter(2,0xc9c9c9),
        ALPHA: new PIXI.filters.AlphaFilter(0.3)
    }
    //#endregion
    constructor() {
        this._isMode_pathMode = false;
        /** toggle mode pour debug renderable, affiche les debug */
        this._debugRenderableMode = true;
        /** @type {{ 'Master':PIXI.Container, 'Gui':PIXI.spine.Spine, 
         * 'Library1':_PME_Library1, 'Library2':_PME_Library2, 'EE':, 'FF':, }} */
        this.child = {};
        this.initialize();
    };
    get PME() {
        return _PMEditor;
    }
    //#region [GetterSetter]
    get Library1() {
        return this.child.Library1;
    }
    get Library2() {
        return this.child.Library2;
    }
    get Gui() {
        return this.child.Gui;
    }
    //#endregion
    //#region [Initialize]
    async initialize() {
        //todo: add clear and gotToscene
        this.initialize_pre();
        await this.initialize_loader_gui();
        await this.initialize_loader_libs();
        this.initialize_base();
        this.initialize_Inspector();
        this.initialize_interactions();
        $stage.addChild(this.child.Master);
    };
    
    /** Tous ce qui nessesite la preparation */
    initialize_pre(){
        $camera._inteliCam = false;
        PIXI.utils.clearTextureCache();
        $stage.scene.interactiveChildren = true;
        $gui.setRendering(false);
        //disable events
        $camera._culling = false;
        $objs.LOCAL.forEach(dataObj=>{
            const ObjMapDebug = new _PME_ObjMapDebug(dataObj);
            _PME_ObjMapDebug.POOL.push(ObjMapDebug);
        })
    }
    initialize_loader_gui(){
        return new Promise((resolve, reject) => {
            const loader = new PIXI.loaders.Loader();
            loader.add("gui", "_EDITOR/pixiMapEditor1.json").load()
            .onComplete.add((l,res) => {
                const gui = this.PME.GUI = new PIXI.spine.Spine(res.gui.spineData);
                gui.name = 'Gui';
                gui.stateData.defaultMix = 0.1;
                gui.state.setAnimation(0, 'idle', true);
                gui.state.setAnimation(1, 'start0', false);
                resolve();
            });
        });
    }
    initialize_loader_libs(){
        return new Promise((resolve, reject) => {
            $loader.loadScene('Scene_Boot'); //todo:
            const check = setInterval(() => {
                if(!$loader._isLoading){
                    clearInterval(check);
                    resolve();
                };
            }, 80);
        });
    }
    initialize_base() {
        const Master = new PIXI.Container().setName('Master');
            Master.parentGroup = $displayGroup.group[5];
        //#library
        const Library1 = new _PME_Library1();
        const Library2 = new _PME_Library2();
        //!end
        Master.addChild(this.PME.GUI, Library1,Library2);
        this.child = Master.childrenToName();
    }
    initialize_Inspector(){
        const options = {//todo
            debugMode:['show','onHover','disable'],
        }
    }
    initialize_interactions() {
        document.addEventListener('wheel', (e) => { // zoom
            const hitTest = $mouse.interaction.hitTest($mouse.p.position);
            if(hitTest && hitTest._events.scrollwheel){
                hitTest.emit('scrollwheel',e,hitTest)
            }
        });
        //!mouse
        const canvas = $app.view;
        canvas.addEventListener("mouseup"  , (e)=>{ this.mouseup_canvas(e) });
        //!scroll zoom
        document.addEventListener('wheel', (e) => {
            // autorize zoom just quand sourit dans canvas
            if (e.path.contains($app.renderer.view)) {
                const hitTest = $mouse.interaction.hitTest($mouse.p.position);
                let allow = !hitTest || hitTest.parent instanceof _Scene_Base;
                allow && $camera.onMouseWheel.call($camera,e);
            }
        })
        //!button
        this.Gui.skeleton.slots.filter(slot => {
            return slot.data.name.contains("icon_") || slot.data.name.contains("gb");
        }).forEach(slot => {
            slot.currentSprite.interactive = true;
            slot.currentSprite.on('pointerover' , this.pointerover_button , this);
            slot.currentSprite.on('pointerout'  , this.pointerout_button  , this);
            slot.currentSprite.on('pointerup'   , this.pointerup_button   , this);
            slot.currentSprite.slot = slot; // ref the slot in sprite for events
        })
        //! scroller map
        let force = 1;
        let speed = 10;
        this._scrollable = true;
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
                ScrollX = ScrollX.clamp(-$camera._sceneW, $camera._sceneW);
                ScrollY = ScrollY.clamp(-$camera._sceneH, $camera._sceneH);
                $camera.view.position3d.x+=(ScrollX- $camera.view.position3d.x)/(speed);
                $camera.view.position3d.z+=(ScrollY- $camera.view.position3d.z)/(speed);
            }
        });
    }
    //#endregion
    //#region [Interactive]
    mouseup_canvas(e){
        
    }

    pointerover_button(e){
        const button = e.currentTarget;
        //button.slot.color.a = 1;
        button.filters = [this.PME.FILTERS.OUTLINE2];
        gsap.to(button.scale, 0.1, {x:1.1,y:-1.1, ease: Back.easeOut.config(1) });
    }
    pointerout_button(e){
        const button = e.currentTarget;
        button.slot.color.a = 1;
        button.filters = null;
        gsap.to(button.scale, 0.3, {x:1,y:-1, ease: Back.easeOut.config(1) });
    }
    pointerup_button(e){
        const button = e.currentTarget;
        gsap.fromTo(button.scale, 0.3, {x:0.9,y:-0.9,}, {x:1.1,y:-1.1, ease: Back.easeOut.config(1.3) });
        this.executeButton(button.slot);
    }
    //#endregion
    //#region [Method]
    executeButton(slot){
        const name = slot.currentSpriteName;
        switch (name) {
            //case "icon_darkMode"        : this.toggle_thumbsLibs        (slot) ; break;
            //case "icon_Save"            : this.create_Inspector_save    (slot) ; break;
            case "icon_showHideSprites" : this.toggle_debugMode         (slot) ; break;
            case "icon_grid"            : this.create_MapGrids             (slot) ; break;
            case "icon_pathMaker"       : this.toggle_drawPathMode      (slot) ; break;
            //case "icon_setup"           : this.create_datGui_sceneSetup (slot) ; break;
        };
    }

    /** Mode affiche des debugs */
    toggle_debugMode(value){
        if(value===undefined){
            value = this._debugRenderableMode = !this._debugRenderableMode;
        }else{
            this._debugRenderableMode = value;
        }
        
        _PME_ObjMapDebug.POOL.forEach(ObjMapDebug=>{
            ObjMapDebug.Debug.Axi3dContainer.renderable = value;
            ObjMapDebug.Debug.Background.renderable = value;
            ObjMapDebug.Debug.Axi3dContainer.visible = value;
            ObjMapDebug.Debug.Background.visible = value;
        })
    }

    create_MapGrids(){
        if(this.__grid){
            $stage.scene.Background.removeChild(this.__grid);
            this.__grid.destroy(true);
            return delete this.__grid;
        };
        const color = [0xffffff,0x000000,0xff0000,0x0000ff,0xffd800,0xcb42f4][~~(Math.random()*6)];
        const gridSize = 48;
        const [w,h] = [$camera._sceneW,$camera._sceneH];
        const grids = new PIXI.Graphics();
        grids.lineStyle(1, color, 1);
        // Vertical line
        for (let i=0, l=w/gridSize; i<l; i++) {
            grids.lineStyle(1, 0xFFFFFF, 1).moveTo(i*gridSize,0).lineTo(i*gridSize, h)
        };
        for (let i=0, l=h/gridSize; i<l; i++) {
            grids.moveTo(0,i*gridSize).lineTo(w, i*gridSize)
        };
        // draw center
        grids.lineStyle(3, 0xee82ff, 1).moveTo(w/2,0).lineTo(w/2, h).moveTo(0,h/2).lineTo(w, h/2);
        grids.endFill();
        const sprite1 = new PIXI.projection.Sprite3d( $app.renderer.generateTexture(grids) );
        //const sprite2 = new PIXI.projection.Sprite3d( $app.renderer.generateTexture(grids) );
        sprite1.alpha = 0.4;
        sprite1.anchor.set(0.5);
        sprite1.parentGroup = PIXI.lights.diffuseGroup;
        //sprite2.alpha = 0.1;
        //sprite2.anchor.set(0.5);
        //sprite2.euler.x = Math.PI/2;
        //sprite2.parentGroup = PIXI.lights.diffuseGroup;
        this.__grid = $stage.scene.Background.addChild(sprite1);
    }

    toggle_drawPathMode(){
        const option = {
            clearPath:(e)=>{},
            showId:true,
            showEnviroment:false,
        }
        Inspectors.Objects(option,'PathMode');
        // affiche et setup pathmode ou close
        if(this.PME._pathMode = !this.PME._pathMode){
            this.toggle_debugMode(false);
            this.drawPath();
        }else{

        }
    }
    getDistanceFrom(t1,t2){
        const p1 = t1.position3d;
        const p2 = t2.position3d;
        const deltaX = p1.x - p2.x;
        const deltaY = p1.y - p2.y;
        const deltaZ = p1.z - p2.z;
        return {
            d:Math.sqrt( deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ ),
            a:Math.atan2(p2.z - p1.z, p2.x - p1.x),
        };
    }

    /** upodate les selecteur de path 
     * @param {_PME_ObjMapDebug} ObjMapDebug
     * @param {boolean} clear
    */
    updatePathPool(ObjMapDebug,clear=false){
        if(clear){
            this.PME.PathPool = [];
        }
        this.PME.PathPool.push(ObjMapDebug);
        this.PME.PathPool.forEach((obj,i) => {
            const txt = new PIXI.Text(String(i),$systems.styles[1]);
            txt.y = 100;
            ObjMapDebug.Debug.PathContainer.addChild(txt)
        });
    }
    /** compute paths from pool*/
    createPath(){
        const pool = this.PME.PathPool.map(c=>c.DataObj);
        for (let i=0, l=pool.length; i<l; i++) {
            const preview = pool[i-1];
            const current = pool[i  ];
            const next    = pool[i+1];
            //TODO: FIXME: compute distance via global position for Math.hypot
            if(preview){
                //const id = preview._localCaseId;
                //current.pathConnexion[String(id)] = +this.getDistanceFrom(current.p, preview.p).d.toFixed(2);
            }
            if(next){
                const id = next._localCaseId;
                current.pathConnexion[String(id)] = +this.getDistanceFrom(current.p,next.p).d.toFixed(2);
            }
        }
        this.drawPath();
    }
    drawPath(){
        const CASES_G = $objs.CASES_G; // parceque les localID cible les global du jeux
        const CASES_L = $objs.CASES_L; // parceque les localID cible les global du jeux
        /** @type {Array.<_PME_ObjMapDebug>} */
        const CASES = [];
        _PME_ObjMapDebug.POOL.forEach(ObjMapDebug=>{
            const DataObj = ObjMapDebug.DataObj;
            DataObj.p.interactive = DataObj.isCase;
            if(DataObj.isCase){
                CASES.push(ObjMapDebug);
            }else{
                ObjMapDebug.DataObj.p.visible = false;
            }
        })
        let pathBuffer = [];
        let BufferTxtDist = [];
        CASES.forEach(ObjMapDebug => {
            /**@type {_DataObj_Case} */
            const DataObj = ObjMapDebug.DataObj;
            const PathContainer = ObjMapDebug.Debug.PathContainer;
            const txtIDs = new PIXI.Text(`G:${DataObj._globalCaseId}\nC:${DataObj._localCaseId}`,$systems.styles[0]);
            PathContainer.addChild(txtIDs);
            const pathConnexion = Object.keys(DataObj.pathConnexion);
            if(pathConnexion.length){
                Object.keys(DataObj.pathConnexion).forEach(id => {
                    const dist = this.getDistanceFrom(DataObj.p, CASES_L[id].p) //DataObj.pathConnexion[id];
                    const line = new PIXI.Graphics().lineStyle(4, 0x4286f4, 1)
                    .moveTo(0,0).bezierCurveTo(0, 70, dist.d, 70, dist.d, 0).endFill();
                    const lineSprite = new PIXI.projection.Sprite3d ( $app.renderer.generateTexture( line ) );
                        lineSprite.rotation = -dist.a;
                        lineSprite.y = -80;
                        PathContainer.euler.x = -0.25;
                        lineSprite.euler.x = -Math.PI/2;
                        lineSprite.scale3d.set(1/DataObj.p.scale3d.x);
                        Inspectors.DisplayObj(lineSprite)
                    PathContainer.addChild(lineSprite);
                    const txtDist = new PIXI.Text(`dist:${~~dist.d}`,$systems.styles[0]);
                    txtDist.y = 50;
                    txtDist.x = dist.d/2;
                    txtDist.scale.set(1,-1);
                    lineSprite.addChild(txtDist);
                });
            }else{//todo: ou ajouter un cercle rouge
                DataObj.child.CaseColor.filters = [this.PME.FILTERS.ALPHA]
                DataObj.p.d.filters = [this.PME.FILTERS.ALPHA]
                DataObj.p.d.filters = [this.PME.FILTERS.ALPHA]
            }
            /*Object.keys(DataObj.pathConnexion).forEach(id => {
                const dist = getDistanceFrom(DataObj.p, CASES_G[id].p) //DataObj.pathConnexion[id];
                const line = new PIXI.Graphics().lineStyle(2, 0x4286f4, 0.5)
                .moveTo(0,0).bezierCurveTo(0, 70, dist, 70, dist, 0).endFill();
                const lineSprite = new PIXI.projection.Sprite3d ( $app.renderer.generateTexture( line,1,2 ) );
                    lineSprite.rotation = getDistanceFrom(DataObj.p, CASES_G[id].p).a;
                    lineSprite.euler.x = -Math.PI/2;
                    lineSprite.scale3d.set(~~1/DataObj.p.scale3d.x);
                    PathContainer.addChild(lineSprite);
                const txtDist = new PIXI.Text(`dist:${dist}`,{fontSize:24,fill:0xffffff,strokeThickness:2,stroke:0x000000});
                txtDist.y = 50;
                PathContainer.addChild(txtDist);
            });*/

        });
    }
    //#endregion
}

/** La library afficher */
class _PME_Library1 extends PIXI.Container {
    static MAXWIDTH = 1800;
    constructor() {
        super();
        this.name = "Library1";
        this._totalLine = 1;
        this._currentLine = 0;
        this.initialize();
    };
    //#region [GetterSetter]
    get PME() {
        return _PMEditor;
    }
    //#endregion

    //#region [Initialize]
    initialize() {
        this.initialize_base();
        this.initialize_interactions();
        this.position.set(90,950);
    };
        
    initialize_base() {
        const Master = new PIXI.Container().setName('Master');
        const bg = new PIXI.Sprite(PIXI.Texture.WHITE).setName('bg');
            bg.alpha = 0.1;
            bg.width = _PME_Library1.MAXWIDTH;
            bg.height = 0;
        //#mask
        const mask = new PIXI.Sprite(PIXI.Texture.WHITE).setName('mask');
            mask.width = _PME_Library1.MAXWIDTH+10;
            mask.height = _PME_Sheet.MAXH+10;
            Master.mask = mask;
        //# les spriteSheets icon
        let sheets = [];
        Object.keys($loader.DATA2).forEach(dataBaseName => {
            const Sheet = new _PME_Sheet(dataBaseName,this);
            sheets.push(Sheet);
        });
        //!end
        Master.addChild(bg,...sheets);
        this.addChild(mask,Master);
        this.child = this.childrenToName();
        this.sort();
    }
    initialize_interactions() {
        const mask = this.child.mask;
        mask.interactive = true;
        mask.on('pointerdown'       , this.pointerdown_bg    , this);
        mask.on('pointerup'         , this.pointerup_bg    , this);
        mask.on('scrollwheel'         , this.scrollwheel    , this);
    }
    //#endregion

    //#region [Interactive]
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerdown_bg(){
        const bg = this.child.bg;
        bg.alpha = 1;
    }
    
    pointerup_bg(){
        const bg = this.child.bg;
        bg.alpha = 0.1;
    }
    
    scrollwheel(e){
        const dir = Math.sign(e.wheelDelta); // -1|1
        this._currentLine = Math.max(Math.min(this._currentLine+dir,this._totalLine),0);
        const y = this._currentLine* _PME_Sheet.MAXH;
        const Master = this.child.Master;
        gsap.to(Master.pivot, 0.3,{y:y, ease:Back.easeOut.config(1) })
    }
    //#endregion

    sort(){
        const list = this.child.Sheet;
        let line = 0;
        for (let i=0,x=0,y=0, l=list.length; i<l; i++) {
            const Sheet = list[i];
            if(x+Sheet.width+10>_PME_Library1.MAXWIDTH){
                x=0;
                y+=_PME_Sheet.MAXH+2;
                line++;
            }
            Sheet.position.set(x,y);
            x+=Sheet.width+10;
        };
        const bg = this.child.bg;
        bg.height = this.child.Master.height;
        this._totalLine = line;
    }
};

class _PME_Library2 extends PIXI.Container {
    static MAXWIDTH = 630;
    static MAXHEIGTH = 850;
    constructor() {
        super();
        this.name = "Library2";
        /**@type {_PME_Sheet} - Le sheets actuelement visible ou en cache */
        this.Sheet = null;
        /** @type {{ 'ContainerLibs':PIXI.Container, 'bg':PIXI.Sprite, 'CC':, 'DD':, 'EE':, 'FF':, }} */
        this.child = null;
        /** zoom lib */
        this._zoom = 1;
        /** interavl on scroll */
        this._interval = null;
        this.initialize();
    }

    //#region [GetterSetter]
    get PME() {
        return _PMEditor;
    }
    //#endregion

    //#region [Initialize]
    initialize() {
        this.initialize_base()
        this.initialize_interactions()
        //this.child = this.childrenToName()
        this.position.set(1275,55);
        this.hide();
    }
        
    initialize_base() {
        const ContainerLibs = new PIXI.Container().setName('ContainerLibs');
        const bg = new PIXI.Sprite(PIXI.Texture.WHITE).setName('bg');
            bg.alpha = 0.2;
            bg.anchor.set(1,0);
            bg.position.x = _PME_Library2.MAXWIDTH+12;
            bg.width = _PME_Library2.MAXWIDTH+10;
            bg.height = _PME_Library2.MAXHEIGTH;
        const mask = new PIXI.Sprite(PIXI.Texture.WHITE).setName('Mask');
            //mask.alpha = 0.2;
            mask.anchor.set(1,0);
            mask.position.x = _PME_Library2.MAXWIDTH+12;
            mask.width = _PME_Library2.MAXWIDTH+10;
            mask.height = _PME_Library2.MAXHEIGTH;
            ContainerLibs.mask = mask;
        //!end
        this.addChild(mask,bg,ContainerLibs);
        this.child = this.childrenToName();
    };
    initialize_interactions() {
        const bg = this.child.bg;
        bg.interactive = true;
        bg.on('scrollwheel' , this.scrollwheel, this);
        bg.on ('pointerdown'      , this.pointerdown_tile      , this ) ;
        bg.on ('pointerup'        , this.pointerup_tile        , this ) ;
        bg.on ('pointerupoutside' , this.pointerup_tile , this ) ;
    }
    //#endregion

    //#region [Interactive]
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerover_tile(e){
        if(this._scroll){return}
        const master = e.currentTarget;
        gsap.to(master, 0.2,{alpha:4});
        master.filters = [this.PME.FILTERS.OUTLINE1];
    }
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerout_tile(e){
        const master = e.currentTarget;
        gsap.to(master, 0.6,{alpha:1})
        master.filters = null;
    }
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerdown_tile(e){
        const ContainerLibs = this.child.ContainerLibs;
        const bg = this.child.bg;
        const point = $mouse.InteractionData.global.clone();
        const x = ContainerLibs.x;
        clearInterval(this._interval);
        ContainerLibs.mask.width = 1920;
        bg.width = 1920;
        let wait = 10;
        this._interval = setInterval(() => {
            if(--wait<0){
                this.child.ContainerLibs.interactiveChildren = false;
                this._scroll = true;
                const xx = (x+(point.x-$mouse.xx))*1.2;
                const marge = Math.max((210/this._zoom),200);
                ContainerLibs.x = Math.max(Math.min(xx,_PME_Library2.MAXWIDTH-marge),-ContainerLibs.width+marge);
            }
        }, 16);
    }
    /** @param {_PME_Library2} context -executer avant pour creer un tilemap */
    pointerup_tilecreate(e,context = e.currentTarget.parent.parent){
        if(!context._scroll){ //todo: bug defoi pointerup_tilecreate est executer apres pointerup_tile !?
            context.hide();
            _PME_ObjMapDebug.create(this.DataObj.clone())
        }
    }
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerup_tile(e){
        const ContainerLibs = this.child.ContainerLibs;
        const bg = this.child.bg;
        bg.width = _PME_Library2.MAXWIDTH+10;
        ContainerLibs.mask.width = _PME_Library2.MAXWIDTH+10;
        clearInterval(this._interval);
        this._scroll = false;
        this.child.ContainerLibs.interactiveChildren = true;
    }
    scrollwheel(e){
        const bg = this.child.bg;
        const Mask = this.child.Mask;
        const dir = Math.sign(e.wheelDelta)/10; // -1|1
        this._zoom = Math.max(Math.min( this._zoom+dir ),0.1);
        gsap.killTweensOf(this.child.ContainerLibs.scale);
        gsap.fromTo(bg, 2,{alpha:0}, {alpha:0.2})
        gsap.to(this.child.ContainerLibs.scale, 0.2, {x:this._zoom,y:this._zoom, ease:Back.easeOut.config(1) })
        .eventCallback("onComplete", ()=>{ this.sort() });
    }
    //#endregion
    //#region [Method]
    /**@param {_PME_Sheet} Sheet toggle show hide */
    toggle(Sheet){
        this.show(Sheet);
    }
    /**@param {_PME_Sheet} Sheet*/
    show(Sheet){
        this.PME.GUI.state.setAnimation(2, 'showEditor_tiles', false);
        if(this.Sheet !==Sheet){
            this.createFrom(Sheet);
        }
        this.renderable = true;
        this.visible = true;
    }
    /**@param {_PME_Sheet} [Sheet]*/
    hide(Sheet){
        this.PME.GUI.state.setAnimation(2, 'hideEditor_tiles', false);
        this.renderable = false;
        this.visible = false;
    }

    /**@param {_PME_Sheet} Sheet - creer les tile pour libs2*/
    createFrom(Sheet){
        const dataBase = Sheet.dataBase;
        let Objs = [];
        const textures = dataBase.data.animations? Object.keys(dataBase.data.animations):
        dataBase.data.isSpineSheets? dataBase.data.skins.map(s=>s.name) : Object.keys(dataBase.textures);
        textures.forEach((textureName,i) => {
            const master = new PIXI.Container().setName(textureName);
            const container = $objs.create(null, dataBase, textureName,true);
            if(dataBase.isSpineSheets){
                container.s.hackAttachmentGroups("_n", null,null);
                container.s.state.setAnimation(0, textureName, true);
                container.position.set(210/2,210);
            }else
            if(dataBase.isAnimationSheets){
                container.a.loop = true;
                container.a.anchor.set(0);
                container.a.parentGroup = null;
                if(dataBase._normal){
                    container.n.anchor.set(0);
                    container.n.parentGroup = null;
                }
                container.a.play();
            }else
            if(dataBase.isSpriteSheets){
                container.d.anchor.set(0);
                container.n.anchor.set(0);
                container.d.parentGroup = null;
                container.n.parentGroup = null;
                container.n.renderable = false; // todo: hover
            }
            container.scale.set( $app.getRatio(container, 210, 210) );
            container.pivot.set((container.width-210)/2,(container.height-210)/2);
        
            //!bg
            const background = new PIXI.Sprite(PIXI.Texture.WHITE);
                background.alpha = 0.4;
                background.width = 210;
                background.height =210;
            //!text
            const txt = new PIXI.Text(`${textureName} [${~~container.width} ,${~~container.height}]`,{fontSize:15,fontWeight:'900'});
            const txtCat = new PIXI.Text(`${dataBase._category}`,{fill:'#a22f97',fontSize:14,fontWeight:'900'});
                txtCat.anchor.y = 1;
                txtCat.y = 210;
            const txtTotal = new PIXI.Text(`000`,{fontSize:15,fontWeight:'900'}); //todo: total de tile dans la map
                txtTotal.anchor.set(1,1);
                txtTotal.position.set(210);
            //txt.alpha = 0;
            //!bg text
            const bgtxt = new PIXI.Sprite(PIXI.Texture.WHITE);
            [bgtxt.width,bgtxt.height] = [210,txt.height+4];
            bgtxt.alpha = 0.5;
            master.addChild(background,container,bgtxt,txt,txtCat,txtTotal);
            Objs.push(master);
            //!interactive
            master.interactive = true;
            master.on ('pointerover'      , this.pointerover_tile      , this ) ;
            master.on ('pointerout'       , this.pointerout_tile       , this ) ;
            master.on ('pointerdown'      , this.pointerdown_tile      , this ) ;
            master.on ('pointerup'        , this.pointerup_tilecreate       , container ) ;
            master.on ('pointerupoutside' , this.pointerup_tile , this ) ;
            master.on ('pointerup'        , this.pointerup_tile        , this ) ;
            master.on ('scrollwheel'      , this.scrollwheel           , this ) ;

        });
        this.child.ContainerLibs.removeChildren(); // clear pass
        this.child.ContainerLibs.addChild(...Objs);
        this.sort();
        this.Sheet = Sheet;
    }
    /** sort positioning ContainerLibs tiles */
    sort(){
        const MAXHEIGTH = _PME_Library2.MAXHEIGTH/this._zoom;
        const list = this.child.ContainerLibs.children;
        const ratio4 = Math.ceil(4*((MAXHEIGTH-180)/_PME_Library2.MAXHEIGTH))
        for (let i=0,lineY=0,x=0,y=0, l=list.length; i<l; i++) {
            const c = list[i];
            gsap.to(c.position, 0.4, {x:x,y:y, ease:Elastic.easeOut.config(1, 0.3+Math.random()) });
            if((lineY+1)%ratio4){
                y+=210+4;
            }else{
                y = 0;
                x+=210+4;
            }
            lineY++;
        };
    }
    //#endregion

}

/** les Base SpriteSheets de la libs1 */
class _PME_Sheet extends PIXI.Container{
    //#region [Static]
    static ICOSIZE = 30;
    static MAXW = 134;
    static MAXH = 96;
    //#endregion
    /**
     * @param {string} dataBaseName
     * @param {_PME_Library1} that
     */
    constructor(dataBaseName,that) {
        super();
        this.that = that;
        this._dataBaseName = dataBaseName;
        this.name = 'Sheet'
        this.child = null;
        this.timeOut = null;
        this.initialize();
    };
    //#region [GetterSetter]
    get PME() {
        return _PMEditor;
    }
    get dataBase(){ return $loader.DATA2[this._dataBaseName] };
    //#endregion
    //#region [Initialize]
    initialize() {
        this.initialize_base();
        this.initialize_interactions();
    }
    initialize_base() {
        const dataBase = this.dataBase;
        const textureD = dataBase.BaseTextures.d;
        const textureN = dataBase.BaseTextures.n || PIXI.Texture.WHITE;
        //# spritesheet_D data2\FurnitureINT\bed\bed_001.png"
        const Spritesheet_D = new PIXI.Sprite(textureD).setName('Spritesheet_D');
            Spritesheet_D.scale.set( $app.getRatio(Spritesheet_D, _PME_Sheet.MAXW, _PME_Sheet.MAXH) );
        //#Icons
        let icons = [];
        let y = 0;
        let w = Spritesheet_D.width;
        ['isSpriteSheets','isSpineSheets','_normal','isAnimationSheets','isMultiPacks'].forEach(testKey => {
            const test = dataBase[testKey];
            if(test){
                const ico = new PIXI.Sprite.from(`_EDITOR/images/${testKey}.png`);
                ico.position.set(w,y);
                icons.push(ico);
                y+=_PME_Sheet.ICOSIZE+2;
            }
        });
        //#Background
        const Background = new PIXI.Sprite(PIXI.Texture.WHITE).setName('Background');
        Background.alpha = 0.4;
        Background.width = Spritesheet_D.width+_PME_Sheet.ICOSIZE;
        Background.height = Math.max(Spritesheet_D.height,y+_PME_Sheet.ICOSIZE);
        //! end
        this.addChild(Background,Spritesheet_D,...icons);
        this.child = this.childrenToName();
    }
    initialize_interactions() {
        const Background = this.child.Background;
        Background.interactive = true;
        Background.on ('pointerover'      , this.pointerover     , this     ) ;
        Background.on ('pointerout'       , this.pointerout      , this     ) ;
        Background.on ('pointerdown'      , this.pointerdown     , this     ) ;
        Background.on ('pointerup'        , this.pointerup       , this     ) ;
        Background.on ('pointerupoutside' , this.pointerupoutside, this     ) ;
        Background.on ('scrollwheel'      , this.that.scrollwheel, this.that) ;
    }
    //#endregion

    //#region [Interactive]
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerover(e){
        const Background = this.child.Background;
        Background.alpha = 1;
        this.filters = [this.PME.FILTERS.OUTLINE1];
    }
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerout(e){
        const Background = this.child.Background;
        Background.alpha = 0.4;
        this.filters = null;
    }
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerdown(e){

    }
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerup(e){
        $PME.child.Library2.toggle(this);
    }
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerupoutside(e){

    }
    //#endregion

};

/** enrobage d'un objet map pour editeur, contien debug et interaction */
class _PME_ObjMapDebug {

    //#region [Static]
    /**@type {string} indique si on update selon une axe presis. */
    static UpdateAxis3d = null;
    /** Creer un nouvelle gameObj avec un clone DataObj passer  */
        static create(DataObj){
            const Container = $objs.create(DataObj);
                DataObj._globalId = $objs.GLOBAL.findEmptyIndex();
                DataObj._localId  = $objs.LOCAL .findEmptyIndex();
                if(DataObj.isCase){
                    DataObj._globalCaseId = $objs.CASES_G.findEmptyIndex();
                    DataObj._localCaseId = $objs.CASES_L.findEmptyIndex();
                }
                Container.parentGroup = $displayGroup.group[1]; //todo: current group editor
            const ObjMapDebug = new _PME_ObjMapDebug(Container.DataObj);
            ObjMapDebug.addDataTracking(true);
            $stage.scene.addChild(Container);
        }
    /** simple indicateur, quand mode edit */
        static IsEditMode = false;
    /** @type {_PME_ObjMapDebug} Indic si actuelement a linterieur d'un obj*/
        static INOBJ = null; 
    /** @type {_PME_ObjMapDebug} lorsque hold click, empeche le transfer de inobj*/
        static INOBJ2 = null; 
    /** @type {_PME_ObjMapDebug} Indic si un obj est en cour de track*/
        static TRACKOBJ = null; 
        /** @type {Array.<_PME_ObjMapDebug>} - LIST des objs map */
        static POOL = [];
    //#endregion
    /**@param {_DataObj_Base} DataObj */
    constructor(DataObj) {
        this.DataObj = DataObj;
        this.Debug = {Background:null,Axi3dContainer:null,PathContainer:null};
        /** permet lorsque hover un sprite, de calculer y sur la surface */
        this._autoY = true;
        this._freezeY = 0;
        this.initialize();
    };
    //#region [GetterSetter]
    get PME() {
        return _PMEditor;
    }
    get link(){return this.DataObj.link};
    //#endregion

    //#region [Initialize]
    initialize() {
        this.initialize_background();
        this.initialize_Axis3d();
        this.initialize_pathDebug()
        //this.initialize_Mesh3d();
        this.initialize_interactions();
        //this.child = this.childrenToName()
    }
    initialize_background(){
        const C = this.link;
        const spriteRec = this.Debug.Background = this.createSpriteRec( C.getLocalBounds(),0xffffff,$app.renderer.generateTexture(C) ).setName('Background');
        spriteRec.alpha = 0.3;
        C.addChildAt(spriteRec,0);
    }
    initialize_Axis3d(){
        const C = this.link;
        const Axi3dContainer = this.Debug.Axi3dContainer = new PIXI.projection.Container3d().setName('Axi3dContainer');
        const axeX = this.Debug.Axi3dContainer.axeX = new PIXI.projection.Sprite3d( this.createSpriteLine(C.width/2,0,'x',0xda0101) ).setName('x');
            axeX.anchor.set(0,0.5);
        const axeY = this.Debug.Axi3dContainer.axeY = new PIXI.projection.Sprite3d( this.createSpriteLine(0,-C.height,'y',0x33ff52) ).setName('y');
            axeY.anchor.set(0.5,1);
        const axeZ = this.Debug.Axi3dContainer.axeZ = new PIXI.projection.Sprite3d( this.createSpriteLine(0,100,'z',0xd724ff) ).setName('z');
            axeZ.anchor.set(0.5,0);
            axeZ.euler.x = -Math.PI/2;
        Axi3dContainer.addChild(axeX,axeY,axeZ);
        Axi3dContainer.alpha = 0.3;
        C.addChild(Axi3dContainer);
    }

    initialize_pathDebug(){
        if(!this.DataObj.isCase){return};
        const C = this.link;
        const PathContainer = new PIXI.projection.Container3d().setName('PathContainer');
        C.addChild(PathContainer);
        this.Debug.PathContainer = PathContainer;
    }

    initialize_interactions() {
        const dataObj = this.DataObj;
            dataObj.p.removeAllListeners(); // remove les interaction du jeux
            dataObj.p.renderable = true; // car culling peut les avoir disable
            dataObj.p.visible = true;// car culling peut les avoir disable
        const C = this.link;
            C.interactive = true;
            C.on('pointerover'       , this.pointerover      , this);
            C.on('pointerout'        , this.pointerout       , this);
            C.on('pointerdown'       , this.pointerdown      , this);
            C.on('pointerup'         , this.pointerup        , this);
            C.on('pointerupoutside ' , this.pointerupoutside , this);
        //! debug Axe3d interaction 
        const Axi3d = this.Debug.Axi3dContainer;
        Axi3d.axeX.interactive = true;
        Axi3d.axeY.interactive = true;
        Axi3d.axeZ.interactive = true;
        Axi3d.axeX.on('pointerdown'       , this.pointerdown_Axi3d      , this);
        Axi3d.axeY.on('pointerdown'       , this.pointerdown_Axi3d      , this);
        Axi3d.axeZ.on('pointerdown'       , this.pointerdown_Axi3d      , this);

        Axi3d.axeX.on('pointerover'       , this.pointerover_Axi3d      , this);
        Axi3d.axeX.on('pointerout'        , this.pointerout_Axi3d       , this);
        Axi3d.axeY.on('pointerover'       , this.pointerover_Axi3d      , this);
        Axi3d.axeY.on('pointerout'        , this.pointerout_Axi3d       , this);
        Axi3d.axeZ.on('pointerover'       , this.pointerover_Axi3d      , this);
        Axi3d.axeZ.on('pointerout'        , this.pointerout_Axi3d       , this);
    }
    //#endregion
    //#region [Interactive]
    saveToMap(){
        const C = this.link;
        C.interactive = true;
        const DataObj = this.DataObj;
        DataObj.asignFactory( DataObj.createFactory() );
        !$objs.GLOBAL[DataObj._globalId] && $objs.addToGlobalRegister(DataObj);
        !$objs.LOCAL [DataObj._localId ] && $objs.addtoLocalRegister (DataObj);
        if(!_PME_ObjMapDebug.POOL.contains(this)){
            _PME_ObjMapDebug.POOL.push(this);
        }
    }
    restorData(){
        this.DataObj.asignFactory(); // cancel, restor to factory
        this.updateDebug();
    }
    removeToMap(){
        const C = this.link;
        C.Destroy(); // todo: remove register , verifier
        _PME_ObjMapDebug.POOL.remove(this);
        $objs.removeFromRegister(this.DataObj); //todo: verifier si des conextions sont detecter
    }
    /** temporairement event canvas pour le mode edit */
    pointerup_canvas(inspect,e){
        inspect.CLOSE();
        this.removeDataTracking();
        if(e.button === 0){ //save
            this.saveToMap();
            _PME_ObjMapDebug.create(this.DataObj.clone());
        }else
        if(e.button === 2){ //cancel
            // si etai register, restor
            if($objs.LOCAL.indexOf(this.DataObj)>-1){
                this.restorData();
                this.pointerout();
            }else{ // sinon delette
                this.removeToMap();
            }
        }
        $stage.scene.interactiveChildren = true;
        gsap.killTweenById('blinkRenderable');
        $objs.LOCAL.unique().forEach(o => { o.link.renderable = true });
     
    }
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerover(e){
        if(this.PME._pathMode && e.data.buttons === 1){
            $PME.updatePathPool(this);
        }
        _PME_ObjMapDebug.INOBJ = this;
        const Background = this.Debug.Background;
        const Axi3dContainer = this.Debug.Axi3dContainer;
        Background.renderable = true;
        Axi3dContainer.renderable = true;
        Background.visible = true;
        Axi3dContainer.visible = true;
        Background.alpha = 1;
        Axi3dContainer.alpha = 1;
        Background.filters = [this.PME.FILTERS.OUTLINE2]
    }
    pointerout(){
        _PME_ObjMapDebug.INOBJ = null;
        const Background = this.Debug.Background;
        const Axi3dContainer = this.Debug.Axi3dContainer;
        Background.renderable = $PME._debugRenderableMode;
        Axi3dContainer.renderable = $PME._debugRenderableMode;
        Background.visible = $PME._debugRenderableMode;
        Axi3dContainer.visible = $PME._debugRenderableMode;
        Background.alpha = 0.3;
        Axi3dContainer.alpha = 0.3;
        Background.filters = null;
    }
    pointerdown(e){
        if(this.PME._pathMode){
            $PME.updatePathPool(this,true);
        }
    }
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerup(e){
        // si un obj etai tracker rien faire.
        if(_PME_ObjMapDebug.IsEditMode){ return };
        if(this.PME._pathMode){
            $PME.createPath();
        }else
        if(e.isRight){
            this.addDataTracking();
        }else
        if(e.isLeft){
            this.addDataTracking(true);
        }
    }
    pointerupoutside(){
        if(this.PME._pathMode){
            $PME.createPath();
        }
    }
    pointerdown_Axi3d(e){
        if(_PME_ObjMapDebug.IsEditMode && _PME_ObjMapDebug.INOBJ){
            _PME_ObjMapDebug.UpdateAxis3d = e.currentTarget.name;
            _PME_ObjMapDebug.INOBJ2 = _PME_ObjMapDebug.INOBJ;
            $stage.scene.interactiveChildren = false;
            // blink renderable /todo: petit bug a revoir: enlever le current trackobj
            gsap.fromTo($objs.LOCAL.map(o=>o&&o.link).remove(_PME_ObjMapDebug.TRACKOBJ.DataObj.link).unique(),2,
            {renderable:true},
            {id:'blinkRenderable',renderable:false, repeat:-1, ease:SteppedEase.config(1)})
        }
    }
    pointerover_Axi3d(e){
        if(!_PME_ObjMapDebug.TRACKOBJ){ return };
        const axe = e.currentTarget;
        axe.scale3d.set(1.2)
        axe.filters = [this.PME.FILTERS.OUTLINE2];
    }
    pointerout_Axi3d(e){
        if(!_PME_ObjMapDebug.TRACKOBJ){ return };
        const axe = e.currentTarget;
        axe.scale3d.set(1)
        axe.filters = null;
    }
    //#endregion

    /** activer data Tracking update */
    addDataTracking(trackMouse){
        _PME_ObjMapDebug.IsEditMode = true;
        _PME_ObjMapDebug.TRACKOBJ = trackMouse? this : null;
        const canvas = $app.view;
        const inspect = Inspectors.DataObj(this.DataObj,!trackMouse && this); //passe le context pour buttons
        this.Ticker = PIXI.ticker.shared.add(this.update,this);
        inspect && inspect.onChange( ()=>{this.updateDebug()} );
        //TODO: QUANd hold clickL, et que glisse sur un mur ou autre . Passer on mode focus, empecher les autre interagire.
        setTimeout(() => { 
            canvas.addEventListener("pointerup"  ,this.pointerup_canvas.bind(this,inspect), { once:true });
        }, 1);
        this.link.interactive = false;
        this.link.interactiveChildren = false;
    }

    /** Remove data traking editor */
    removeDataTracking(){
        _PME_ObjMapDebug.IsEditMode = false;
        _PME_ObjMapDebug.TRACKOBJ = null;
        _PME_ObjMapDebug.INOBJ2 = null;
        _PME_ObjMapDebug.UpdateAxis3d = null;
        if(this.Ticker){
            this.Ticker = null;
            PIXI.ticker.shared.remove(this.update, this);
        }
        this.link.interactive = true;
        this.link.interactiveChildren = true;
    }

    update(){
        if(_PME_ObjMapDebug.TRACKOBJ){
            this.updateTrack();
        }
        this.updateDebug();
    }
    updateTrack(){
        const pos = $mouse.InteractionData.getLocalPosition($stage.scene.Background, new PIXI.Point(), $mouse.InteractionData.global);
        const INOBJ = _PME_ObjMapDebug.INOBJ2;
        if(INOBJ && !this.DataObj.isCase){
            if(!this.pivotCache){
                this.pivotCache = this.link.pivot3d.clone();
            }
            const target = INOBJ.link;///todo ici: ce rappeller du local.
            const local = $mouse.InteractionData.getLocalPosition(target, new PIXI.Point(), $mouse.InteractionData.global);
            const x = target.position3d.x+local.x;
            const y = target.pivot3d.y-local.y;
            const z = target.position3d.z-local.y;
            this.link.position3d.copy(target.position3d);
            switch (_PME_ObjMapDebug.UpdateAxis3d) {
                case 'x': this.link.position3d.x = x; break;
                case 'y': this.link.pivot3d.y = y; break;
                case 'z': this.link.position3d.z = z; break;
            }
        }else{
            if(this.pivotCache){
                this.link.pivot3d.copy(this.pivotCache);
                this.pivotCache = null;
            }
            this.link.position3d.set(pos.x,0,-pos.y);
        }
    }
    updateDebug(){
        const C = this.link;
        const Background = this.Debug.Background;
        const Axi3dContainer = this.Debug.Axi3dContainer;
        Background.position3d.copy(C.pivot3d);
        Axi3dContainer.position3d.copy(C.pivot3d);
        Axi3dContainer.scale3d.set(1/C.scale3d.x,1/C.scale3d.y,1/C.scale3d.z);
    }
    //#region [Method]
    /**@param {PIXI.Rectangle} rec
     * @param {number} color 
     * @param {PIXI.Texture} gostTexture 
     */
    createSpriteRec(rec,color=0xffffff,gostTexture){
        const g = new PIXI.Graphics();
            g.beginFill(color,1);
            g.lineStyle(2,0x000000,1)
            g.drawRect(0,0,rec.width,rec.height);
            g.endFill();
        const texture = $app.renderer.generateTexture(g);
        const sprite = new PIXI.projection.Sprite3d(texture);
        sprite.parentGroup = $displayGroup.DiffuseGroup
        sprite.anchor.set(0.5,1);
        if(gostTexture){
            const gostSprite = new PIXI.projection.Sprite3d(gostTexture);
            gostSprite.tint = 0x000000;
            gostSprite.anchor.set(0.5,1);
            sprite.addChild(gostSprite);
        }
        return sprite;
    }

    /**@param {string} txt
    * @param {number} color 
    */
    createSpriteLine(x,y,txt,color=0xffffff){
        const line = new PIXI.Graphics();
            line.beginFill(color,1).lineStyle(2, color, 1);
            line.moveTo(0,0).lineTo(x,y).endFill();
        const t = new PIXI.Text(txt,{fill:color});
            line.addChild(t);
            t.scale.set(0.8);
            t.position.set(x,y);
            t.anchor.set(0,y?1:0.5);
        return $app.renderer.generateTexture(line);
    }
    //#endregion
};