/** Gestion et manager du mode Path */
// @ts-ignore
class _Editor_ObjCase extends _Editor_Obj{
    //#region [Static]
    /** @type {_Editor_ObjCase} - quand tack un obj, et hover circle, ajout un track2 distance debug mesure*/
    static TRACKING2 = null;
    /** indic si en mode rec pendant pointerDown */
    static RECPATH = false;
    /** @type {Array.<_Editor_ObjCase>} - BUFFERS PATH POUR pointerUp */
    static PATHBUFFER = [];
    /** @type {Array.<_Editor_ObjCase>} */
    static POOL = [];
    static presetCase(DataObj) { // change to mode cases
        DataObj.p.euler.x = -Math.PI/2.4; //2.4 car les case son deja un peut iso
        DataObj.p.scale3d.set(0.55);
        DataObj.p.pivot3d.y = -76;
    }
    static show(){
        const option = {
            clearPath:(e)=>{},
            newCase:(e)=>{
                const DataObj = new _DataObj_Case('cases','case');
                $EDITOR.createObj(DataObj);
                this.presetCase(DataObj);
            },//todo:
            showId:true,
            showEnviroment:false,
        }
        Inspectors.Objects(option,'PathMode');
        _Editor_Obj.makeInteractive(false); // ont disable tous pour activer seulement les circles
        $EDITOR.toggle_debugMode(false);
        this.POOL.forEach(ObjCase=>{
            ObjCase.renderablePathDebug(true);
            ObjCase.toggleInteractive(false,false,true);
            ObjCase.drawPath();
        })
    }
    static hide(){
        this.RECPATH = false;
        this.PATHBUFFER = [];
        Inspectors.DESTROY('PathMode')
        _Editor_Obj.makeInteractive(true); // ont disable tous pour activer seulement les circles
        $EDITOR.toggle_debugMode(false);
        this.POOL.forEach(ObjCase=>{
            ObjCase.renderablePathDebug(false);
            ObjCase.toggleInteractive(true);
            ObjCase.drawPath();
        })
    }
    //#endregion
    /**@param {_DataObj_Case} DataObj*/
    constructor(DataObj) {
        super(DataObj);
        this.DataObj = DataObj;
        /** @type {{ 'PathContainer':PIXI.projection.Container3d, 'Circle3d':PIXI.projection.Sprite3d, 
         * 'Axi3dContainer':PIXI.projection.Container3d, 'BB':, 'CC':, 'DD':, 'EE':, 'FF':, }} */
        this.child;
        this.initialize2();
        this.POOL2.push(this);
    };
    //#region [GetterSetter]
    get TRACKING2() {
        return _Editor_ObjCase.TRACKING2;
    }
    set TRACKING2(value) {
        _Editor_ObjCase.TRACKING2 = value;
    }
    get RECPATH() {
        return _Editor_ObjCase.RECPATH
    }
    set RECPATH(value) {
         _Editor_ObjCase.RECPATH = value;
    }
    get PATHBUFFER() {
        return _Editor_ObjCase.PATHBUFFER
    }
    get POOL2() {
        return _Editor_ObjCase.POOL;
    }
    //#endregion

    //#region [Initialize]
    initialize2() {
        this.initialize_debugCase();
        this.initialize_pathDebug();
        this.initialize_interactions2();
        //this.initialize_conections();
        this.child = this.LINK.childrenToName(this.LINK.child);
    }

    initialize_debugCase(){
        const C = this.LINK;
        const DataObj = this.DataObj;
        const CaseTxt = new PIXI.projection.Container3d().setName('CaseTxt');
        const txtId = new PIXI.Text(`[${DataObj._globalCaseId}-${DataObj._localCaseId}]`);
        CaseTxt.addChild(txtId)
        C.addChild(CaseTxt);
    }

    initialize_pathDebug(){
        const C = this.LINK;
        const PathContainer = new PIXI.projection.Container3d().setName('PathContainer');
        C.addChild(PathContainer);
    }

    initialize_conections(){

    }
    initialize_interactions2() {
        const Circle3d = this.child.Circle3d;
        Circle3d.interactive = false;
        Circle3d.on('pointerover'       , this.pointerover_Circle3d    , this);
        Circle3d.on('pointerout'        , this.pointerout_Circle3d   , this);
        Circle3d.on('pointerdown'       , this.pointerdown_Circle3d    , this);
        Circle3d.on('pointerup'         , this.pointerup_Circle3d    , this);
        Circle3d.on('pointerupoutside ' , this.pointerup_Circle3d , this);
    };

/** @param {PIXI.interaction.InteractionEvent} e -*/
        

