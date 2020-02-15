
/** enrobage d'un objet map pour editeur, contien debug et interaction */
class _Editor_Obj{
    //#region [Static]
    /**@type {_DataObj_Base}  a l'interieux d'un obj*/
    static INOBJ = null;
    /**@type {PIXI.projection.Sprite3d} - a 'interieux d'un axe3d  */
    static INAXIS = null;
    /** @type {Array.<_Editor_Obj>} Pool optimiser pour les performances acces  */
    static POOL = [];
    /** mix ou une nouvelle instance de debug 
     * @param {_DataObj_Base} DataObj
    */
    static create(DataObj){
        const Container = $objs.create(DataObj);
            Container.parentGroup = $displayGroup.group[1]; //todo: current group editor
        DataObj._globalId = $objs.GLOBAL.findEmptyIndex();
        DataObj._localId  = $objs.LOCAL .findEmptyIndex();
        if(DataObj.isCase){
            DataObj._globalCaseId = $objs.CASES_G.findEmptyIndex();
            DataObj._localCaseId = $objs.CASES_L.findEmptyIndex();
        }
        new _Editor_Obj(Container.DataObj).addTracking();
        $stage.scene.addChild(Container);
    }

    //#endregion
    /**@param {_DataObj_Base} DataObj */
    constructor(DataObj) {
        this.DataObj = DataObj;
        /** @type {{ 'Background':PIXI.projection.Sprite3d, 
         * 'Axi3dContainer':PIXI.projection.Container3d, 
         * 'axeX':PIXI.projection.Sprite3d, 'axeY':PIXI.projection.Sprite3d, 'axeZ':PIXI.projection.Sprite3d, }} */
        this.child = null;
        this.POOL.push(this);
        this.initialize();
    };
    //#region [GetterSetter]
    get EDITOR() {
        return $EDITOR;
    }
    get LINK() {
        return this.DataObj.link;
    }
    get INOBJ() {
        return _Editor_Obj.INOBJ;
    }
    set INOBJ(DataObj) {
        _Editor_Obj.INOBJ = DataObj;
    }
    get INAXIS() {
        return _Editor_Obj.INAXIS;
    }
    set INAXIS(axe) {
        _Editor_Obj.INAXIS = axe;
    }
    get POOL() {
        return _Editor_Obj.POOL;
    }
    //#endregion

    //#region [Initialize]
    initialize() {
        this.initialize_background();
        this.initialize_Axis3d();
        this.child = this.LINK.childrenToName(this.LINK.child)
        //this.initialize_pathDebug()
        ////this.initialize_Mesh3d();
        this.initialize_interactions();
        //this.child = this.childrenToName()
    }
    initialize_background(){
        const C = this.LINK;
        const spriteRec = this.createSpriteRec( C.getLocalBounds(),0xffffff,$app.renderer.generateTexture(C) ).setName('Background');
        spriteRec.alpha = 0.3;
        C.addChildAt(spriteRec,0);
    }
    initialize_Axis3d(){
        const C = this.LINK;
        const Axi3dContainer = new PIXI.projection.Container3d().setName('Axi3dContainer');
        const axeX = new PIXI.projection.Sprite3d( this.createSpriteLine(C.width/2,0,'x',0xda0101) ).setName('axeX');
            axeX.anchor.set(0,0.5);
        const axeY = new PIXI.projection.Sprite3d( this.createSpriteLine(0,-C.height,'y',0x33ff52) ).setName('axeY');
            axeY.anchor.set(0.5,1);
        const axeZ = new PIXI.projection.Sprite3d( this.createSpriteLine(0,100,'z',0xd724ff) ).setName('axeZ');
            axeZ.anchor.set(0.5,0);
            axeZ.euler.x = -Math.PI/2;
        Axi3dContainer.addChild(axeX,axeY,axeZ);
        Axi3dContainer.alpha = 0.3;
        C.addChild(Axi3dContainer);
    }

