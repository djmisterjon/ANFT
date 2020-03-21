//TODO: TOUS REFACTORING POUR PERMETRE 2
//TODO: CREER UNE ESPACE TRAVAIL POUR HUDS
/**@class huds qui affiche les states p1 selon choix (toggle click)*/
class _Huds_States_players extends PIXI.Container {
    constructor(sourceId) {
        super();
        this._sourceId = sourceId;
        /** @type {{
         * 'CenterBg':ContainerDN, 'HeadIcon':ContainerDN, 'TxtLevelValue':PIXI.Text, 'StatesContainer':PIXI.Container, 'StatusContainer':PIXI.Container,
         * 'TxtStatesValue':Array.<PIXI.Text>, 'StateBar':Array.<_Huds_States_Bars>,  }} */
        this.child = null;
        /** indicateur si les states son afficher */
        this._showStatesMode = false;
        this.initialize();
    };
    //#region [GetterSetter]
    get Source() {
        return $players.group[this._sourceId];
    }
    //#endregion

    //#region [Initialize]
    initialize() {
        this.initialize_base();
        this.initialize_interactions();
        this.position.set([290,1640][this._sourceId],45); //45 90
    };

    initialize_base(){
        const dataBase = $loader.DATA2.HudsStates;
        const dataBase2 = $loader.DATA2.HeadIcons;
        const dataBase3 = $loader.DATA2.IconStates;
        //# data2\GUI\huds\states\SOURCE\images\stCenter.png
        const CenterBg = $objs.ContainerDN(dataBase,'stCenter').setName('CenterBg');
            CenterBg.d.anchor.set(0.5);
            CenterBg.n.anchor.set(0.5);
        //# data2\Icons\HeadIcons\SOURCE\images\hico_p0.png
        const HeadIcon = $objs.ContainerDN(dataBase2,`hico_p${this._sourceId}`).setName('HeadIcon');
            HeadIcon.scale.set(0.6);
            HeadIcon.d.anchor.set(0.5);
            HeadIcon.n.anchor.set(0.5);
        //# txt LV value
        const TxtLevelValue = new PIXI.Text('LV:99',$systems.styles[0]).setName('TxtLevelValue');
            TxtLevelValue.anchor.set(0.5);
            TxtLevelValue.position.set(0,-38);
        //# statesBar
        const STATESBARS = [];
        for (let i=0, l=4; i<l; i++) {
            const StateBar = new _Huds_States_Bars(i,this._sourceId).setName('StateBar')
            STATESBARS.push( StateBar );
        };
        //# statesIcons 
        const StatesContainer = new PIXI.Container().setName('StatesContainer');
            StatesContainer.position.set(-225,-75)
        for (let i=0,stateKeys = $systems.states.base, l=stateKeys.length; i<l; i++) {
            //# data2\System\states\SOURCE\images\st_atk.png
            const stName = stateKeys[i];
            const State = this.Source.states[stName]//.setName(stName); deja nomer
                State.scale.set(0.5);
                State.position.set(75*i,0);
            //# txt value
            const TxtStatesValue = new PIXI.Text('???',$systems.styles[0]).setName('TxtStatesValue');
                TxtStatesValue.anchor.set(0.5);
                TxtStatesValue.position.set(75*i,20);
            StatesContainer.addChild(State,TxtStatesValue);
        };
        //# Satus Container
        const StatusContainer = new PIXI.Container().setName('StatusContainer');
            StatusContainer.position.set(0,50)
        //!end
        this.addChild(STATESBARS[0],STATESBARS[2],CenterBg,STATESBARS[1],STATESBARS[3],HeadIcon,TxtLevelValue,StatesContainer,StatusContainer);
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
        if(e.isLeft){ this.toggleStatesMode(); };
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
    update(){
        //!states
        for (let i=0,stateKeys=$systems.states.base, l=stateKeys.length; i<l; i++) {
            const stName = stateKeys[i];
            const State = this.Source.states[stName];
            const TxtStatesValue = this.child.TxtStatesValue[i];
            const value = String(State.getReelValue());
            if(value !==TxtStatesValue.text){
                TxtStatesValue.text = String(value);
                gsap.fromTo(TxtStatesValue.scale, 0.3,{x:1.1,y:1.1}, {x:1,y:1});
            }
        };
        this.child.StateBar.forEach(StateBar => {
            StateBar.update();
        });

        //!status bar
        const list = Object.values(_statesManager.POOL).filter(State=>{
            return State.target === this.Source;
        })
        list.forEach((State,i) => {
            if(!State.parent){
                gsap.fromTo(State.scale, 1,{ x:0, y:0 },{ x:0.5, y:0.5, ease:Elastic.easeOut.config(1, 0.3) });
                State.x = 52*i;
                this.child.StatusContainer.addChild(State)
            }
        })
        // retrouve les ref status grace au contextId attacher a la source
        /*let negX = -60; // start point des status positif
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
        };*/
    };
    //#endregion
}
