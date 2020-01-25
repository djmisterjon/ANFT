
// Indicateur de Events status 
class _Huds_MessageIndicator extends _Huds_Base{
    //#region [Static]
    static TYPE = {
        QUEST:"quest",
    }
    //#endregion
    constructor() {
        super();
        this.poolData = [];
    };
    
    //#region [Initialize]
    initialize(){
        this.initialize_base();
        this.child = this.childrenToName();
        this.renderable = false;
        this.position.set(1920/2,300);
    };
    initialize_base(){//TODO: AJOUTER UN ICONS A GAUCHE
        const dataBase = $loader.DATA2.Menue_Quests;
        const dataBase2 = $loader.DATA2.Flares;
        const dataBase3 = $loader.DATA2.XboxButonsHelper;

        const Master = new PIXI.Container().setName('Master');
        //# data2/Hubs/Quests/SOURCE/images/BgSubQuest.png
        const bg = $objs.ContainerDN(dataBase,'BgSubQuest','bg');
            bg.d.anchor.set(0.5,0);
            bg.n.anchor.set(0.5,0);
            bg.alpha = 0.6;
       //# data2/Hubs/Quests/SOURCE/images/barQDescrip_L.png
       const BarL = $objs.ContainerDN(dataBase,'barQDescrip_L','BarL');
           BarL.position.set(-390,55);
           BarL.d.anchor.set(0.5);
           BarL.n.anchor.set(0.5);
       //# data2/Hubs/Quests/SOURCE/images/barQDescrip_R.png
       const BarR = $objs.ContainerDN(dataBase,'barQDescrip_R','BarR');
           BarR.position.set(390,55);
           BarR.d.anchor.set(0.5);
           BarR.n.anchor.set(0.5);
       //# \data2\FX\Flare\SOURCE\images\d\Flare_0.png"
       const Flare = $objs.ContainerDN(dataBase2,'Flare_0','Flare');
            Flare.d.anchor.set(0.5);
            Flare.n.anchor.set(0.5);
            Flare.d.tint = 0x4f3d20;
        //# \data2\FX\Flare\SOURCE\images\d\Flare_0.png"
        const Flare2 = new PIXI.Sprite(dataBase2.textures.Flare_0).setName('Flare2');
            Flare2.parentGroup = $displayGroup.DiffuseGroup;
            Flare2.anchor.set(0.5);
            Flare2.blendMode = 1;
            Flare2.y = 80;
        //!light
        const LightFlare = new PIXI.lights.PointLight().setName("LightFlare");
            LightFlare.y = Flare2.y;
            LightFlare.color = 0xFCFFAF;
            Inspectors.Light(LightFlare);
        //!end
        Master.addChild(bg,BarL,BarR,Flare,Flare2,LightFlare);
        Master.scale.set(1,0.7);
        this.addChild(Master);
       
    };
    initialize_interactions() {

    };

/** @param {PIXI.interaction.InteractionEvent} e -*/
    //#endregion


    //#region [Interactive]
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    _pointerover(e) {
  
    };

    /** @param {PIXI.interaction.InteractionEvent} e -*/
    _pointerout(e) {

    };

    /** @param {PIXI.interaction.InteractionEvent} e -*/
    _pointerdown(e) {

    };

    /** @param {PIXI.interaction.InteractionEvent} e -*/
    _pointerup(e) {
    };
    //#endregion

    //#region [Method]
    show(){
        this.renderable = true;
    };

    /** ajout dans le pool les vents a afficher*/
    add(type,id){
        switch (type) {
            case _Huds_MessageIndicator.TYPE.QUEST:
                this.add_quest(id);
                break;
        
            default:
                break;
        }
        this.update();
    };

    add_quest(id){
        const title = new PIXI.Text('Nouvelle Quete dans journal',$systems.styles[9]);
        //see dataString_quests pour tag
        const extraTxt = new PIXI.Text($texts.getStringById(id,'n').toUpperCase(),$systems.styles[4]);
        extraTxt.anchor.set(0.5);
        this.poolData.push({title,extraTxt});
    };

