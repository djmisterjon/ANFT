/*:
// PLUGIN □────────────────────────────────□PIXI MAP EDITOR□─────────────────────────────────────────┐
* @author □ Jonathan Lepage (dimisterjon),(jonforum) 
* @plugindesc EDITOR GUI for create map with object sprine JSON (texture packer, spine)
* V.3.0
* License:© M.I.T
└────────────────────────────────────────────────────────────────────────────────────────────────────┘
*/
/**@type {_Editor}*/
let $EDITOR;
document.addEventListener('keydown', (e)=>{
    if(!$EDITOR && e.key=== "F1"){
        console.log0('__________________initializeEditor:__________________ ');
        $EDITOR = new _Editor();
    };
});

class _Editor extends PIXI.Container{
    //#region [Static]
    //#endregion
    constructor() {
        super();
        /** @type {Object.<string, PIXI.Texture>} */
        this.ICONS = {};
        this.FILTERS = {
            OUTLINE1: new PIXI.filters.OutlineFilter (20 ,0xef2ac4),
            OUTLINE2: new PIXI.filters.OutlineFilter (2  ,0xc9c9c9),
            ALPHA   : new PIXI.filters.AlphaFilter   (0.3         ),
            BLUR    : new PIXI.filters.BlurFilter    (10 , 3      ),
        }
        /**@type {PIXI.projection.Sprite3d} - grids mode */
        this.GRIDS = null;
        /** les grid colors */
        this._gridColorId = 0;
        /** stock les tween log */
        this.TWEENSLOG = [];
        /** Le mode de debugage */
        this._debugRenderableMode = true;
        /** En mode path pour les cases */
        this._pathMode = false;
        /** @type {{ 'SpineEditor':PIXI.spine.Spine, 
         * 'Library1':_Editor_Library1, 'Library2':_Editor_Library2, 'EE':, 'FF':, }} */
        this.child = null;
        this.loader_GUI().then(()=>{
            this.loader_Libs().then(()=>{
                this.loader_Icons().then(()=>{
                    this.initialize();
                })
            })
        });
    }

    //#region [GetterSetter]
    //#endregion

    //#region [Initialize]
    initialize() {
        this.initialize_prepare();
        this.initialize_base();
        this.child = this.childrenToName();
        this.parentGroup = $displayGroup.group[5];
        this.initialize_listeners();
        this.initialize_interactions();
        $stage.addChild(this);
    }

    /** Tous ce qui nessesite la preparation */
    initialize_prepare(){
        //! clear les STATIC, utile si change de scene
        _Editor_Obj.POOL = [];
        _Editor_Obj.INOBJ = null;
        _Editor_Obj.INAXIS = null;
        _Editor_ObjCase.POOL = [];
        _Editor_ObjCase.TRACKING2 = null;
        _Editor_ObjCase.PATHBUFFER = [];
        $camera._inteliCam = false;
        PIXI.utils.clearTextureCache();
        $stage.scene.interactiveChildren = true;
        $gui.setRendering(false);
        //disable events
        $camera._culling = false;
        $objs.LOCAL.forEach(dataObj=>{ //todo: metre dans scene
            if(dataObj.isCase){
                new _Editor_ObjCase(dataObj);

            }else{
                new _Editor_Obj(dataObj);
            }
        })
    }

    loader_GUI(){
        return new Promise((resolve, reject) => {
            const loader = new PIXI.loaders.Loader();
            loader.add("gui", "_EDITOR/pixiMapEditor2.json").load()
            .onComplete.add((l,res) => {
                const SpineEditor = new PIXI.spine.Spine(res.gui.spineData).setName('SpineEditor');
                const barSprite = SpineEditor.skeleton.findSlot('tilsheetT').currentSprite;
                const txt = new PIXI.Text('',{ fill: "white", fontFamily: "Tahoma", fontSize: 22 });
                txt.position.set(-300,-15);
                barSprite.addChild(txt);
                SpineEditor.stateData.defaultMix = 0.1;
                SpineEditor.state.setAnimation(0, 'show', false);
                SpineEditor.state.setAnimation(1, 'hide2', false);
                this.addChild(SpineEditor);
                this.showLog('Editor loaded');
                resolve();
            })
        })
    }

    loader_Libs(){
        return new Promise((resolve, reject) => {
            $loader.loadScene('Scene_Boot'); //todo:
            const check = setInterval(() => {
                if(!$loader._isLoading){
                    clearInterval(check);
                    this.showLog('Library loaded');
                    resolve();
                };
            }, 80);
        })
    }

