/**@class huds qui affiche les states p1 selon choix (toggle click)*/
class _Huds_States extends _Huds_Base {
    constructor(options) {
        super(options);
        /** @type {{ 'CenterBg':ContainerDN, 'HeadIcon':ContainerDN, 'TxtLevelValue':PIXI.Text, 'StatesContainer':PIXI.Container, 'EE':, 'FF':, }} */
        this.child = null;
        /** indicateur si les states son afficher */
        this._showStatesMode = false;
    };
    //#region [GetterSetter]

    //#endregion

    //#region [Initialize]
    initialize() {
        this.initialize_base();
        this.initialize_interactions();
        this.position.set(290,45); //45 90
    };

    initialize_base(){
        const dataBase = $loader.DATA2.HudsStates;
        const dataBase2 = $loader.DATA2.HeadIcons;
        const dataBase3 = $loader.DATA2.IconStates;
        //# data2\GUI\huds\states\SOURCE\images\stCenter.png
        const CenterBg = $objs.ContainerDN(dataBase,'stCenter','CenterBg');
        CenterBg.d.anchor.set(0.5);
        CenterBg.n.anchor.set(0.5);
        //# data2\Icons\HeadIcons\SOURCE\images\hico_p0.png
        const HeadIcon = $objs.ContainerDN(dataBase2,`hico_p0`,'HeadIcon');
            HeadIcon.scale.set(0.6);
            HeadIcon.d.anchor.set(0.5);
            HeadIcon.n.anchor.set(0.5);
        //# txt LV value
        const TxtLevelValue = new PIXI.Text('LV:99',$systems.styles[0]).setName('TxtLevelValue');
        TxtLevelValue.anchor.set(0.5);
        TxtLevelValue.position.set(0,35);
        //# statesBar
        const StatesBars = [];
        for (let i=0, l=4; i<l; i++) {
            StatesBars.push( new __StatesBar(i) );
        };
        //# statesIcons 
        const StatesContainer = new PIXI.Container().setName('StatesContainer');
        StatesContainer.position.set(-225,-75)
        for (let i=0, l=7; i<l; i++) {
            //# data2\System\states\SOURCE\images\st_atk.png
            const stName = $systems.states.base[4+i];
            const State = $objs.ContainerDN(dataBase3,`st_${stName}`,'State');
                State.d.anchor.set(0.5);
                State.n.anchor.set(0.5);
                State.scale.set(0.5);
                State.position.set(75*i,0);
            //# txt value
            const TxtStatesValue = new PIXI.Text('999',$systems.styles[0]);
                TxtStatesValue.anchor.set(0.5);
                TxtStatesValue.position.set(75*i,20);
            StatesContainer.addChild(State,TxtStatesValue);
        };
        //!end
        this.addChild(StatesBars[0],StatesBars[2],CenterBg,StatesBars[1],StatesBars[3],HeadIcon,TxtLevelValue,StatesContainer);
        this.child = this.childrenToName();
    };
    //#endregion

    //#region [Interactive]
    initialize_interactions() {
        const HeadIcon = this.child.HeadIcon;
        HeadIcon.interactive = true;
        HeadIcon.on('pointerover'       , this.pointerover_HeadIcon    , this);
        HeadIcon.on('pointerout'        , this.pointerout_HeadIcon   , this);
        HeadIcon.on('pointerup'         , this.pointerup_HeadIcon    , this);
    };
    
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerover_HeadIcon(e){
        const HeadIcon = this.child.HeadIcon;
        gsap.fromTo(HeadIcon.scale, 0.3, {x:0.5,y:0.5}, {x:0.6,y:0.6});
        HeadIcon.d.filters = [$systems.PixiFilters.OutlineFilterx4white];
    };
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerout_HeadIcon(e){
        const HeadIcon = this.child.HeadIcon;
        HeadIcon.d.filters = null;
    };
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerup_HeadIcon(e){
        if(e.isRight){ this.toggleStatesMode(); };
    };
    //#endregion
    //#region [Method]

    show(id){
        this.renderable = true;
    };

    /** Affiche les states ou les cache */
    toggleStatesMode(value=!this._showStatesMode){
        if(value!==this._showStatesMode){
            const ani = gsap.to(this.position, 0.5, {y:value?90:45, ease:Back.easeOut.config(1.4) });
            ani.eventCallback(value?"onStart":"onComplete", ()=>{this.child.StatesContainer.renderable = value});
        };
        this._showStatesMode = value;
    };

    /** refresh les stats et bar */
    refresh(){

    };
    //#endregion
};


/**@class Bar de states hp,mp,hg,hy */
class __StatesBar extends PIXI.Container {
    constructor(id) {
        super();
        this.name = "StatesBar";
        this._id = id;
        /** id du player actuelement afficher */
        this._actorId = 0;
        /** @type {{ BarBgTop:_objs.ContainerDN, BarFillTop:_objs.ContainerDN, BarCornerTop:_objs.ContainerDN, stateTxtValue:PIXI.Text}} */
        this.child = null;
        this.initialize();
    };
    //#region [GetterSetter]
    /**@returns {_battler} */
    get source() { return $players.group[this._sourceID]};
    //#endregion

