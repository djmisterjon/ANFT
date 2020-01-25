/**
    * @typedef {Object} DataString_QUESTS Regroup les quests motionsTxt part tag excel
    * @property {_motionsTxt} DataString_QUESTS.title - title
    * @property {_motionsTxt} DataString_QUESTS.title2 - BIG TITLE
    * @property {_motionsTxt} DataString_QUESTS.titleDesc - descriptions
    * @property {Array.<_motionsTxt>} DataString_QUESTS.quest - subDescriptions d'une quest
*/ 
/**
    * @typedef {Object} DataString_ITEMS Regroup les items motionsTxt par tag excel
    * @property {_motionsTxt} DataString_ITEMS.title - title
    * @property {_motionsTxt} DataString_ITEMS.desc - descriptions
    * @property {_motionsTxt} DataString_ITEMS.extraDesc - descriptions suplementaire
*/ 

//TODO: OK les _motionsTxt doivent pouvoir etre generer sur appelle dans les initialize des menue et atre
// TODO: pour les messages, ce sera dans message initialize
// TODO: Les texte ne devrai etre que du data calculer live quand appeller
/**
 * Items dans items
 * quest dans quest
 * Messages dans messages
 * 
 * utiliser un poor pour chaque moduel et stoker motionstext, permetre injecter des styles custom
 */

/** Les events sont sois appeller directement, sois apeller sur un update */
class _Texts{
    //#region [Static]
    static TAG = {
        item:{n:'n', d:'d', exd:'exd'},
    };
    static POOL = {

    };

    ///** @type {Object.<string, DataString_QUESTS>} - Pool des Quests id */
    //static Quests = {};
    ///** @type {Object.<string, _motionsTxt>} - PoolKey des id de motions Words */
    //static WORDS = {};
    ///** @type {Object.<string, DataString_ITEMS>} - Pool des items par id */
    //static ITEMS = {};

    static SPLITBY_LETTER = /[\s\S]/g;
    static SPLITBY_WORD = /\S+\s+\d\s|\S+\s*/g;
    static SPLITBY_LINE = "TODO";//todo : hum ?
    //#endregion

    constructor() {
        /**@type {Object.<string, Array.<DataMessages> >} - Contiens les arrays [DataMessages] par id*/
        this.messages = {};
        this._localId = 0; //todo system et initialize
        this._local = 'frCA'; //todo system et initialize, cherche selon index dinamic excel puur rajoute plus de langue
        this.bubbleLineStyles = {
            /** limit avant saut ligne */
            maxWidth:600,
            /** limite avant saut page */
            maxHeight:500,
        }
    };

    //#region [Initialize]
    initialize(options){
        const strings = $loader.DATA.string;
        this.initialize_quests(strings.dataString_quests .data);
        this.initialize_words (strings.dataString_keyword.data);
        this.initialize_items (strings.dataString_items  .data);
        //this.initialize_message(strings.dataString_message.data);
        //this.initialize_MotionsTextsBlurs(options);
    };

    /** initialize les data messages */
    initialize_quests(DataString){
        const localIndex = this._localId+2;
        for (let i=1, l=DataString.length; i<l; i++) {
            const data = DataString[i];
            const id = data[0];
            const tag = data[1];
            const string = data[localIndex];
            if(!id){ continue };
            if(this.getStringById(id+tag)){ throw console.error("ERROR! Words id existe deja: ",id) };
            //! creer un objet selon le id
            _Texts.POOL[id+tag] = string;
        };
    };
    /** les keyword  */
    initialize_words(DataString){
        const localIndex = this._localId+1;
        for (let i=1, l=DataString.length; i<l; i++) {
            const data = DataString[i];
            const id = data[0];
            const string = data[localIndex];
            if(!id){ continue };
            if(this.getStringById(id)){ throw console.error("ERROR! Words id existe deja: ",id) };
            //! creer un objet selon le id
            _Texts.POOL[id] = string;
        };
    };