    /** update le diffuseur pour affiche un update, events, journals ou succes ...  */
    update(){ //ex: _Quests.add("theOrbsQuests"); _Quests.add("AncienPortalAnubis");
        if(!gsap.getById('messageEvents')){
            const eventData = this.poolData.shift();
            if(eventData){
                this.renderable = true;
                this.visible = true;
                const bg = this.child.bg;
                const BarL = this.child.BarL;
                const BarR = this.child.BarR;
                const Flare = this.child.Flare;
                const Flare2 = this.child.Flare2;
                const Light = this.child.LightFlare;
                const margeX = -(800/2)+100; // marge debut txt + icon
                const tl = this.TimeLine = gsap.timeline({id:'messageEvents'});
                tl.add(()=>{ this.addChild(eventData.title,eventData.extraTxt) },0);
                tl.fromTo(this, 1, {alpha:0},{alpha:1, ease:Power4.easeOut },0);
                tl.fromTo(this, 2, {x:1920/2,y:300},{x:1920/2,y:320, ease:Power4.easeOut },0.1);
                tl.fromTo([BarL.scale,BarR.scale], 0.3, {x:0,y:0},{x:1,y:1, ease:Back.easeOut.config(1.7)},0);
                tl.fromTo(bg.scale, 0.4, {x:0},{x:1, ease:Power4.easeInOut },0.3);
                //!txt
                tl.fromTo(eventData.title, 2, {x:margeX-10},{x:margeX, ease:Power2.easeOut },0.4);
                tl.fromTo(eventData.extraTxt, 3, {y:60},{y:57, ease:Power2.easeOut },0.4);
                tl.fromTo(eventData.extraTxt, 3, {alpha:0},{alpha:1, ease:Power2.easeOut },0.4);
                tl.fromTo(Flare.scale, 2, {x:0},{x:1, ease:Power4.easeOut },0.4);
                tl.fromTo(Flare2.scale, 1, {x:0},{x:1, ease:Power4.easeOut },0.8);
                tl.fromTo(Flare2, 1, {alpha:0},{alpha:1, ease:Power4.easeOut },0.8);
                tl.fromTo(Light, 0.5, {brightness:0.4},{brightness:2, ease:Power4.easeOut },0.8);
                tl.to(Light, 2, {brightness:1, ease:Power3.easeInOut },1);
                tl.to(this, 3, {y:"+=10", ease:Power4.easeIn });//todo: wait selon menue options param ("minTime message indicator")
                tl.to(this, 0.4, {alpha:0, ease:Power4.easeOut },'-=0.4');
                tl.eventCallback("onComplete", ()=>{
                    this.removeChild(eventData.title);
                    this.removeChild(eventData.extraTxt);
                    this.update();
                })
            }else{
                this.renderable = false;
                this.visible = false;
            }
        };
    };

    /** Affiche setup turn en jeux*/
    show_setupTurn(time=2000){
        this.clear();
        const ElementsContainer = this.child.ElementsContainer;
        const txt = new PIXI.Text('Roll GemDice to start.',$systems.styles[4]);
        txt.anchor.set(0,0.5)
        txt.x = 120;
        ElementsContainer.addChild(txt);
        //!show
        TweenLite.fromTo(this.child.BG, 0.3, {x:0},{x:ElementsContainer.getBounds().right+10,ease:Power4.easeOut });
        
        this.y = 220;
        this.renderable = true;
        this._timeout =  setTimeout(()=>{ this.hide() }, time);
       
    };

    /** cache l'indicator information */
    hide(){
        
      //  TweenLite.fromTo(this.child.BG, 1, {x:0},{x:30,ease:Power4.easeOut });
    };

    clear(){
        clearTimeout(this._timeout);
        const ElementsContainer = this.child.ElementsContainer;
        ElementsContainer.removeChildren();
    };
    //#endregion

};