    //#endregion
    //#region [Interactive]
    pointerover_Circle3d(e){
        if(!this.EDITOR._pathMode){return};
        const Circle3d = this.child.Circle3d;
        Circle3d.scale.set(4);
        Circle3d.filters = [this.EDITOR.FILTERS.OUTLINE2];
        if(this.RECPATH && e.data.buttons===1){
            this.addToPathBuffer();
        }
        if(this.isTracking){
            this.TRACKING2 = this;
        }
    }
    pointerout_Circle3d(e){
        if(!this.EDITOR._pathMode){return};
        const Circle3d = this.child.Circle3d;
        Circle3d.scale.set(2);
        Circle3d.filters = null;
    }
    pointerdown_Circle3d(e){
        this.RECPATH = true;
        setTimeout(() => {
            $app.view.addEventListener("pointerup"  ,(e)=>{
                this.pointerup_canvas2(e);
            }, { once:true });
        }, 1);
        this.addToPathBuffer();
        this.EDITOR.showLog('rec start');

    }
    pointerup_canvas2(e){
        this.RECPATH = false;
        this.EDITOR.showLog('rec end');
        this.createPath();
        this.POOL2.forEach(ObjCase=>{
            ObjCase.drawPath();
            this.renderablePathDebug(true);
        })
    }

    //#endregion
    /** affiche ou non les path debug */
    renderablePathDebug(value){
        this.child.PathContainer.renderable = value;
        this.child.PathContainer.visible = value;
        this.LINK.alpha = 1;
        this.child.Circle3d.scale.set(value&&2||1);
    }
    createPath(){
        const buffer = this.PATHBUFFER.map(o=>o.DataObj);
        for (let i=0, l=buffer.length; i<l; i++) {
            const preview = buffer[i-1];
            const current = buffer[i  ];
            const next    = buffer[i+1];
            //TODO: FIXME: compute distance via global position for Math.hypot
            if(preview){
                //const id = preview._localCaseId;
                //current.pathConnexion[String(id)] = +this.getDistanceFrom(current.p, preview.p).d.toFixed(2);
            }
            if(next){
                const id = next._localCaseId;
                current.pathConnexion[String(id)] = +this.getDistanceFrom(next.p, current.p).d.toFixed(2);
            }
        }
        this.PATHBUFFER.splice(0, buffer.length)
    }
    drawPath(){
        this.child.PathContainer.removeChildren();
        const CASES_G = $objs.CASES_G; // parceque les localID cible les global du jeux
        const CASES_L = $objs.CASES_L; // parceque les localID cible les global du jeux
        const DataObj = this.DataObj;
        const PathContainer = this.child.PathContainer;
        const pathConnexion = Object.keys(DataObj.pathConnexion);
        pathConnexion.forEach(id => {
            const dist = this.getDistanceFrom(CASES_L[id].p) //DataObj.pathConnexion[id];
            const line = new PIXI.Graphics().lineStyle(4, 0x4286f4, 1)
            .moveTo(0,0).bezierCurveTo(0, 70, dist.d, 70, dist.d, 0).endFill();
            const lineSprite = new PIXI.projection.Sprite3d ( $app.renderer.generateTexture( line,PIXI.SCALE_MODES.LINEAR,2 ) );
                lineSprite.rotation = -dist.a;
                lineSprite.y = -80;
                PathContainer.euler.x = -0.25;
                lineSprite.euler.x = -Math.PI/2;
                lineSprite.scale3d.set(1/DataObj.p.scale3d.x);
            PathContainer.addChild(lineSprite);
            const txtDist = new PIXI.Text(`dist:${~~dist.d}`,$systems.styles[0]);
            txtDist.y = 50;
            txtDist.x = dist.d/2;
            txtDist.scale.set(1,-1);
            lineSprite.addChild(txtDist);
        });
    }

    /** draw une line entre le tracking et traking2 quand hover un circle3d
     * @param {_Editor_ObjCase} tracked - l'objet track par le mouse
     */
    //TODO: RENDU ICI, permetre quand addtomap de continuer un tracking linear, et suprimer quand right click cancel
    drawTracking2Path(tracked){ // reverse track
        tracked.child.PathContainer.removeChildren();
        const PathContainer = tracked.child.PathContainer;
        const DataObj = tracked.DataObj;
        const dist = tracked.getDistanceFrom(this.LINK)
        const line = new PIXI.Graphics().lineStyle(4, 0x4286f4, 1)
        .moveTo(0,0).bezierCurveTo(0, 70, dist.d, 70, dist.d, 0).endFill();
        const lineSprite = new PIXI.projection.Sprite3d ( $app.renderer.generateTexture( line,PIXI.SCALE_MODES.LINEAR,2 ) );
            lineSprite.rotation = -dist.a;
            lineSprite.y = -80;
            PathContainer.euler.x = -0.25;
            lineSprite.euler.x = -Math.PI/2;
            lineSprite.scale3d.set(1/DataObj.p.scale3d.x);
        PathContainer.addChild(lineSprite);
    }
    /**@returns {{d:number,a:number}} - dirtance:antan2 */
    getDistanceFrom( t2, t1=this.DataObj.p){
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


    /** add au pool path
     * @param {_PME_ObjMapDebug} ObjMapDebug
     * @param {boolean} clear
    */
   addToPathBuffer(){
        if(this.PATHBUFFER.contains(this)){
        this.PATHBUFFER.remove(this)
            this.EDITOR.showLog('removed');
            this.LINK.alpha = 1;
        }else{
            this.PATHBUFFER.push(this);
            this.EDITOR.showLog('Added')
            this.LINK.alpha = 0.4;
        }

    }
};