/** Les events sont sois appeller directement, sois apeller sur un update */
class _Texts{
    /**
        * @typedef {Object} DataString_QUESTS Objet qui stock id quest string
        * @property {_motionsTxt} DataString_QUESTS.title - title
        * @property {_motionsTxt} DataString_QUESTS.title2 - BIG TITLE
        * @property {_motionsTxt} DataString_QUESTS.titleDesc - descriptions
        * @property {Array.<_motionsTxt>} DataString_QUESTS.quest - subDescriptions d'une quest
    */ 
    /** @type {Object.<string, DataString_QUESTS>} Pool des Quests id */
    static Quests = {};
    /** @type {Object.<string, _motionsTxt>} PoolKey des id de motions Words */
    static WORDS = {};

    static SPLITBY_LETTER = /[\s\S]/g;
    static SPLITBY_WORD = /\S+\s+\d\s|\S+\s*/g;
    static SPLITBY_LINE = "TODO";//todo : hum ?
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
        this.initialize_quests(strings.dataString_quests.data);
        this.initialize_keyword(strings.dataString_keyword.data);
        //this.initialize_message(strings.dataString_message.data);
       //this.initialize_MessagesPages(options);
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
            //! creer un objet selon le id
            !_Texts.Quests[id] && (_Texts.Quests[id] = {title:null,titleDesc:null,quest:[]});
            switch (tag) {
                case 't' :
                    _Texts.Quests[id].title  = new _motionsTxt(id,string,9,{ fontWeight: '900', fill:"#fff" } );
                    _Texts.Quests[id].title2 = new _motionsTxt(id,string,3,{ fontWeight: '900', fill:"#fff", fontVariant: "small-caps", } );
                break;
                case 'td': _Texts.Quests[id].titleDesc =    new _motionsTxt(id,string,9,{ wordWrap: true, wordWrapWidth: 700 }  ); break;
                case 'q' : _Texts.Quests[id].quest.push(new _motionsTxt(id,string,9,{ wordWrap: true, wordWrapWidth: 700 }) );     break;
            };
        };
    };
    /** les keyword  */
    initialize_keyword(DataString){
        const localIndex = this._localId+1;
        for (let i=1, l=DataString.length; i<l; i++) {
            const data = DataString[i];
            const id = data[0];
            const string = data[localIndex];
            if(!id){ continue };
            //! creer un objet selon le id
            if(_Texts.WORDS[id]){throw console.error("ERROR! Words id existe deja: ",id)};
            _Texts.WORDS[id] = new _motionsTxt(id,string,9,{ fontWeight: '900', fill:"#fff" } );
        };
    };
    /** initialize les data messages */
    initialize_message(DataString){
        for (let i=1, l=DataString.length; i<l; i++) {
            const data = DataString[i];
            const messageId = data[0];
            const originalTxt = data[2+this._localId];
            const target = data[1];
            // pour chaque events message creer les data Pages
            if(!messageId){continue};
            this.messages[messageId] = this.messages[messageId] || [];
            this.messages[messageId].push(...this.computeMessages(messageId,originalTxt,target));
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

    //#endregion
};

let $texts = new _Texts();
console.log1('$texts: ', $texts);


/** Motions Text est la class Container qui manage les child text et les splits */

class _motionsTxt extends PIXI.Container{
    /**@param {PIXI.TextStyleOptions}  styleOptions - option suplementaire */
    constructor(id,string,defaultStyle=9,styleOptions={ wordWrap: false, wordWrapWidth: 300 }) {
        super();
        this._id = id;
        this._originalString = string;
        this._defaultStyle = defaultStyle;
        /**@type {TextMatrix} */
        this.matrix = null;
        this.styleOptions = styleOptions;
        /** @type {{ 'Master':PIXI.Container, 'motionsTexture':PIXI.Sprite }} */
        this.child = null;
        this.initialize();
    };

    initialize(){
        this.initialize_regex();
        this.initialize_splitter();
        this.initialize_metric();
        this.initialize_sprites();
        this.initialize_motionsTexture();
        this.child = this.childrenToName();
        this.debug(false); //!DELETE ME
    };

    //#region [Initialize]
    /** Decoup le string selon les tags */
    initialize_regex(){
        let txt = this._originalString;
        let matrix = [];
        let currentStyleId = this._defaultStyle;
        let re = /\<(#|S|P|N|I)(\w+|)\>/;
        for (let match; match = re.exec(txt); ) {
            (match.index > 0) && matrix.push( this.txtMatrice( txt.slice(0, match.index), currentStyleId ) );
            switch (match[1]) { // type de tags trouver?
                case 'S': //#STYLE
                    currentStyleId = match[2]?+match[2]:this._defaultStyle;
                break;
                case 'P': //#FORCE NEW PAGE
                    matrix.push( this.txtMatrice( '', currentStyleId, match[1] ) );
                break;
                case 'N': //#FORCE NEW LINE
                    matrix.push( this.txtMatrice( '', currentStyleId, match[1] ) );
                break;
                case 'I': //#ICON ID
                    matrix.push( this.txtMatrice( '', currentStyleId, match[1] ) );
                break;
                case 'V': //#VARIBALE dynamic, special update avant affiche le text 
                    matrix.push( this.txtMatrice( '', currentStyleId, match[1] ) );
                break;
                default:  ;break;
            };
            txt = txt.slice(match.index + match[0].length); // update text
        };
        matrix.push( this.txtMatrice( txt, currentStyleId ) );
        this.matrix = matrix;
    };

    /** split la matrix selon option word,letter,line */
    initialize_splitter(){
        const matrix = this.matrix;
        const splittedMatrix = [];
        const re = _Texts.SPLITBY_LETTER; // split by word option
        for (let i=0, l=matrix.length; i<l; i++) {
            const m = matrix[i];
            if(m.tag){// si un tag <> continue, pas besoin de spliting
                splittedMatrix.push(m);
                continue;
            }
            const match = m.string.match(re);
            match.forEach(string => {
                splittedMatrix.push(this.txtMatrice(string,m.styleID));
            });
                
        };
        this.matrix = splittedMatrix;
    };

    /** creer les instance metric pour les saut ligne */
    initialize_metric(){
        const matrix = this.matrix;
        let styleOptions = Object.assign({}, this.styleOptions); // quand saut ligne , reset
        const isWordWrap = styleOptions.wordWrap && delete styleOptions.wordWrap; //On delete car metric a un bug de width avec `wordWrap`
        let maxHeightLine = 0; // calcul la hauteur maximal pour la ligne actuel pour un saut line
        for (let i=0, x=0,y=0; i<matrix.length; i++) {
            const textMatrix = matrix[i];
            const style = Object.assign($systems.styles[textMatrix.styleID].clone(),styleOptions);
            let TextMetrics = PIXI.TextMetrics.measureText(textMatrix.string, style,isWordWrap);
            //!si ces un newLine
            if(textMatrix.tag === "N"){
                textMatrix.position = new PIXI.Point(x,y);
                //!reset
                x=0;
                y+=maxHeightLine;
                maxHeightLine = 0;
                styleOptions.wordWrapWidth = this.styleOptions.wordWrapWidth; // reset
                continue;
            };
            // Si metric a spliter , ces que ces un saut ligne
            if(TextMetrics.lines.length>1 ){
                if(TextMetrics.lineWidths[0]>styleOptions.wordWrapWidth){ // si le premier word splited brise la limite, envoyer tous pour second line.
                    matrix.splice(i,0,this.txtMatrice('',textMatrix.styleID,"N") ); // restart
                    i--; continue;
                };
                //todo: pas besoin si utilise mode splitter words, mais a fair si pas le mode spittler words (rempalcer push par splice)
                /*matrix.push( this.txtMatrice('',textMatrix.styleID,"N") ); // ajout un jump line
                while (TextMetrics.lines.length>1) {
                    const line = TextMetrics.lines.splice(1,1)[0];
                    const _matrix = this.txtMatrice(line,textMatrix.styleID);
                    matrix.push(_matrix);
                };
                textMatrix.string = TextMetrics.lines[0];
                TextMetrics = PIXI.TextMetrics.measureText(textMatrix.string, style);*/
                
            }else{
                styleOptions.wordWrapWidth=Math.max(styleOptions.wordWrapWidth-TextMetrics.maxLineWidth,1);
            };
            //Fix du bug, car metric a un bug de width avec `wordWrap`. On recalcul sans wordWrap si besoin
            TextMetrics = isWordWrap?TextMetrics = PIXI.TextMetrics.measureText(textMatrix.string, style) : TextMetrics;
            textMatrix.metric = TextMetrics;
            textMatrix.position = new PIXI.Point(x,y);
            x+=TextMetrics.width;
            maxHeightLine = style.lineHeight || Math.max(TextMetrics.height,maxHeightLine);
        };
    };

    /** creer les sprites des TextMetrics   */
    initialize_sprites(){
        const matrix = this.matrix;
        const Master = new PIXI.Container().setName('Master');
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
            motionsTexture.pivot.set(motionsTexture.width,motionsTexture.height);
            motionsTexture.position.set(motionsTexture.pivot.x,motionsTexture.pivot.y);
            this.addChildAt(motionsTexture,0);
        };
    };
    //#endregion

    txtMatrice(string,styleID,tag,origine=0){
        return {string,styleID,tag};
    };

    /** Action la motions text si disponible dans les options */
    show(enableMotion=false){
        gsap.from(this, {y:'-=50'});
        enableMotion && this.startMotion();
        return this;
    };

    startMotion(){
        const List = this.child.Master.children;
        //!motions words
        if('option motions words show'){
            gsap.killTweensOf(List);
            /*TweenMax.staggerFromTo(List, 0.5, {alpha:0},{alpha:1, ease: Power1.easeIn}, 0.05);
            TweenMax.staggerFromTo(List, 4, 
                {
                    x:(i,o)=>o.position.zero._x,
                    y:(i,o)=>o.position.zero._y
                },{
                    x:()=>`+=${Math.randomFrom(4,-8)}`,
                    y:()=>`+=${Math.randomFrom(7,-10)}`, 
                ease: Power1.easeInOut, repeat:-1, yoyo:true
            }, 0.4);*/

            gsap.fromTo(List, 0.3,
                { alpha:0 },
                { alpha:1, ease: Power1.easeIn, stagger: 0.07 });
            gsap.fromTo(List, 4,
                {
                    x:(i,o)=>o.position.zero._x,
                    y:(i,o)=>o.position.zero._y
                },
                {
                    x:()=>`+=${Math.randomFrom(3,-3)}`,
                    y:()=>`+=${Math.randomFrom(4,-4)}`,
                    ease: Power1.easeInOut, 
                    repeat: -1, 
                    yoyo: true,
                    yoyoEase: true,
                    stagger: 0.2
                });
        };

        //!motions blur
        if('option motionsFx :motionsSprite'){
            const b = $systems.PixiFilters.blurTxt;
            const f = $systems.PixiFilters.MotionBlurFilter;
           // const bounds = this.child.motionsTexture.getBounds(); //FIXME: gros problem gpu performance 100%
           // this.child.motionsTexture.filterArea = bounds;
            this.child.motionsTexture.filters = [f,b];
            gsap.fromTo(this.child.motionsTexture, 5, {alpha:0}, {alpha:1})
        }else{
            this.child.motionsTexture.renderable = false;
        }

    
        //this.child.motionsTexture.renderable = false;
        return this;
    };

    /** clear les instance actuel */
    clear(){
        gsap.killTweensOf(this.child.Master.children)
    };

    /** clone une instance */
    clone(){

    };

    debug(enable){
        if(!enable){return};
       const bound =  this.child.Master.getBounds();
       const graphics = new PIXI.Graphics();
       
        graphics.lineStyle(4, 0xffffff, 1);
        graphics.drawRect(bound.x,bound.y,bound.width,bound.height);
        graphics.endFill();
       //!widh indicator
       const txt = new PIXI.Text(`x:${~~bound.width}\ny:${~~bound.height}`,{ fill: "white", fontSize: 16, lineHeight: 18 });
       txt.anchor.y = 0.5;
       txt.position.set(4+bound.width,bound.height/2);
       this.addChild(graphics,txt);
       //!subtext
       this.child.Master.children.forEach(Text => {
            const color = [0xffffff,0x000000,0xff0000,0x0000ff,0xffd800,0xcb42f4][~~(Math.random()*6)];
            const bound =  Text.getBounds();
            const graphics = new PIXI.Graphics();
            graphics.lineStyle(2, color, 1);
            graphics.drawRect(0,0,bound.width,bound.height);
            graphics.endFill();
            Text.addChild(graphics);
       });
    };
};