    loader_Icons(){
        return new Promise((resolve, reject) => {
            const loader = new PIXI.loaders.Loader();
            ['isSpriteSheets','isSpineSheets','_normal','isAnimationSheets','isMultiPacks']
            .forEach(iconKey => { loader.add(iconKey,`_EDITOR/images/${iconKey}.png`) });
            loader.load().onProgress.add((l,res) => {
                this.ICONS[res.name] = res.texture;
            })
            loader.onComplete.add(() => { resolve(); });
        })
    }
    initialize_base() {
        const Library1 = new _Editor_Library1().setName('Library1');
        const Library2 = new _Editor_Library2().setName('Library2');
       ////!end
        this.addChild(Library1,Library2);
        //Master.addChild(this.PME.GUI, Library1,Library2);
    }
    initialize_listeners() {
        const canvas = $app.view;
        //! keys
        document.addEventListener('keyup', (e) => {
            this._keycode = e.code;
            if(this._keycode === 'Delete'){
                _Editor_Obj.INOBJ.removeToMap();
            }
        });
        //!scroll zoom
        document.addEventListener('wheel', (e) => {
            const hitTest = $mouse.interaction.hitTest($mouse.p.position);
            if(hitTest?._events?.scrollwheel){
                hitTest.emit('scrollwheel',e,hitTest)
            }
            if (e.path.contains($app.renderer.view)) {
                const hitTest = $mouse.interaction.hitTest($mouse.p.position);
                let allow = !hitTest || hitTest.parent instanceof _Scene_Base;
                allow && $camera.onMouseWheel.call($camera,e);
            }
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
        })
    }

    initialize_interactions() {
        this.child.SpineEditor.skeleton.slots.filter(slot => {
            return slot.data.name.contains("icon_") || slot.data.name.contains("gb");
        }).forEach(slot => {
            slot.currentSprite.interactive = true;
            slot.currentSprite.on('pointerover' , this.pointerover_button , this);
            slot.currentSprite.on('pointerout'  , this.pointerout_button  , this);
            slot.currentSprite.on('pointerup'   , this.pointerup_button   , this);
            slot.currentSprite.slot = slot; // ref the slot in sprite for events
        })
    }
    //#endregion
    
    //#region [Interactive]
    pointerover_button(e){
        const button = e.currentTarget;
        //button.slot.color.a = 1;
        button.filters = [this.FILTERS.OUTLINE2];
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
        this.executeButton(button.slot,e);
    }
    //#endregion

    //#region [Method]
    executeButton(slot,e){
        const name = slot.currentSpriteName;
        switch (name) {
            //case "icon_darkMode"        : this.toggle_thumbsLibs        (slot) ; break;
            case "icon_light"       : this.toggle_pointLight      (e     ) ; break;
            case "icon_spotLight"       : this.toggle_spotLight      (e     ) ; break;
            case "icon_masterLight"     : this.toggle_sceneLight     (e     ) ; break;
            case "icon_Save"            : this.create_Inspector_save (e     ) ; break;
            case "icon_showHideSprites" : this.toggle_debugMode      (      ) ; break;
            case "icon_grid"            : this.create_MapGrids       (e     ) ; break;
            case "icon_pathMaker"       : this.toggle_drawPathMode   (e,slot) ; break;
            case "icon_camera"          : this.toggle_CameraMode     (e     ) ; break;
            case "icon_setup"           : this.toggle_EditorSetup    (e     ) ; break;
        };
    }
    toggle_pointLight(e){// TODO: PLUTOT UN MODE LIGHT, similair au cases
       
    }
    toggle_spotLight(e){
        const spotLight = new PIXI.lights.DirectionalLight(0xffffff,1,$stage.scene);
        $stage.addChild(spotLight);
        Inspectors.Light(spotLight);
    }

    /** inspecteur scene light */
    toggle_sceneLight(){
        Inspectors.Light($stage.child.AmbientLight);
    }

