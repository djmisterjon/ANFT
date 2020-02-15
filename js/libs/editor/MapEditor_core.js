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
            OUTLINE1:new PIXI.filters.OutlineFilter(20,0xef2ac4),
            OUTLINE2:new PIXI.filters.OutlineFilter(2,0xc9c9c9),
            ALPHA: new PIXI.filters.AlphaFilter(0.3)
        }
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
        this.initialize_interactions();
        $stage.addChild(this);
    }

    /** Tous ce qui nessesite la preparation */
    initialize_prepare(){
        $camera._inteliCam = false;
        PIXI.utils.clearTextureCache();
        $stage.scene.interactiveChildren = true;
        $gui.setRendering(false);
        //disable events
        $camera._culling = false;
        $objs.LOCAL.forEach(dataObj=>{ //todo: metre dans scene
            new _Editor_Obj(dataObj);
        })
    }

    loader_GUI(){
        return new Promise((resolve, reject) => {
            const loader = new PIXI.loaders.Loader();
            loader.add("gui", "_EDITOR/pixiMapEditor1.json").load()
            .onComplete.add((l,res) => {
                const SpineEditor = new PIXI.spine.Spine(res.gui.spineData).setName('SpineEditor');
                SpineEditor.stateData.defaultMix = 0.1;
                SpineEditor.state.setAnimation(0, 'idle', true);
                SpineEditor.state.setAnimation(1, 'start0', false);
                this.addChild(SpineEditor);
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
    //#endregion
    
    //#region [Interactive]
    initialize_interactions() {
        document.addEventListener('wheel', (e) => { // zoom
            const hitTest = $mouse.interaction.hitTest($mouse.p.position);
            if(hitTest?._events?.scrollwheel){
                hitTest.emit('scrollwheel',e,hitTest)
            }
        });
        //!mouse
        const canvas = $app.view;
        //canvas.addEventListener("mouseup"  , (e)=>{ this.mouseup_canvas(e) });
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
        this.child.SpineEditor.skeleton.slots.filter(slot => {
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
        })
    }
    //#endregion

}


