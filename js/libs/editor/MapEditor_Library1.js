
/** La library afficher */

class _Editor_Library1 extends PIXI.Container {
    static MAXWIDTH = 1800;
    static MAXHEIGHT = 96;
    constructor() {
        super();
        this._totalLine = 1;
        this._currentLine = 0;
        /** @type {{ 'ThumbSheet':Array.<_Editor_ThumbSheet>, 'BB':, 'CC':, 'DD':, 'EE':, 'FF':, }} */
        this.child = null;
        this.initialize();
    };
    //#region [GetterSetter]
    get DATA2() {
        return $loader.DATA2;
    }
    get MAXWIDTH() {
        return _Editor_Library1.MAXWIDTH
    }
    get MAXHEIGHT() {
        return _Editor_Library1.MAXHEIGHT
    }
    //#endregion

    //#region [Initialize]
    initialize() {
        this.initialize_base();
        this.initialize_interactions();
        this.position.set(90,950);
    }
        
    initialize_base() {
        const Master = new PIXI.Container().setName('Master');
        const bg = new PIXI.Sprite(PIXI.Texture.WHITE).setName('bg');
            bg.alpha = 0.1;
            bg.width = this.MAXWIDTH;
            bg.height = 0;
        //#mask
        const mask = new PIXI.Sprite(PIXI.Texture.WHITE).setName('mask');
            mask.width = this.MAXWIDTH+10;
            mask.height = this.MAXHEIGHT+10;
            Master.mask = mask;
        //# les spriteSheets icon
        let sheets = [];
        Object.keys(this.DATA2).forEach(dataBaseName => {
            const ThumbSheet = new _Editor_ThumbSheet(dataBaseName,this).setName('ThumbSheet');
            sheets.push(ThumbSheet);
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
        mask.on('scrollwheel'        , this.scrollwheel    , this);
    }
    //#endregion

    //#region [Interactive]
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerdown_bg(e){
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
        const y = this._currentLine* this.MAXHEIGHT;
        const Master = this.child.Master;
        gsap.to(Master.pivot, 0.3,{y:y, ease:Back.easeOut.config(1) })
    }
    //#endregion

    sort(){
        const list = this.child.ThumbSheet;
        let line = 0;
        for (let i=0,x=0,y=0, l=list.length; i<l; i++) {
            const Sheet = list[i];
            if(x+Sheet.width+10>this.MAXWIDTH){
                x=0;
                y+=this.MAXHEIGHT+2;
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
