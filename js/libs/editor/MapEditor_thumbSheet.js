
/** les Base SpriteSheets de la libs1 */
class _Editor_ThumbSheet extends PIXI.Container{
    //#region [Static]
    static ICOSIZE = 30;
    static MAXWIDTH = 134;
    static MAXHEIGHT = 96;
    //#endregion
    /**
     * @param {string} dataBaseName
     */
    constructor(dataBaseName,Library1) {
        super();
        this.Library1 = Library1;
        this._dataBaseName = dataBaseName;
        this.child = null;
        this.timeOut = null;
        this.initialize();
    };
    //#region [GetterSetter]
    get EDITOR() {
        return $EDITOR;
    }
    get ICOSIZE() {
        return _Editor_ThumbSheet.ICOSIZE;
    }
    get MAXWIDTH() {
        return _Editor_ThumbSheet.MAXWIDTH;
    }
    get MAXHEIGHT() {
        return _Editor_ThumbSheet.MAXHEIGHT;
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
            Spritesheet_D.scale.set( $app.getRatio(Spritesheet_D, this.MAXWIDTH, this.MAXHEIGHT) );
        //#Icons
        let icons = [];
        let y = 0;
        let w = Spritesheet_D.width;
        ['isSpriteSheets','isSpineSheets','_normal','isAnimationSheets','isMultiPacks'].forEach(testKey => {
            if(dataBase[testKey]){
                const ico = new PIXI.Sprite(this.EDITOR.ICONS[testKey]);
                ico.position.set(w,y);
                icons.push(ico);
                y+=this.ICOSIZE+2;
            }
        });
        //#Background
        const Background = new PIXI.Sprite(PIXI.Texture.WHITE).setName('Background');
        Background.alpha = 0.4;
        Background.width = Spritesheet_D.width+this.ICOSIZE;
        Background.height = Math.max(Spritesheet_D.height,y+this.ICOSIZE);
        //! end
        this.addChild(Background, this.createRenderThumb(Spritesheet_D,icons));
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
        Background.on ('scrollwheel'      , this.Library1.scrollwheel, this.Library1) ;
    }
    //#endregion

    //#region [Interactive]
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerover(e){
        const Background = this.child.Background;
        Background.alpha = 1;
        this.filters = [this.EDITOR.FILTERS.OUTLINE1];
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
       this.EDITOR.child.Library2.toggle(this);
    }
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerupoutside(e){

    }
    //#endregion


    /**
     * @param {PIXI.Sprite} Spritesheet_D
     * @param {Array.<PIXI.Sprite>} icons
     * @returns {PIXI.Sprite}
     */
    createRenderThumb(Spritesheet_D,icons){
        const c = new PIXI.Container();
        c.addChild(Spritesheet_D,...icons);
        const t = $app.renderer.generateTexture(c);
        const sprite = new PIXI.Sprite(t)
        return sprite;
    }

};