    toggle_debugMode(value = !this._debugRenderableMode){
        this._debugRenderableMode = value;
        _Editor_Obj.POOL.forEach(Editor_Obj=>{
            Editor_Obj.child.Axi3dContainer.renderable = value;
            Editor_Obj.child.Background    .renderable = value;
            Editor_Obj.child.Axi3dContainer.visible    = value;
            Editor_Obj.child.Background    .visible    = value;
        })
        this.showLog(`DEBUG RENDERABLE: ${this._debugRenderableMode}`);
    }
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    create_MapGrids(e){
        this.showLog(`GRIDS MODE: ${!this.GRIDS}`);
        if(this.GRIDS){
            $stage.scene.Background.removeChild(this.GRIDS);
            this.GRIDS.destroy(true);
            return this.GRIDS = null;
        }
        const COLORS = [0xffffff,0x000000,0xff0000,0x0000ff,0xffd800,0xcb42f4];
        if(e.isRight){
            this._gridColorId++;
            this._gridColorId = this._gridColorId>COLORS.length? 0 : this._gridColorId;
            this.showLog('GRIDS COLORS ++');
        }
        const color = COLORS[this._gridColorId];
        const gridSize = 48;
        const [w,h] = [$camera._sceneW, $camera._sceneH];
        const grids = new PIXI.Graphics();
        grids.lineStyle(2, color, 1);
        // Vertical line
        for (let i=0, l=w/gridSize; i<l; i++) {
            grids.lineStyle(2, color, 1).moveTo(i*gridSize,0).lineTo(i*gridSize, h)
        };
        for (let i=0, l=h/gridSize; i<l; i++) {
            grids.moveTo(0,i*gridSize).lineTo(w, i*gridSize)
        };
        // draw center
        grids.lineStyle(4, 0xee82ff, 1).moveTo(w/2,0).lineTo(w/2, h).moveTo(0,h/2).lineTo(w, h/2);
        grids.endFill();
        const sprite1 = new PIXI.projection.Sprite3d( $app.renderer.generateTexture(grids) );
        sprite1.alpha = 0.4;
        sprite1.anchor.set(0.5);
        sprite1.parentGroup = PIXI.lights.diffuseGroup;
        this.GRIDS = $stage.scene.Background.addChild(sprite1);
    }

    /** affiche des log */
    showLog(message='unckow message log'){
        const txt = new PIXI.Text(message,{fill:'#ffffff'});
        const index = this.TWEENSLOG.findEmptyIndex()
        this.TWEENSLOG[index] = txt;
        const y = 40+(40*index);
        gsap.timeline()
        .fromTo(txt, 1,{x:-txt.width,y:y},{ x:5,y:y})
        .to(txt, 1,{alpha:0, ease:Power1.easeIn} )
        .add(()=>{
            $stage.removeChild(txt);
            this.TWEENSLOG[index] = void 0;
            txt.destroy();
        },'+=0.1')
        $stage.addChild(txt);
    }
    toggle_EditorSetup(){
        const NAME = `EDITOR OPTIONS`;
        if(Inspectors.GUI[NAME]){return};
        const option = {
            clearBackground:(e)=>{
                if(confirm('clearBackground') ){
    
                }
            },
            clearObjs:(e)=>{
                if(confirm('clearObjs') ){
                    $objs.GLOBAL.delete(...$objs.LOCAL)
                    $objs.CASES_G.delete(...$objs.LOCAL)
                    $objs.LOCAL = [];
                    $objs.CASES_L = [];
                }
            },
            
            scenes:{ select: Object.fromEntries($loader.scenesKits.flat().map(k=>[k,k])) },
        }
        Inspectors.Objects(option,NAME).onChange((target,propretyName,value)=>{
            console.log('target,propretyName,value: ', target,propretyName,value);
            if(propretyName==='scenes'){
                $stage.interactiveChildren = false;
                const nextScene = $stage.goto(value); // promise pour refresh editor
                const check = setInterval(() => {
                    if(!$stage._nextScene && $stage.scene.isSceneMap && $stage.scene._started){
                        clearInterval(check);
                        this.initialize_prepare();
                        $stage.interactiveChildren = true;
                    }
                }, 80)
            }
        });
    }

    /** @param {PIXI.interaction.InteractionEvent} e -*/
    toggle_drawPathMode(e,slot){
        // affiche et setup pathmode ou close
        if(this._pathMode = !this._pathMode){
            _Editor_ObjCase.show();
            this.hide();
            this.child.Library2.hide();
            gsap.to(slot.currentSprite.pivot, 0.5,{x:-60})
        }else{
            _Editor_ObjCase.hide();
            gsap.to(slot.currentSprite.pivot, 0.5,{x:0})
            this.show();
            this.child.Library2.toggle();
        }
    }

    toggle_CameraMode(e){
        Debug.CameraInspector();
    }

    hide(){
        if(this.child.Library1.renderable){
            this.child.SpineEditor.state.setAnimation(0, 'hide', false);
            this.child.Library1.renderable = false;
            this.child.Library1.visible = false;
        }
    }
    show(){
        if(!this.child.Library1.renderable && !this._pathMode){
            this.child.SpineEditor.state.setAnimation(0, 'show', false);
            this.child.Library1.renderable = true;
            this.child.Library1.visible = true;
        }
    }

