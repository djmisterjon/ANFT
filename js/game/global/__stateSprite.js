/** Base dun state */
class _StateSprite extends PIXI.Container{
    //#region [Static]
    //#endregion
    constructor() {
        super();
        /** @type {{ 'AA':, 'BB':, 'CC':, 'DD':, 'EE':, 'FF':, }} */          
        this.child = null;
        this.initialize();
    }
    //#region [GetterSetter]
    /** obtien la texture name pour le state ou status */
    get textureName() { return `st_${this.constructor.name.split('_State_')[1]}` };
    //#endregion
    //#region [Initialize]
    initialize(){
        this.initialize_base();
        this.initialize_interactions()
       
    }
    initialize_base(){ // todo: background ?
        const dataBase = $loader.DATA2.IconStates;
        const State = $objs.ContainerDN(dataBase,this.textureName,'State').setName('State');
        State.d.anchor.set(0.5);
        State.n.anchor.set(0.5);
        this.addChild(State);
        this.child = this.childrenToName();
    }

    /** initialize interaction pour les cases */
    initialize_interactions(){
        this.interactive = true;
        this.on('pointerover' , this.pointerover_state ,this);
        this.on('pointerout'  , this.pointerout_state  ,this);
        this.on("pointerdown" , this.pointerdown_state ,this);
        this.on('pointerup'   , this.pointerup_state   ,this);
    };

    pointerover_state(e){
        this._timeout = setTimeout(() => {
            this.showDescriptions();
        }, 1000);
        
    }

    pointerout_state(e){
        clearTimeout(this._timeout);
    }

    pointerdown_state(e){

    }

    pointerup_state(e){

    }
    //#endregion
    /**@returns {string} */
    getDescriptions(){return};
    showDescriptions(){
        const Tracking = new _TrackingStates(this);
        const desc = Tracking.getDescriptions();
        this.showStateHelpBox(desc)//$mouse.showHelpBox(desc);
    }

    /** affiche les State helpBox info 
     * @param {PIXI.Text} txt - passe un text id
    */
    showStateHelpBox(txt){//TODO: CREER UNE STATE HELPBOX
        const c = new PIXI.Container();
        const HelpBoxBG = new PIXI.Sprite(PIXI.Texture.WHITE).setName('helpBoxBG');

        c.addChild(HelpBoxBG,txt);
        HelpBoxBG.width  = c.width ;
        HelpBoxBG.height = c.height;
        $mouse.addChild(c)
        c.position.set($mouse.x,$mouse.y);
            
    }
    //#region [Method]
 
    //#endregion

}
        