    initialize_interactions() {
        const dataObj = this.DataObj;
            dataObj.p.removeAllListeners(); // remove les interactions du jeux
            dataObj.p.renderable = true; // car culling peut les avoir disable
            dataObj.p.visible = true;// car culling peut les avoir disable
        const C = this.LINK;
            C.interactive = true;
            C.on('pointerover'       , this.pointerover      , this);
            C.on('pointerout'        , this.pointerout       , this);
            C.on('pointerdown'       , this.pointerdown      , this);
            C.on('pointerup'         , this.pointerup        , this);
            C.on('pointerupoutside ' , this.pointerupoutside , this);
        //! debug Axe3d interaction 
        const axeX = this.child.axeX;
        const axeY = this.child.axeY;
        const axeZ = this.child.axeZ;
        axeX.interactive = true;
        axeY.interactive = true;
        axeZ.interactive = true;
        axeX.on('pointerdown' , this.pointerdown_Axi3d , this);
        axeX.on('pointerover' , this.pointerover_Axi3d , this);
        axeX.on('pointerout'  , this.pointerout_Axi3d  , this);
        axeY.on('pointerdown' , this.pointerdown_Axi3d , this);
        axeY.on('pointerover' , this.pointerover_Axi3d , this);
        axeY.on('pointerout'  , this.pointerout_Axi3d  , this);
        axeZ.on('pointerdown' , this.pointerdown_Axi3d , this);
        axeZ.on('pointerover' , this.pointerover_Axi3d , this);
        axeZ.on('pointerout'  , this.pointerout_Axi3d  , this);
    }

    //#endregion
    //#region [Interactive]
    pointerup_canvas(e){
        this.clearTrack();
        if(e.button === 0){ //save
            this.saveToMap();
            _Editor_Obj.create(this.DataObj.clone())
        }else
        if(e.button === 2){ //cancel
            // si etai register, restor mode
            if($objs.LOCAL.contains(this.DataObj)){
                this.restorData();
                this.pointerout();
            }else{ // sinon delette
                this.removeToMap();
            }
        }
    }

    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerover(e){
        const Background = this.child.Background;
        const Axi3dContainer = this.child.Axi3dContainer;
        Background     .alpha = 1 ;
        Axi3dContainer .alpha = 1 ;
        Background.filters = [this.EDITOR.FILTERS.OUTLINE2]
        this.INOBJ = this.DataObj;
    }
    pointerout(e){
        const Background = this.child.Background;
        const Axi3dContainer = this.child.Axi3dContainer;
        Background     .alpha = 0.3 ;
        Axi3dContainer .alpha = 0.3 ;
        this.INOBJ = null;
        this.INAXIS = null;
        this.toggleAxis3d();
    }

    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerup(e){
        if(!gsap.getById('mouseTrack')){
            this.addTracking(e.isLeft);
        }
    }

    pointerdown_Axi3d(e){
        if( gsap.getById('mouseTrack') ){ // seulement si track un obj
            $stage.scene.interactiveChildren = false;
            // blink renderable /todo: petit bug a revoir: enlever le current trackobj
            const list = $objs.LOCAL.map( dataObj=>dataObj?.link ).remove( this.LINK ).unique();
            gsap.fromTo(list,2, {renderable:true}, {id:'blinkRenderable',renderable:false, repeat:-1, ease:SteppedEase.config(1)})
            .eventCallback('onInterrupt', ()=>{ gsap.set(list, {renderable:true}) })
        }
    }
    pointerover_Axi3d(e){
        const axe = e.currentTarget;
            axe.alpha = 4;
            axe.scale3d.set(1.2);
            axe.filters = [this.EDITOR.FILTERS.OUTLINE2];
        this.toggleAxis3d(true);
        this.INAXIS = this.INAXIS || axe;
    }
    pointerout_Axi3d(e){
        const axe = e.currentTarget;
            axe.alpha = 1;
            axe.scale3d.set(1);
            axe.filters = null;
    }
    //#endregion
    //#region [Method]
    /** activer mouse tracking */
    addTracking(allowTrack=true){
        this.INOBJ = null;
        this.INAXIS = null;
        this.LINK.interactive = false;
        this.LINK.interactiveChildren = false;
        Inspectors.DataObj(this.DataObj,this);
        gsap.getById('mouseTrack')?.kill();
        allowTrack && gsap.IntervalCallId(0, ()=>{ this.updateTrack() }, 'mouseTrack');
        setTimeout(() => {
            $app.view.addEventListener("pointerup"  ,(e)=>{
                this.pointerup_canvas(e);
            }, { once:true });
        }, 1);
    }