    createObj(DataObj){
        const Container = $objs.create(DataObj);
            Container.parentGroup = $displayGroup.group[1]; //todo: current group editor
        DataObj._globalId = $objs.GLOBAL.findEmptyIndex();
        DataObj._localId  = $objs.LOCAL .findEmptyIndex();
        if(DataObj.isCase){
            DataObj.pathConnexion = {};// on reset les path connections, car le clone les a copier
            DataObj._globalCaseId = $objs.CASES_G.findEmptyIndex();
            DataObj._localCaseId = $objs.CASES_L.findEmptyIndex();
            new _Editor_ObjCase(Container.DataObj).addTracking()
        }else{
            new _Editor_Obj(Container.DataObj).addTracking();
        }
        $stage.scene.addChild(Container);
        this.showLog('Tile CREATED');
    }
    //#endregion


    /** creer les dat.gui permanent  */
    create_Inspector_save(e){
        const NAME = `SAVEJSON`;
        if(Inspectors.GUI[NAME]){return};
        const gui = new Inspectors(NAME).x(500);
        const mu = process.memoryUsage();
        const LOCAL = $objs.LOCAL;
        function formatBytes(bytes, decimals = 2) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        }
        const options = {
            isSpriteSheets    :LOCAL.filter(dataObj=>dataObj?.dataBase.isSpriteSheets   ).length,
            isSpineSheets     :LOCAL.filter(dataObj=>dataObj?.dataBase.isSpineSheets    ).length,
            isAnimationSheets :LOCAL.filter(dataObj=>dataObj?.dataBase.isAnimationSheets).length,
            isCases :$objs.CASES_L.length,
            mem:{
                external :formatBytes(mu.external ),
                heapTotal:formatBytes(mu.heapTotal),
                heapUsed :formatBytes(mu.heapUsed ),
                rss      :formatBytes(mu.rss      ),
            },
            options: {
                rebootWithThisScene  :false,
                checkHash32Integrity :false,
                exportPhotoshopLayers:false,
            }
        };
        const f1 = gui.addFolder('MEMORY').disable();
            f1.add(options, 'mem', ['external','heapTotal','heapUsed','rss'] );
        const f2 = gui.addFolder('ELEMENTS').disable();
            f2.add(options, 'isSpriteSheets'    )//.name('TOTAL.SpriteSheets'    );
            f2.add(options, 'isSpineSheets'     )//.name('TOTAL.SpineSheets'     );
            f2.add(options, 'isAnimationSheets' )//.name('TOTAL.AnimationSheets' );
            f2.add(options, 'isCases' )//.name('TOTAL.AnimationSheets' );
        const f3 = gui.addFolder('OPTIONS');
            f3.add(options.options, 'rebootWithThisScene'  )
            f3.add(options.options, 'checkHash32Integrity' )
            f3.add(options.options, 'exportPhotoshopLayers')
        gui.addButton('SAVE',(e)=>{
            Inspectors.DESTROY(NAME);
            this.save(options)
        },'btn-success');
        gui.addButton('CANCEL',(e)=>{ 

        },'btn-danger');
        gui.addButton('CLEAR',(e)=>{ 
            confirm("ARE YOU SURE TO CLEAR SCENES AND ALL EVENTS") && this.clearScene();
        },'btn-warning');
        gui.addButton('LOAD',(e)=>{ 

        },'btn-light');
        
    }

    /** Editor Save de la map */
    save(options) {
        this.hide();
        const BLUR = this.FILTERS.BLUR;
        $displayGroup._layer_diffuseGroup.filters = [BLUR];
        TweenLite.fromTo(BLUR, 0.5, { blur:0},{ blur:11, ease: Power2.easeOut })
        .eventCallback("onComplete", ()=>{$displayGroup._layer_diffuseGroup.filters = null})
            $stage.interactiveChildren = false; // disable stage interactive
        this.create_JSON(options).then(() => {
            $stage.interactiveChildren = true; // disable stage interactive
            this.showLog('MAP SAVED')
        }).catch(e=>console.error(e));
    }

    /** creer un gameMap json */
    create_JSON(options) {
        return new Promise((resolve, reject) => {
            const _lights      = {ambientLight:false,DirectionalLight:false,PointLight:false}
            const _objs        = $objs.LOCAL.filter(dataObj=>dataObj).map(dataObj=>dataObj.factory);
            const _background  = $stage.scene.Background.name || ""; // factory dataValues//FIXME: just le nom
            const _sheets      = $objs.LOCAL.map(dataObj=>dataObj?._dataBaseName).remove().unique() ; // Set: remove les duplicata
            const META = {date:date.format(new Date(), 'DD MMMM YYYY HH:mm:ss A dddd')};
            ///const SYSTEM = {memoryUsage:dataValues.memoryUsage,timeElasped:PIXI.ticker.shared.lastTime / 1000, data: new Date().toDateString()};
            const json = { META, _lights , _background, _sheets, _objs, };
            const fs = eval("require('fs')");
            function writeFile(path,content){
                JSON.parse(content);
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
}


