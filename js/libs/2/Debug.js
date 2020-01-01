/**Permet de debug des elements du jeux ou les position */
class Debug extends PIXI.Container {
    /** contien les element debug */
    static POOL = [];
    /** Applique interactive sur debug ET AJOUTE UN .DEBUG*/
    static CONTAINER = function(DisplayObjet){
        let childrens = [DisplayObjet]
        let current = null;
        while (current = childrens.shift()) {
            if(current.children){childrens.push(...current.children)}; //add more displaObj
            if(current.name){
                current.removeAllListeners();
                Debug.POOL.push(new this(current));
            }
        }
    };
    static get addStatusPoisonToPlayer1() {
        (function () {
            $players.p0.addStatus('poison',true)
            console.log('$players.p0: ', $players.p0);
        })()
    };
    static get addStatusHungerToPlayer1() {
        (function () {
            $players.p0.addStatus('hunger',true)
            console.log('$players.p0: ', $players.p0);
        })()
    };
    static get reduit_HG_deMotier() {
        (function () {
            $players.p0.add_HG(-$players.p0._HG/2.5);

        })();
    };
    static get reset_HG_toMax() {
        (function () {
            $players.p0.add_HG(999);
        })()
    };

    /**@param {PIXI.Sprite|PIXI.Container} current */
    constructor(current) {
        super();
        /** @type {{ 'rec':PIXI.Graphics, 'txt':PIXI.Text, 'Anchor':PIXI.Sprite }} */
        this.child = null;
        this.DisplayObject = current;
        this.initialize()
     };

     initialize(){
        this.initialize_base();
        this.initialize_interactions();
        this.DisplayObject.addChild(this);

     };

     initialize_base(){
        const DisplayObject = this.DisplayObject;
        const B = DisplayObject.getLocalBounds();
        const rec = new PIXI.Graphics().setName('rec');
        //!rectangle line
        rec.lineStyle(4,0xffffff);
        rec.beginFill(0xffffff,0.1);
        rec.drawRect(B.x,B.y,B.width,B.height);
        //!text
        const txt = new PIXI.Text(this.DisplayObject.name,{fill:"#ffffff",fontSize:18}).setName('txt');
            txt.anchor.set(0,1);
        this.addChild(rec,txt);
        if(DisplayObject.anchor){ // creer anchor ?
            const Anchor = new PIXI.Sprite(PIXI.Texture.WHITE).setName('Anchor');
            Anchor.scale.set(1.2);
            Anchor.anchor.set(0.5);
            this.addChild(Anchor);
        };
        this.child = this.childrenToName();
     };

     initialize_interactions() {
        this.child.rec.interactive = true;
        this.child.rec.on('pointerover'       , this.pointerover_debug    , this);
        this.child.rec.on('pointerout'        , this.pointerout_debug  , this);
        this.child.rec.on('pointerup'        , this.pointerup_debug  , this);
     };
     
     /** @param {PIXI.interaction.InteractionEvent} e -*/
     pointerover_debug(){
         for (let i=0, l=Debug.POOL.length; i<l; i++) {
             const debug = Debug.POOL[i];
             debug.alpha = debug===this?this.alpha = 2:0.04;
         };
     };
     pointerout_debug(){
        for (let i=0, l=Debug.POOL.length; i<l; i++) {
            const debug = Debug.POOL[i];
            debug.alpha = 1;
        };

     };
     /** @param {PIXI.interaction.InteractionEvent} e -*/
     pointerup_debug(e){
        if(e.isRight){ // click droite
            e.currentTarget.interactive = false;
            this.pointerout_debug();
        }else{
            Inspectors.DisplayObj(this.DisplayObject,this)
        }
     };
    
};