    //#region [Initialize]
    initialize() {
        this.initialize_base();
        const position = [[-60,-25],[-235,40],[60,-25],[235,40]];
        this.position.set(...position[this._id])
        /*const isTop = !(this._id%2);
        const isLeft = (this._id<1);
        const x  = isTop ? 0 : 0;
        const xx = isLeft? 0 : 0;
        const yy = isLeft? 0 : 0;
        this.position.set(x+xx, yy );*/
    };

    initialize_base(){
        const anchor = [[1,0],[0,1],[0,0],[1,1]];
        const position = [[0,-4],[0,1],[0,-4],[0,1]];
        const TxtPosition = [[-95,15],[95,-20],[95,15],[-95,-20]];
        const iconPosition = [[-180,30],[185,-32],[180,30],[-185,-34]];
        const maskPos = [[-14,0],[14,0],[14,0],[-14,0]];
        const name = $systems.states.base[this._id];
        const dataBase = $loader.DATA2.HudsStates;
        const dataBase2 = $loader.DATA2.IconStates;
        //# data2\GUI\huds\states\SOURCE\images\stBar_hp.png
        const Bar = $objs.ContainerDN(dataBase,`stBar_${name}`,'Bar');
            Bar.d.anchor.set(...anchor[this._id]);
            Bar.n.anchor.set(...anchor[this._id]);
        //# data2\GUI\huds\states\SOURCE\images\stFrame_hp.png
        const Frame = $objs.ContainerDN(dataBase,`stFrame_${name}`,'Frame');
            Frame.position.set(...position[this._id])
            Frame.d.anchor.set(...anchor[this._id]);
            Frame.n.anchor.set(...anchor[this._id]);
        //# data2\System\states\SOURCE\images\st_hp.png
        const Icon = $objs.ContainerDN(dataBase2,`st_${name}`,'Icon');
            Icon.position.set(...iconPosition[this._id]);
            Icon.scale.set(0.4);
            Icon.d.anchor.set(0.5);
            Icon.n.anchor.set(0.5);
        //# Txt value 
        const TxtValue = new PIXI.Text('9999/9999',$systems.styles[0]);
            TxtValue.position.set(...TxtPosition[this._id]);
            TxtValue.anchor.set(0.5);
        const Mask = new PIXI.Sprite(PIXI.Texture.WHITE);
            Mask.width = 190/2; // full
            Mask.height = 55;
            Mask.anchor.set(...anchor[this._id]);
            Mask.position.set(...maskPos[this._id])
            Bar.d.mask = Mask; //todo: make renderer only on update hp with tween onUpdate
        //!end
        this.addChild(Bar,Frame,Mask,Icon,TxtValue);
        this.child = this.childrenToName();
    };
    //#endregion

    //#region [Method]
    /** refresh des valeur des states bar*/
    refresh(){//todo: animations
        const stateName = this._stateName;
        const max = this.source[stateName.toUpperCase()];
        const curr = this.source['_'+stateName.toUpperCase()];
        this.child.stateTxtValue.text =`${curr} \\ ${max}`;
        TweenLite.to(this.child.BarFillTop.scale, 0.4, { x:curr/max, ease:Power4.easeOut });
    };
    //#endregion
};























/**
 * @class creer les pinslots qui contien les pinOrbs et items 
 * @static */
class _StatesHud extends PIXI.Container {
    constructor(sourceID,x,y) {
        super();
        this.name = "StatesHud";
        /** source player group id */
        this._sourceID = sourceID;
        /** @type {{ Main:_objs.ContainerDN, CenterFrame:_objs.ContainerDN, HeadIcon:_objs.ContainerDN, XboxDir:_objs.ContainerDN, FrameState:_objs.ContainerDN, Bars:PIXI.Container, StatusContainer:PIXI.Container, stateTxtValue:PIXI.Text}} */
        this.child = {};
        /**@type {Array.<__StatesBar>} - Ref des Bar: [hp,mp,hg,hy]*/
        this.Bars = [];
        this.position.set(x,y);
        this.initialize();
    };
    //#region [GetterSetter]
    /**@returns {_battler} */
    get source() { return $players.group[this._sourceID] };
    //#endregion