    /** initialize les data items title, description extra descriptions */
    initialize_items(DataString){
        const localIndex = this._localId+2;
        for (let i=1,lastId= 0, l=DataString.length; i<l; i++) {
            const data = DataString[i];
            const id = data[0] || lastId;
            const tag = data[1];
            const string = data[localIndex];
            if(!tag){ continue }; // ou pas id:null..
            if(_Texts.POOL[id+tag]){ throw console.error('ERROR (IDTAG) EXISTE DEJA!: ',id+tag) };
            _Texts.POOL[id+tag] = string || '';
            lastId = id;
        };
    };

    /** initialize tous les sprite Text en cache memoires (preComputing) */
    initialize_MessagesPages(options){
        //! messages pages
        Object.values(this.messages).forEach((arr)=>{
            for (let i=0, l=arr.length; i<l; i++) {
                const DataMessages = arr[i];
                DataMessages.Pages =  this.computeMessages(DataMessages.originalTxt); // preCache
            };
        });
    };
    /** generate les motions texts blur si activer */
    initialize_MotionsTextsBlurs(options){
        Object.values(this.messages).forEach(arr=>{
            arr.forEach(DataMessages => {
                // pour chaque page, generer un une motions texture
                for (let i=0, l=DataMessages.Pages.length; i<l; i++) {
            
                };
            });
        });
    };
    /** * List des combatModes selon lavancer des turn de combat  & 
    * @typedef {Object} DataMessages - Events messages bubbles, represente 1 bubble
    * @property {PIXI.Sprite} messageId - Id unique du message [Excel]
    * @property {String} originalTxt - Text complet du messages non normalizer (inclu les tag <>)
    * @property {('p0'|'p1'|'m0'|'eventName'|'')} target - L'identifiant du target (null pour custom default)
    * @property {PIXI.Container} Container - Caches des precomputed containers sprites strings
    * @property {PIXI.Sprite} motionsTexture - Caches des precomputed spriteString
    */
    /** Ajoute au pool un DataMessages*/
    addDataMessages(messageId,originalTxt,target,Container,motionsTexture){
        return {messageId,originalTxt,target,Container,motionsTexture};
    };
    //#endregion

    //#region [Method]
    /** @return {String} - cherche et return String data from DB */
    getStringById(id){
        return _Texts.POOL[id];
    };

    /** Creer un MotionsText Container selon un ID */
    /**
     * @param {String}  id - id du POOL string
     * @param {Number}  styleId - le data string origin
     * @param {RegExp}  splitBy - option suplementaire
     * @param {Number}  wordWrap - Si number, activer le wordwrap
     * @param {PIXI.TextStyleOptions}  style2 - extra style hack si besoin
     */
    MotionsTxt(id, styleId = 0, splitBy=_Texts.SPLITBY_WORD, wordWrap = 0, style2){
        const string = this.getStringById(id);
        if(string === undefined){throw console.error('ERROR STRING TXT ID: ',string)} // patienter de faire tous les items
        const MotionsTxt = new _motionsTxt(id,string,styleId,splitBy,wordWrap,style2 );
        return MotionsTxt;
    };
    
    //#endregion
};

let $texts = new _Texts();
console.log1('$texts: ', $texts);


/** Motions Text est la class Container qui manage les child text et les splits */

class _motionsTxt extends PIXI.Container{
    /**
    * @typedef {Object} TXTMATRIX - une matrix text
    * @property {String} TXTMATRIX.string descriptions
    * @property {Number} TXTMATRIX.styleID descriptions
    * @property {String} TXTMATRIX.tag descriptions
    * @property {PIXI.TextMetrics} TXTMATRIX.metric Metric de debugage
    * @property {PIXI.Point} TXTMATRIX.position position initiale du text
    * @returns TXTMATRIX */
    static TXTMATRIX(string,styleID,tag){
        return {string,styleID,tag,metric:null,position:null};
    };
    
