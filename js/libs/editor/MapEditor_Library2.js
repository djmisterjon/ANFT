
class _Editor_Library2 extends PIXI.Container {
    static MAXWIDTH = 630;
    static MAXHEIGTH = 850;
    constructor() {
        super();
        /**@type {_Editor_ThumbSheet} - Le sheets actuelement visible ou en cache */
        this.currentSheet = null;
        /** @type {{ 'ContainerLibs':PIXI.Container, 'bg':PIXI.Sprite, 'CC':, 'DD':, 'EE':, 'FF':, }} */
        this.child = null;
        /** zoom lib */
        this._zoom = 1;
        this.initialize();
    }

    //#region [GetterSetter]
    get EDITOR() {
        return $EDITOR;
    }
    get SpineEditor() {
        return this.EDITOR.child?.SpineEditor;
    }
    
    get MAXWIDTH() {
        return _Editor_Library2.MAXWIDTH
    }
    get MAXHEIGTH() {
        return _Editor_Library2.MAXHEIGTH
    }
    //#endregion

    //#region [Initialize]
    initialize() {
        this.initialize_base()
        this.child = this.childrenToName()
        this.initialize_interactions()
        this.position.set(1275,55);
        this.hide();
    }
        
    initialize_base() {
        const ContainerLibs = new PIXI.Container().setName('ContainerLibs');
        const bg = new PIXI.Sprite(PIXI.Texture.WHITE).setName('bg');
            bg.alpha = 0.2;
            bg.anchor.set(1,0);
            bg.position.x = this.MAXWIDTH+12;
            bg.width = this.MAXWIDTH+10;
            bg.height = this.MAXHEIGTH;
        const mask = new PIXI.Sprite(PIXI.Texture.WHITE).setName('Mask');
            //mask.alpha = 0.2;
            mask.anchor.set(1,0);
            mask.position.x = this.MAXWIDTH+12;
            mask.width = this.MAXWIDTH+10;
            mask.height = this.MAXHEIGTH;
            ContainerLibs.mask = mask;
        //!end
        this.addChild(mask,bg,ContainerLibs);
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
        master.filters = [this.EDITOR.FILTERS.OUTLINE1];
    }
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerout_tile(e){
        const master = e.currentTarget;
        gsap.to(master, 0.6,{alpha:1})
        master.filters = null;
    }
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerdown_tile(e){
        //gsap.to({},0.1,{id:'editorScrollMode'}).eventCallback('onComplete', ()=>{ this._scroll = true } )
        /*gsap.to({},0.1,{id:'editorScrollMode', delay:1, repeat:-1 }).eventCallback('onUpdate', ()=>{
            this._scrollMode = true;
            const ContainerLibs = this.child.ContainerLibs;
            const e = $app.renderer.plugins.interaction.mouse.originalEvent
            ContainerLibs.x += e.movementX;
         } )*/
       //gsap.TimeoutCallId(1, (e)=>{
       //    console.log('e: ', e);
       //    console.log(this);
       //}, 'daa')
        gsap.IntervalCallId(0.15, this.scrollLib, 'editorScrollMode',this);
    }

    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerup_tile(e){
        const ani = gsap.getById('editorScrollMode');
        ani?.isActive() && this.fitScroll();
        ani?.kill();
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
    /**@param {this} context */
    scrollLib(context){
        const ContainerLibs = context.child.ContainerLibs;
        const bg = context.child.bg;
        ContainerLibs.mask.width = 1920;
        bg.width = 1920;

        const originalEvent = $app.renderer.plugins.interaction.mouse.originalEvent
        const didMove = $app.renderer.plugins.interaction.didMove;
        ContainerLibs.x += didMove && ~~originalEvent.movementX*1.1 || 0;
    }
    fitScroll(){
        const ContainerLibs = this.child.ContainerLibs;
        const bg = this.child.bg;
        bg.width = this.MAXWIDTH+10;
        ContainerLibs.mask.width = this.MAXWIDTH+10;
        clearInterval(this._interval);
        this._scroll = false;
        this.child.ContainerLibs.interactiveChildren = true;
        if(ContainerLibs.width+ContainerLibs.x<210){
            gsap.to(ContainerLibs, 0.2, {x:ContainerLibs.x-(ContainerLibs.width+ContainerLibs.x)+210})
        }else
        if(ContainerLibs.x+210>this.MAXWIDTH){
            gsap.to(ContainerLibs, 0.2, {x:this.MAXWIDTH-210})
        }
           
    }
    /**@param {_Editor_ThumbSheet} Sheet toggle show hide */
    toggle(Sheet){
        if(this.currentSheet === Sheet){
            this.renderable ? this.hide() : this.show(Sheet);
        }else{
            this.show(Sheet);
        }
    }
    /**@param {_Editor_ThumbSheet} Sheet*/
    show(Sheet){
        this.SpineEditor?.state.setAnimation(2, 'showEditor_tiles', false);
        this.renderable = true;
        this.visible = true;
        if(this.currentSheet !== Sheet){
            this.currentSheet = Sheet;
            this.clear();
            this.createTiles();
        }
    }
    /**@param {_Editor_ThumbSheet} [Sheet]*/
    hide(Sheet){
        this.SpineEditor?.state.setAnimation(2, 'hideEditor_tiles', false);
        this.renderable = false;
        this.visible = false;
    }

    /** clear les tilesheet */
    clear(){
        this.child.ContainerLibs.removeChildren();
    }

    /** creer les tile pour libs2*/
    createTiles(){
        const dataBase = this.currentSheet.dataBase;
        let Objs = [];
        const textures = dataBase.data.animations? Object.keys(dataBase.data.animations):
        dataBase.data.isSpineSheets? dataBase.data.skins.map(s=>s.name) : Object.keys(dataBase.textures);
        textures.forEach((textureName,i) => {
            const tile = new _Editor_TileSheet(dataBase,textureName);
            this.child.ContainerLibs.addChild(tile)
        });
        this.sort();
    }
    /** sort positioning ContainerLibs tiles */
    sort(){
        const MAXHEIGTH = this.MAXHEIGTH/this._zoom;
        const list = this.child.ContainerLibs.children;
        const ratio4 = Math.ceil(4*((MAXHEIGTH-180)/this.MAXHEIGTH))
        for (let i=0,lineY=0,x=0,y=0, l=list.length; i<l; i++) {
            const c = list[i];
            gsap.to(c.position, 0.4, {x:x,y:y, ease:Elastic.easeOut.config(1, 0.3+Math.random()) });
            if((lineY+1)%ratio4){
                y+=210+6;
            }else{
                y = 0;
                x+=210+6;
            }
            lineY++;
        };
    }
    //#endregion
}