    //#region [Initialize]
    initialize() {
        const dataBase  = $loader.DATA2.HudsStates;
        const dataBase2  = $loader.DATA2.IconStates;
        const dataBase3  = $loader.DATA2.HeadIcons;
        const dataBase4  = $loader.DATA2.XboxButonsHelper;
        //# data2/Hubs/states/SOURCE/images/hst_mainBG.png
        const Main = $objs.ContainerDN(dataBase,'hst_mainBG','Main');
        Main.d.anchor.set(0.5,0);
        Main.n.anchor.set(0.5,0);
        //# data2/Hubs/states/SOURCE/images/hst_centerInfoFrame.png
        /*const CenterFrame = $objs.ContainerDN(dataBase,'hst_centerInfoFrame','CenterFrame');
        CenterFrame.y = 25;
        CenterFrame.d.anchor.set(0.5,0);
        CenterFrame.n.anchor.set(0.5,0);
            //# data2/Icons/HeadIcons/SOURCE/images/hico_p0.png
            const HeadIcon = $objs.ContainerDN(dataBase3,'hico_p'+this._sourceID,'HeadIcon');
                HeadIcon.scale.set(0.6);
                HeadIcon.d.anchor.set(0.5);
                HeadIcon.n.anchor.set(0.5);
                HeadIcon.position.set(0,33);
                //# data2/System/xboxButtonHelper/SOURCE/images/xb_dir_8.png
                const XboxDir = $objs.ContainerDN(dataBase4,'xb_dir_8','XboxDir');
                XboxDir.scale.set(0.4);
                XboxDir.d.anchor.set(0.5);
                XboxDir.n.anchor.set(0.5);
                XboxDir.position.set(0,90);
        CenterFrame.addChild(XboxDir,HeadIcon);*/
        //!Frame basicStates
        const FrameStates = [];
        $systems.states.base.slice(4).forEach((stateName,i) => {
            const marge = 75*i;
            //# data2/Hubs/states/SOURCE/images/hst_rdnRec.png
            const FrameState = $objs.ContainerDN(dataBase,'hst_rdnRec','FrameState');
            FrameState.position.set(-225+marge,30);
            FrameState.d.anchor.set(0.5,1);
            FrameState.n.anchor.set(0.5,1);
                //# data2/system/states/SOURCE/images/st_atk.png
                const contextId = this.source.states[stateName];
                const State = $statesManager.getStateSprite(contextId,true); // get states.sprite
                State.scale.set(0.5);
                State.y = -50;
                //!current st value ._st
                const stateTxtValue = new PIXI.Text('???',$systems.styles[7]);
                stateTxtValue._stateName = stateName;
                stateTxtValue.name = 'stateTxtValue';
                stateTxtValue.anchor.set(0.5);
                stateTxtValue.position.set(0,-20);
            FrameState.addChild(State,stateTxtValue);
            FrameStates.push(FrameState);
        });
        //! bar Left
        const Bars = new PIXI.Container();
        Bars.name = "Bars";
        $systems.states.base.slice(0,4).forEach((stateName,i) => {
            //# data2/Hubs/states/SOURCE/images/hst_Bar_bg_top.png
            const otype = i%2?'bottom':'top';
            const isRight = i>1?-1:1;
            const Bar = new __StatesBar(stateName,i,this._sourceID,otype);
            Bar.scale.x = isRight;
            Bar.position.set(((-32+(otype==='bottom'?-25:0))*isRight),otype==='bottom'?34:10);
            this.Bars.push(Bar);
        });
        Bars.addChild(...this.Bars);
        Bars.children.reverse();// permet chevauchement top=bas
        Bars.y = 30;
        //!Status bar
        const StatusContainer = new PIXI.Container(); //todo:? peut etre une class avec des BG et des methods?
        StatusContainer.name = 'StatusContainer';
        StatusContainer.y = 100;
        //! end
        this.addChild(Main,...FrameStates,Bars,StatusContainer)//,statesContainer,hudStates_iconPlayer,statusContainer,status);
        this.child = this.childrenToName();
    };
    //#endregion

    //#region [Method]
    /** Affiche le state huds */
    show(){
        this.renderable = true;
    };


    /** refresh des valeur des states */
    refresh(){//todo: animations et separer hp,mp,hg,hy car diferent, bug dans les nom
        //!refresh valeur evo base ex:(atk)
        this.child.stateTxtValue.forEach(stateTxtValue => {
            const stateName = stateTxtValue._stateName;
            //todo: valeur effective + ou - this.source[stateName] permet une couleur? r,v
            stateTxtValue.text = this.source[stateName.toUpperCase()];
        });
        //!bar
        this.Bars.forEach(Bar => {
            Bar.refresh();
        });
        //!status bar
        // retrouve les ref status grace au contextId attacher a la source
        let negX = -60; // start point des status positif
        let posX = +60; // start point des status negatif
        const contextIds = [...this.source.puissanceOrbic,...this.source.faiblesseOrbic,...this.source.status].unique();
        for (let i=0, l=contextIds.length; i<l; i++) {
            const spriteState = $statesManager.getStateSprite(contextIds[i],true);
            const isNew = !spriteState.parent; // si nouveau vien apparait pour easing bouncing
            //Separer les state a connotation positive et negative <==>
            const isNeg = spriteState.Data._influenceType===_statesManager.influenceType.neg;

            TweenLite.to(spriteState, 0.6, { x:isNeg?negX:posX,y:5,rotation:Math.PI*2, ease: Power4.easeOut });
            isNew && TweenLite.fromTo(spriteState.scale, 1, { x:0,y:0 },{ x:0.4,y:0.4, ease: Elastic.easeOut.config(1.2, 0.4)});
            isNeg?negX-=45:posX+=45;
            this.child.StatusContainer.addChild(spriteState);
        };
    };
    //#endregion
};
   