    /**
     * @param {String}  id - id du POOL string
     * @param {String}  originalString - le data string origin
     * @param {RegExp}  splitBy - option suplementaire
     * @param {Number}  wordWrap - Si number, activer le wordwrap
     * @param {PIXI.TextStyleOptions}  style2 - extra style hack si besoin
     */
    constructor(id,originalString,styleId,splitBy,wordWrap,style2={}) {
        super();
        this._id = id;
        this._originalString = originalString;
        this._defaultstyleId = styleId;
        this._splitBy = splitBy;
        this._wordWrap = wordWrap;
        this.style2 = Object.assign(style2, {wordWrapWidth:wordWrap});
        /** @type {Array.<TXTMATRIX>} */
        this.matrix = null;
        /** @type {{ 'Master':PIXI.Container, 'motionsTexture':PIXI.Sprite }} */
        this.child = null;
        this.initialize();
    };

    //#region [GetterSetter]
    /** indicateur si ces class motionsTxt */
    get isMotionsTxt() { return true };
    //#endregion
    initialize(){
        this.initialize_regex();
        this.initialize_metric();
        this.initialize_splitter();// doi etre executer apres
        this.initialize_sprites();
        this.initialize_motionsTexture();
        this.getLocalBounds();
        this.child = this.childrenToName();
        this.debug(false); //!DELETE ME
    };