    updateTrack(){
        const pos = $mouse.InteractionData.getLocalPosition($stage.scene.Background, new PIXI.Point(), $mouse.InteractionData.global);
        const INOBJ = this.INOBJ?.link;
        const INAXIS = this.INAXIS;
        if(INOBJ){
            const LOCAL = $mouse.InteractionData.getLocalPosition(INOBJ, new PIXI.Point(), $mouse.InteractionData.global);
            this.pivotCache = this.pivotCache || this.LINK.pivot3d.clone();
            this.eulerCache = this.eulerCache || this.LINK.euler.clone();
            this.LINK.position3d.set(pos.x,0,INOBJ.position3d.z+1);
            this.LINK.euler.copy(INOBJ.euler);
            const x = INOBJ.position3d.x+(LOCAL.x*2);
            const y = INOBJ.pivot3d.y-(LOCAL.y*2);
            const z = INOBJ.position3d.z-(LOCAL.y*2);
            this.LINK.position3d.copy(INOBJ.position3d);
            switch (INAXIS?.name) {
                case 'axeX': this.LINK.position3d.x = x; break;
                case 'axeY': this.LINK.pivot3d.y = y; break;
                case 'axeZ': this.LINK.position3d.z = z; break;
                default: this.LINK.position3d.set(pos.x,0,-pos.y); break; 
            }
        }else{
            this.LINK.position3d.set(pos.x,0,-pos.y);
            this.pivotCache && this.LINK.pivot3d.copy(this.pivotCache);
            this.eulerCache && this.LINK.euler.copy(this.eulerCache);
            this.pivotCache = null;
            this.eulerCache = null;
        }
    }

    /** cache les axis non focuser pour permetre a INAXIS detre efficase */
    toggleAxis3d(value){
        for (let i=0, POOL=this.POOL, l=POOL.length; i<l; i++) {
            const obj = POOL[i];
            if(obj === this){ continue };
            obj.child.Axi3dContainer.alpha = value && 0.1 || 1;
            obj.child.Axi3dContainer.interactiveChildren = !value;
            obj.LINK.interactive = !value;
        }
    }

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
            line.beginFill(color,1).lineStyle(4, color, 1);
            line.moveTo(0,0).lineTo(x,y).endFill();
        const t = new PIXI.Text(txt,{fontSize:12, fill:color, strokeThickness: 2 });
            line.addChild(t);
            t.position.set(x,y);
            t.anchor.set(0.5);
        return $app.renderer.generateTexture(line);
    }
    //#endregion

    saveToMap(){
        this.INOBJ = null;
        this.INAXIS = null;
        const LINK = this.LINK;
        const DataObj = this.DataObj;
            LINK.interactive = true;
            LINK.interactiveChildren = true;
        DataObj.asignFactory( DataObj.createFactory() );
        !$objs.GLOBAL[DataObj._globalId] && $objs.addToGlobalRegister(DataObj);
        !$objs.LOCAL [DataObj._localId ] && $objs.addtoLocalRegister (DataObj);
    }
    removeToMap(){//todo: verifier si des conextions path sont detecter, ou des events game
        const LINK = this.LINK;
        $objs.removeFromRegister(this.DataObj); 
        this.POOL.remove(this);
        LINK.Destroy(); // todo: remove register , verifier
    }

    /** cancel track */
    restorData(){
        this.DataObj.asignFactory(); // cancel, restor to factory
        //this.updateDebug();
    }
    /** clear les events et track props (anti Bug)*/
    clearTrack(){
        $stage.scene.interactiveChildren = true;
        gsap.getById('blinkRenderable')?.kill();
        gsap.getById('mouseTrack')?.kill();
        this.INOBJ = null;
        this.INAXIS = null;
        this.LINK.interactive = true;
        this.LINK.interactiveChildren = true;
        Inspectors.DESTROY(this.DataObj.constructorId);
    }
};