    //#region [Initialize]
    /** Decoup le string selon les tags */
    initialize_regex(){
        const matrix = []; //TODO: 2 SYSTEM, 1 AVEC TAG ET UN PRETAG AVEC REPLACE DE MOT CLE
        const re = /\<(#|S|P|N|I)(\w+|)\>/;
        let txt = this._originalString;
        let currentStyleId = this._defaultstyleId;
        for (let match; match = re.exec(txt); ) {
            (match.index > 0) && matrix.push( _motionsTxt.TXTMATRIX( txt.slice(0, match.index), currentStyleId ) );
            switch (match[1]) { // type de tags trouver?
                case 'S': //#STYLE
                    currentStyleId = match[2]? +match[2] : this._defaultstyleId;
                break;
                case 'P': //#FORCE NEW PAGE
                    matrix.push( _motionsTxt.TXTMATRIX( '', currentStyleId, match[1] ) );
                break;
                case 'N': //#FORCE NEW LINE
                    matrix.push( _motionsTxt.TXTMATRIX( '', currentStyleId, match[1] ) );
                break;
                case 'I': //#ICON ID
                    matrix.push(  _motionsTxt.TXTMATRIX( '', currentStyleId, match[1] ) );
                break;
                case 'V': //#VARIBALE dynamic, special update avant affiche le text 
                    matrix.push( _motionsTxt.TXTMATRIX( '', currentStyleId, match[1] ) );
                break;
                default:  ;break;
            };
            txt = txt.slice(match.index + match[0].length); // update text
        };
        matrix.push( _motionsTxt.TXTMATRIX( txt, currentStyleId ) );
        this.matrix = matrix;
    };

    /** creer les instance metric pour les saut ligne */
    initialize_metric(){
        const matrix = this.matrix; // todo: calculer max lineheight pour saut
        const isWordWrap = !!this._wordWrap;
        const wordWrapWidth = this._wordWrap;
        let maxHeightLine = 0; // calcul la hauteur maximal pour la ligne actuel pour un saut line
        for (let i=0,line=0, x=0,y=0; i<matrix.length; i++) {
            const textMatrix = matrix[i];
            const style = Object.assign($systems.styles[textMatrix.styleID].clone(), this.style2);
            let TextMetrics = PIXI.TextMetrics.measureText(textMatrix.string, style,isWordWrap);
            //!si ces un newLine
            if(textMatrix.tag === "N"){
                textMatrix.position = new PIXI.Point(x,y);
                //!reset
                x=0;
                y+=maxHeightLine;
                line++;
                maxHeightLine = 0;
                this.style2.wordWrapWidth = wordWrapWidth; // reset
                continue;
            };
            // Si metric a spliter , ces que ces un saut ligne
            if(TextMetrics.lines.length>1 ){
                if(x>0){ // si plsu grand que x0, ont ressaye avec un jumpLine
                    matrix.splice(i,0, _motionsTxt.TXTMATRIX('',textMatrix.styleID,"N") ); // restart
                }else{ // si x0? ont shift le premier [0], combine (sum) le reste [...]
                    textMatrix.string = TextMetrics.lines.shift();// FIXME: MDFUCKER
                    const restant = TextMetrics.lines.join(' ')+' ';
                    restant && matrix.splice(i+1,0, _motionsTxt.TXTMATRIX(restant,textMatrix.styleID) );
                    if(TextMetrics.lines.length === 1){ // si restai just 1[array] , il yaura pas de split dont ont saute
                        matrix.splice(i+1,0, _motionsTxt.TXTMATRIX('',textMatrix.styleID,"N") ); // restart
                    };
                };
                i--; continue;
            }else{
                this.style2.wordWrapWidth=Math.max(this.style2.wordWrapWidth-TextMetrics.maxLineWidth,1); // reduit wordWrapWidth min 1px
            };
            //Fix du bug, car metric a un bug de width avec `wordWrap`. On recalcul sans wordWrap si besoin
            TextMetrics = isWordWrap? PIXI.TextMetrics.measureText(textMatrix.string, style, false) : TextMetrics;
            textMatrix.metric = TextMetrics;
            textMatrix.position = new PIXI.Point(x,y);
            x+=TextMetrics.width;
            maxHeightLine = style.lineHeight || Math.max(TextMetrics.height,maxHeightLine);
        };
    };

    /** split la matrix selon option word,letter,line */
    initialize_splitter(){
        if(this._splitBy === _Texts.SPLITBY_LINE){return};
        const matrix = []; // reformat une nouvelle matrix selon le splits
        for (let i=0, x = 0, l=this.matrix.length; i<l; i++) {
            const m = this.matrix[i];
            if(m.tag){// si un tag <> continue, pas besoin de spliting
                x = 0;
                matrix.push(m);
                continue;
            };
            const match = m.string.match(this._splitBy);
            match && match.forEach(string => {
                const txtMatrix = _motionsTxt.TXTMATRIX(string, m.styleID );
                const TextMetrics = PIXI.TextMetrics.measureText(txtMatrix.string, m.metric.style, false);
                txtMatrix.metric = TextMetrics;
                txtMatrix.position = new PIXI.Point(x, m.position.y);
                matrix.push(txtMatrix);
                x+=TextMetrics.maxLineWidth;
            });
        };
        matrix.length && (this.matrix = matrix); // replace new matrix
    };

    /** creer les sprites des TextMetrics   */
    initialize_sprites(){
        const matrix = this.matrix;
        const Master = new PIXI.Container().setName('Master');
        Master.alpha = 0;
        for (let i=0, l=matrix.length; i<l; i++) {
            const textMatrix = matrix[i];
            if(textMatrix.tag === "N"){continue}
            const txt = new PIXI.Text(textMatrix.string,textMatrix.metric.style);
            txt.position.copy(textMatrix.position);
            txt.position.setZero();
            Master.addChild(txt);
        };
        this.addChild(Master);
    };

    /** creer */
    initialize_motionsTexture(){
        if('allow options motions sprites'){
            const motionsTexture = new PIXI.Sprite( $app.renderer.generateTexture(this) ).setName('motionsTexture');
            //motionsTexture.pivot.set(motionsTexture.width,motionsTexture.height);
            //motionsTexture.position.set(motionsTexture.pivot.x,motionsTexture.pivot.y);
            this.addChildAt(motionsTexture,0);
        };
    };
    //#endregion

    /** special anchor pour motionText. baser sur pivot */
    anchors(x,y=x){
        const width = this._localBoundsRect.width
        const height = this._localBoundsRect.height;
        this.child.Master.pivot.set(width*x, height*y);
        this.child.motionsTexture.pivot.set(width*x, height*y);
        return this;
    };

    txtMatrice(string,styleID,tag){
        return {string,styleID,tag};
    };

    /** Action start la motions */
    start(enableMotion=false,staggerSpeed=0.08){
        gsap.fromTo(this.child.Master, 1, {alpha:0, y:-50},{alpha:1, y:0, ease:Expo.easeOut });
        enableMotion && this.startMotion(staggerSpeed);
        return this;
    };

    startMotion(staggerSpeed){
        const List = this.child.Master.children;
        //!motions words
        if('option motions words show'){
            gsap.killTweensOf(List);
            gsap.fromTo(List, 0.3,
                { alpha:0 },
                { alpha:1, ease: Power1.easeIn, stagger: staggerSpeed });
            gsap.fromTo(List, 2,
                {
                    x:(i,o)=>o.position.zero._x,
                    y:(i,o)=>o.position.zero._y
                },
                {
                    x:()=>`+=${Math.randomFrom(6,-6)}`,
                    y:()=>`+=${Math.randomFrom(6,-6)}`,
                    ease: Power1.easeInOut, 
                    repeat: -1, 
                    yoyo: true,
                    yoyoEase: true,
                    stagger: 0.2
                });
        }

        //!motions blur
        if('option motionsFx :motionsSprite'){
            const b = $systems.PixiFilters.blurTxt;
            //const f = $systems.PixiFilters.MotionBlurFilter;//FIXME: PAS BESOIN ET ARTEFACT BIZARD.
           // const bounds = this.child.motionsTexture.getBounds(); //FIXME: gros problem gpu performance 100%
           // this.child.motionsTexture.filterArea = bounds;
            this.child.motionsTexture.filters = [b];
            gsap.fromTo(this.child.motionsTexture, 5, {alpha:0}, {alpha:1})
        }else{
            this.child.motionsTexture.renderable = false;
        }
        //this.child.motionsTexture.renderable = false;
        return this;
    }

    /** clear les instance actuel */
    clear(){
        gsap.killTweensOf(this.child.Master.children);
    }

    /** @param {Boolean} perma  - Destroy child ?*/
    Destroy(perma=false){
        this.clear();
        if(perma){
            this.destroy({children:true});
            this.child = null;
        }
    }

    debug(enable){
        if(!enable){return};
        const bound =  this.child.Master.getBounds(true);
        const MasterRec = new PIXI.Graphics();
            MasterRec.lineStyle(2, 0xffffff, 1);
            MasterRec.drawRect(bound.x,bound.y,bound.width,bound.height);
            this._wordWrap && MasterRec.drawRect(bound.x,bound.y,this._wordWrap,bound.height);
            MasterRec.endFill();
       //!widh indicator
       const MasterTxt = new PIXI.Text(
           `x:${~~bound.width} \ny:${~~bound.height} \nWrapW:${this._wordWrap?this._wordWrap:false}`
           ,{ fill: "white", fontSize: 14, lineHeight: 14 });
            MasterTxt.position.set(4+(this._wordWrap||bound.width),0);
        this.addChild(MasterRec,MasterTxt);
       //!subtext
       this.matrix.forEach((matrix,i) => {
            const color = [0x35e95c,0x000000,0xff0000,0x0000ff,0xffd800,0xcb42f4][~~(Math.random()*6)];
            if(matrix.tag === "N"){
                const N = new PIXI.Sprite(PIXI.Texture.WHITE);
                    N.position.copy(matrix.position);
                    this.addChild(N);
            }else{
                const rec = new PIXI.Graphics();
                rec.lineStyle(1, color, 0.7);
                rec.drawRect(matrix.position.x,matrix.position.y,matrix.metric.width,matrix.metric.height);
                rec.endFill();
                this.addChild(rec);
            }
       });
       //!interactive text pour zoom ?
       MasterRec.interactive = true;
       MasterRec.hitArea = MasterRec.getBounds()
       MasterRec.on("pointerup", ()=>{gsap.to(this.scale, {x:'+=0.5',y:'+=0.5'})})

    }
};