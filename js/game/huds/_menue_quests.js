
class _Menue_Quests extends _Huds_Base {
    //#region [Static]
    /**@type {__QuestFilters} */
    static Quests_QuestFilters = null;
    /**@type {__QuestList} */
    static Quests_QuestList = null;
    /**@type {__QuestDescription} */
    static Quests_QuestDescription = null;
    //#endregion

    constructor(options) {
        super(options);
        
    };

    //#region [Initialize]
    initialize() {
        this.initialize_main();
        //this.initialize_tweens();
        //this.initialize_interactions();
        this.position.set(0,30);
    };
    
    /**build main frame */
    initialize_main(){
        const dataBase = $loader.DATA2.Menue_Quests;
         //# data2/Hubs/Quests/SOURCE/images/BgQuest.png
        const BgQuest = $objs.ContainerDN(dataBase,'BgQuest','BgQuest');
        // tous les class module relier
        const Quests_QuestFilters     = _Menue_Quests.Quests_QuestFilters     = new __QuestFilters     ();
        const Quests_QuestList        = _Menue_Quests.Quests_QuestList        = new __QuestList        ();
        const Quests_QuestDescription = _Menue_Quests.Quests_QuestDescription = new __QuestDescription ();

        this.addChild(BgQuest,Quests_QuestFilters.child.Master,Quests_QuestList.child.Master,Quests_QuestDescription.child.Master);
        this.child = this.childrenToName();
    };

    /** initialise tweens */
    initialize_tweens(){
        TweenMax.to(this.child.CircleTop  , 100, { rotation: Math.PI*2 , repeat:-1,ease: Power0.easeNone });
        TweenMax.to(this.child.CircleCenter, 100, { rotation:-Math.PI*2 , repeat:-1,ease: Power0.easeNone });
    };
    initialize_interactions() {
        this.interactive = true;
        this.on('pointerover'      , this._pointerover );
        this.on('pointerout'       , this._pointerout  );
        this.on('pointerdown'      , this._pointerdown );
        this.on('pointerup'        , this._pointerup   );
        this.on('pointerupoutside' , this._pointerup   );
    };
    //#endregion

    //#region [Interactive]
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    _pointerover(e) {

    };

    //#endregion
    
    //#region [Method]
    /**Affiche le huds */
    show(){
        this.renderable = true;
        this.update();
        //gsap.from(this.position, 2, {x:0,y:0, ease:Elastic.easeOut.config(1.2, 0.5)} );
        gsap.fromTo(this.scale, 1.5, {x:0,y:0,},{x:1,y:1, ease:Elastic.easeOut.config(1.2, 0.5)} );
    };
    hide(){

    };

    update(){
        _Quests.update(); // ont fait une pass update des quest pool
        _Menue_Quests.Quests_QuestList.update();
    };
    //#endregion
};


class __QuestFilters {
    //#region [Static]
    static _activeFilter_G = null;
    static _activeFilter_P = null;
    //#endregion

    constructor() {
        this.name = "_Quests_QuestFilters";
        /** @type {{ 'Master':PIXI.Container, 
         * 'BG_filters':ContainerDN, 'Bar_top':ContainerDN, 'Btn_filter':ContainerDN, 'Bar_bottom':ContainerDN, 
         * 'BG_recFilter':Array.<ContainerDN>, }} */
        this.child = null;
        this.initialise();
    };

    //#region [Initialize]
    initialise(){
        this.initialise_base();
        this.child.Master.position.set(260,85);
    };
    initialise_base(){
        const dataBase = $loader.DATA2.Menue_Quests;
        const Master = new PIXI.Container().setName('Master');
        //# data2/Hubs/Quests/SOURCE/images/bg_filterPlanetGalax.png
        const BG_filters = $objs.ContainerDN(dataBase,'bg_filterPlanetGalax','BG_filters');
            BG_filters.d.anchor.set(0.5);
            BG_filters.n.anchor.set(0.5);
        //# data2/Hubs/Quests/SOURCE/images/barSF_top.png
        const Bar_top = $objs.ContainerDN(dataBase,'barSF_top','Bar_top');
            Bar_top.position.set(0,-70);
            Bar_top.d.anchor.set(0.5);
            Bar_top.n.anchor.set(0.5);
            //# data2/Hubs/Quests/SOURCE/images/button_filters.png
            const Btn_filter = $objs.ContainerDN(dataBase,'button_filters','Btn_filter');
                Btn_filter.position.set(0,-20);
                Btn_filter.d.anchor.set(0.5);
                Btn_filter.n.anchor.set(0.5);
        Bar_top.addChild(Btn_filter);
        //# data2/Hubs/Quests/SOURCE/images/barSF_bottom.png
        const Bar_bottom = $objs.ContainerDN(dataBase,'barSF_bottom','Bar_bottom');
            Bar_bottom.position.set(0,65);
            Bar_bottom.d.anchor.set(0.5);
            Bar_bottom.n.anchor.set(0.5);
        //! FILTERS GALAXI PLANETS
        const BtnFilters_Container = new PIXI.Container();
        BtnFilters_Container.position.set(-200,-34)
        for (let i=0,x=0,y=0, l=14; i<l; i++) {
            //# data2/Hubs/Quests/SOURCE/images/filters_BgRec_pg.png
            const BG_recFilter = $objs.ContainerDN(dataBase,'filters_BgRec_pg','BG_recFilter');
                BG_recFilter.position.set(x,y);
                BG_recFilter.d.anchor.set(0.5);
                BG_recFilter.n.anchor.set(0.5);
            BtnFilters_Container.addChild(BG_recFilter);
            if(i===6){
                x = 0;
                y+=69;
            }else{
                x+=65;
            }
        };
        //!end
        Master.addChild(BG_filters,Bar_top,Bar_bottom,BtnFilters_Container);
        this.child = Master.childrenToName();
    };
    //#endregion
};

/** Section navigation avec les quests list en detail */
class __QuestList {
    constructor() {
        this.name = "_Quests_QuestList";
        /** @type {{ 'Master':PIXI.Container, 
         * 'BG_blue':ContainerDN, 'BG_frame':ContainerDN, 'Corner':Array.<ContainerDN>, 'Btn_sortBy':ContainerDN, 
         * '__QuestSlots':Array.<__QuestSlots>, }} */
        this.child = null;
        this.initialise();
    };

    //#region [Initialize]
    initialise(){
        this.initialise_base();
        this.initialise_interactive();
        this.child.Master.position.set(10,210);
    };
    initialise_base(){
        const dataBase = $loader.DATA2.Menue_Quests;
        const Master = new PIXI.Container().setName('Master');
        //# data2/Hubs/Quests/SOURCE/images/BgQuestBleue.png
        const BG_blue = $objs.ContainerDN(dataBase,'BgQuestBleue','BG_blue');
        //# data2/Hubs/Quests/SOURCE/images/BgQuestBleue_frame.png
        const BG_frame = $objs.ContainerDN(dataBase,'BgQuestBleue_frame','BG_frame');
            BG_frame.position.set(-10,-10);
            //! Corners Frame
            for (let i=0,xy=[[40,40],[780,800],[800,10],[0,800]], l=xy.length; i<l; i++) {
                //# data2/Hubs/Quests/SOURCE/images/PadFrame_0.png
                const pos = xy[i];
                const Corner = $objs.ContainerDN(dataBase,`PadFrame_${i}`,'Corner');
                    Corner.d.anchor.set(0.5);
                    Corner.n.anchor.set(0.5);
                Corner.position.set(...pos);
                BG_frame.addChild(Corner);
            };
            //# data2/Hubs/Quests/SOURCE/images/QuestSortBy.png
            const Btn_sortBy = $objs.ContainerDN(dataBase,'QuestSortBy','Btn_sortBy');
                Btn_sortBy.position.set(410,0);
                Btn_sortBy.d.anchor.set(0.5);
                Btn_sortBy.n.anchor.set(0.5);
            BG_frame.addChild(Btn_sortBy);

            //! create le slots pour tous le jeux (dans un pool)
            const QuestSlotsContainers = new PIXI.Container().setName("QuestSlotsContainers"); //TODO: VOIR POUR AJOUTER UN CONTAINER MASK pour le sliders
                QuestSlotsContainers.y = 30;
            for (let i=0,Keys=Object.keys($data_quest), l=Keys.length; i<l; i++) {
                const _questId = Keys[i];
                QuestSlotsContainers.addChild(new __QuestSlots(_questId));
            };
        //!end
        Master.addChild(BG_blue,BG_frame,Btn_sortBy,QuestSlotsContainers);
        this.child = Master.childrenToName();
    };

    initialise_interactive(){

    };
    //#endregion
    
    update(){
        const QuestSlots = this.child.__QuestSlots;
        for (let i=0, l=QuestSlots.length; i<l; i++) { // mise a jours selon les quest decouvert
            QuestSlots[i].update();
        };
        const List = QuestSlots.filter(c=>c._discovered);
        //todo: filter selon galaxi
        //todo: filter selon planet
        //todo: sorterBy name,progress,type,recomanderLevel,from,rewardExtra
        //# position
        for (let i=0,m=110, l=List.length; i<l; i++) {
            const QuestSlot = List[i];
            QuestSlot.position.y = m*i;
        };
    };
};


/** Ce sont les quests a gauche dans la list des filters */
class __QuestSlots extends PIXI.Container {
    constructor(_questId) {
        super();
        this.name = "__QuestSlots";
        this._questId = _questId;
        /** indicateur cache si quest connext a eter decouvert et affiche pour la premier fois */
        this._discovered = false;
        /** @type {{ 'QuestSlot_BG':ContainerDN, 'QuestSlot_Frame':ContainerDN, 'QuestSlot_Planet':ContainerDN, 'QuestSlot_Txt_title':_motionsTxt, }} */
        this.child = null;
        this.initialise_base();
        this.initialise_interactive();
    };

    //#region [Initialize]
    initialise_base(){
        const dataBase = $loader.DATA2.Menue_Quests;
        //# data2/Hubs/Quests/SOURCE/images/Bg_QuestSlot_L.png
        const QuestSlot_BG = $objs.ContainerDN(dataBase,'Bg_QuestSlot_L','QuestSlot_BG');
        //# data2/Hubs/Quests/SOURCE/images/selecto_quests_L.png
        const QuestSlot_Frame = $objs.ContainerDN(dataBase,'selecto_quests_L','QuestSlot_Frame');
            QuestSlot_Frame.x = 10;
        //# data2/Hubs/Quests/SOURCE/images/pln-10.png
        const QuestSlot_Planet = $objs.ContainerDN(dataBase,'pln-10','QuestSlot_Planet');
        //# txt Title
        const QuestSlot_Txt_title = $texts.MotionsTxt(this._questId+'n').setName('QuestSlot_Txt_title');//.setName('QuestSlot_Txt_title');
            QuestSlot_Txt_title.x = 25;
        //!end slot
        this.addChild(QuestSlot_BG,QuestSlot_Frame,QuestSlot_Planet,QuestSlot_Txt_title);
        this.child = this.childrenToName();

    };
    initialise_interactive(){
        this.interactive = true;
        this.on('pointerover' , this.pointerover_QuestSlotsContainer , this);
        this.on('pointerout'  , this.pointerout_QuestSlotsContainer  , this);
        this.on('pointerup'   , this.pointerup_QuestSlotsContainer   , this);
    };
    //#endregion

    //#region [Interactive]
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerover_QuestSlotsContainer(e) {
       const QuestSlot_Frame = this.child.QuestSlot_Frame;
       const QuestSlot_BG = this.child.QuestSlot_BG;
       QuestSlot_Frame.d.filters = [$systems.PixiFilters.OutlineFilterx4white];
       QuestSlot_BG.d.blendMode = 1;
    };
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerout_QuestSlotsContainer(e) {
        const QuestSlot_Frame = this.child.QuestSlot_Frame;
        const QuestSlot_BG = this.child.QuestSlot_BG;
        QuestSlot_Frame.d.filters = null;
        QuestSlot_BG.d.blendMode = 0;
    };
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerup_QuestSlotsContainer(e) {
        _Menue_Quests.Quests_QuestDescription.show(this._questId)
        
    };
    //#endregion

    update(){
        const discovered = this._discovered || !!_Quests.poolKey[this._questId];
        // si decouvert, mais premier update, ajouter un FX pour focus, qui disparaitra au premier click (visite)
        if(discovered && !this._discovered){
            this._discovered = true;
            //todo: filters de focus ? border ? ou blending
        };
        this.renderable  = discovered;
        this.visible     = discovered;
        this.interactive = discovered;
        //QuestContainer.alpha = 0.8; //todo: si complette
        //si discover, on peut afficher le text
        //!update les text motions
        this.child.QuestSlot_Txt_title.startMotion();
    };

};


class __QuestDescription {
    //#region [Static]
    /** Le quest id en cours de desciptions */
    static _questId = '';
    //#endregion

    constructor() {
        this.name = "_QuestDescription";
        /** @type {{ 'Master':PIXI.Container, 'BarDesc_top':ContainerDN, 'BarDesc_bottom':ContainerDN,
         * 'BarReward_top':ContainerDN, 'BarReward_bottom':ContainerDN, 'RewardContainer':PIXI.Container,  
         * '_SubQuest':Array.<__SubQuest>,
         * '_Reward':Array.<__Reward>,
         * 'TxtQuest_title':PIXI.Text, 'TxtQuest_intro':PIXI.Text, }} */
        this.child = null;
        this.initialise();
    };

    //#region [GetterSetter]
    get questId() { return __QuestDescription._questId };
    set questId(id) { __QuestDescription._questId = id };
    //#endregion

    //#region [Initialize]
    initialise(){
        this.initialise_base();
        this.child.Master.position.set(1300,0);
    };
    initialise_base(){
        const dataBase = $loader.DATA2.Menue_Quests;
        const Master = new PIXI.Container().setName('Master');
        //# data2/Hubs/Quests/SOURCE/images/barQname_top.png
        const BarDesc_top = $objs.ContainerDN(dataBase,'barQname_top','BarDesc_top');
            BarDesc_top.d.anchor.set(0.5);
            BarDesc_top.n.anchor.set(0.5);
        //# data2/Hubs/Quests/SOURCE/images/barQname_bottom.png
        const BarDesc_bottom = $objs.ContainerDN(dataBase,'barQname_bottom','BarDesc_bottom');
            BarDesc_bottom.position.set(0,32);
            BarDesc_bottom.d.anchor.set(0.5);
            BarDesc_bottom.n.anchor.set(0.5);
        //# barTop background
        const BarDesc_bg = new PIXI.Sprite(PIXI.Texture.WHITE);
            BarDesc_bg.parentGroup = $displayGroup.DiffuseGroup
            BarDesc_bg.width = BarDesc_top.d.width-30;
            BarDesc_bg.height = BarDesc_top.d.height-5;
            BarDesc_bg.anchor.set(0.5,0);
            BarDesc_bg.position.set(0,-15);

        //# Txt quest Title
        const TxtQuest_title = new PIXI.Container().setName('TxtQuest_title');
            TxtQuest_title.position.set(0,0);
        //# Txt quest intro
        const TxtQuest_intro = new PIXI.Container().setName('TxtQuest_intro');
            TxtQuest_intro.position.set(-415,55);
        //!SUBQUESTS
        const SubQuests = new PIXI.Container().setName('SubQuestsContainer');
            SubQuests.position.set(0,230);
        for (let i=0, l=7; i<l; i++) {
            SubQuests.addChild(new __SubQuest(i));
            SubQuests.children[i].position.y = 150*i;
        };
        //!REWARDS
        const RewardContainer = new PIXI.Container().setName('RewardContainer');
            RewardContainer.position.set(0,975);
        //# data2/Hubs/Quests/SOURCE/images/barQReward_top.png
        const BarReward_top = $objs.ContainerDN(dataBase,'barQReward_top','BarReward_top');
            BarReward_top.position.set(0,-65);
            BarReward_top.d.anchor.set(0.5,0.2);
            BarReward_top.n.anchor.set(0.5,0.2);
        //# txt
        const Txt_rewardTitle = new PIXI.Text('EXTRA COMPLETTE: 200XP 200GOLD',$systems.styles[0]);
            Txt_rewardTitle.anchor.set(0.5);
            Txt_rewardTitle.pivot.y = 85;
        //# data2/Hubs/Quests/SOURCE/images/barQReward_bottom.png
        const BarReward_bottom = $objs.ContainerDN(dataBase,'barQReward_bottom','BarReward_bottom');
            BarReward_bottom.position.set(0,45);
            BarReward_bottom.d.anchor.set(0.5);
            BarReward_bottom.n.anchor.set(0.5);
        //# white background reward
        const RewardContainerBg = new PIXI.Sprite(PIXI.Texture.WHITE).setName('RewardContainerBg'); // todo
        for (let i=0,xx=100, l=7; i<l; i++) {
            RewardContainer.addChild(new __Reward(i));
            RewardContainer.children[i].position.x = (xx/2+(-xx*l)/2)+xx*i;
        };
        RewardContainer.addChild(RewardContainerBg,BarReward_top,BarReward_bottom,Txt_rewardTitle);

        //!END
        Master.addChild(BarDesc_bg,BarDesc_top,BarDesc_bottom,TxtQuest_title,TxtQuest_intro,SubQuests,RewardContainer);
        this.child = Master.childrenToName();
    };
    //#endregion

    /** Setup section droite descriptions */
    setup(questId){
        this.clear();
        this.questId = questId;
        this.setup_TitlesDescriptions ();
        this.setup_SubQuests ();
        this.setup_SubRewards();
    };

    setup_TitlesDescriptions(){
        const TxtQuest_title = this.child.TxtQuest_title;
        const TxtQuest_intro = this.child.TxtQuest_intro;
        const txtTitle = _Texts.Quests[this.questId].title2;
        const txtTitleDesc = _Texts.Quests[this.questId].titleDesc;
            TxtQuest_title.addChild(txtTitle);
            TxtQuest_intro.addChild(txtTitleDesc);
            TxtQuest_title.pivot.set(TxtQuest_title.width/2,TxtQuest_title.height/2);
    };
    setup_SubQuests(){
        this.child._SubQuest.forEach(SubQuest => {
            SubQuest.setup()
        });
        for (let i=0,y=0, SubQuests = this.child._SubQuest.filter(q=>q.renderable), l=SubQuests.length; i<l; i++) {
            const subQuest = SubQuests[i];
            subQuest.y = y;
            y+= subQuest.height;
        };
            
    };
    setup_SubRewards(){
        this.child._Reward.forEach(Reward => {
            Reward.setup();
        });
        for (let i=0,xx=100,Rewards = this.child._Reward.filter(r=>r.renderable), l=Rewards.length; i<l; i++) {
            const Reward = Rewards[i];
            Reward.position.x = (xx/2+(-xx*l)/2)+xx*i;
        };
    };

    show(questId){
        questId && this.setup(questId);
        //! show Tile and desc motions
        const txtTitle = _Texts.Quests[this.questId].title2;
        const txtTitleDesc = _Texts.Quests[this.questId].titleDesc;
        txtTitle.show(true);
        txtTitleDesc.show(true);
        //!subQuest
        const tlQ = gsap.timeline({id:"showSubQuest"});
        this.child._SubQuest.filter(q=>q.renderable).forEach((SubQuest,i) => {
            tlQ.add(SubQuest.show(),i/5);
        });
        const tlR = gsap.timeline({id:"showRewards"});
        tlR.fromTo(this.child.BarReward_top, 0.2, {y:0},{y:-65, ease: Back.easeOut.config(1.7)})
        tlR.fromTo(this.child.BarReward_bottom, 0.3, {y:0},{y:45, ease: Back.easeOut.config(1.7)},0.1)
        this.child._Reward.filter(r=>r.renderable).forEach((Reward,i) => {
            tlR.add(Reward.show(),i/10);
        });
       // const QuestList = this.child._SubQuest.filter(c=>c.renderable);
       // //!QUEST
       // for (let i=0, l=QuestList.length; i<l; i++) {
       //     const subQuest = QuestList[i];
       //     subQuest.show(i/QuestList.length);
       // };
       // //!REWARD
       //gsap.fromTo(this.child.BarReward_top.position, {y:0}, {y:-60});
       //gsap.fromTo(this.child.BarReward_bottom.position, {y:0}, {y:40});
    };

    clear(){
        const tl = gsap.getById("showSubQuest");
        tl && tl.kill();
        const TxtQuest_title = this.child.TxtQuest_title;
        const TxtQuest_intro = this.child.TxtQuest_intro;
        TxtQuest_title.removeChildren();
        TxtQuest_intro.removeChildren();
        if(this.questId){
            const txtTitle = _Texts.Quests[this.questId].title2;
            const txtTitleDesc = _Texts.Quests[this.questId].titleDesc;
            txtTitle.clear();
            txtTitleDesc.clear();
        }
        for (let i=0,l=7; i<l; i++) {
            this.child._SubQuest[i].clear();
        }
        this._questId = null;
    };
};



/** Ce sont les 3 containers SubQuest a droite dans QuestDescription */
class __SubQuest extends PIXI.Container {
    constructor(id) {
        super();
        this.name = "_SubQuest";
        /** @type {{ Master:PIXI.Container,'SubQuest_bg':ContainerDN, 'SubQuest_BarL':ContainerDN, 'SubQuest_BarR':ContainerDN, 'SubQuest_check':ContainerDN, 'QuestStuffContainer':PIXI.Container, }} */
        this.child = null;
        /** id array */
        this._id = id;
        this._sizeType = _Data_Quests.sizeType.m; // default medium size
        this.initialise_base();
    };

    //#region [GetterSetter]
    get questId() { return __QuestDescription._questId };
    set questId(id) { __QuestDescription._questId = id };
    get Quest() { return _Quests.poolKey[this.questId] };
    get dataQuest(){ return this.Quest && this.Quest.DataQuest };
    //#endregion

    //#region [Initialize]
    initialise_base(){
        const dataBase = $loader.DATA2.Menue_Quests;
        const Master = new PIXI.Container().setName('Master');
        //# data2/Hubs/Quests/SOURCE/images/BgSubQuest.png
        const SubQuest_bg = $objs.ContainerDN(dataBase,'BgSubQuest','SubQuest_bg');
        SubQuest_bg.d.anchor.set(0.5,0);
        SubQuest_bg.n.anchor.set(0.5,0);
       //# data2/Hubs/Quests/SOURCE/images/barQDescrip_L.png
       const SubQuest_BarL = $objs.ContainerDN(dataBase,'barQDescrip_L','SubQuest_BarL');
           SubQuest_BarL.position.set(-390,55);
           SubQuest_BarL.d.anchor.set(0.5);
           SubQuest_BarL.n.anchor.set(0.5);
       //# data2/Hubs/Quests/SOURCE/images/barQDescrip_R.png
       const SubQuest_BarR = $objs.ContainerDN(dataBase,'barQDescrip_R','SubQuest_BarR');
           SubQuest_BarR.position.set(390,55);
           SubQuest_BarR.d.anchor.set(0.5);
           SubQuest_BarR.n.anchor.set(0.5);
       //# data2/Hubs/Quests/SOURCE/images/checkBox_0.png
       const SubQuest_check = $objs.ContainerDN(dataBase,'checkBox_0','SubQuest_check');
           SubQuest_check.position.set(-415,65);
           SubQuest_check.d.anchor.set(0.5);
           SubQuest_check.n.anchor.set(0.5);
       //# Container stuff, on creer et place tous dans ce container, et permet un clear facil
       const QuestStuffContainer = new PIXI.Container().setName('QuestStuffContainer');
            QuestStuffContainer.position.set(-390,0)
        //!end
        Master.addChild(SubQuest_bg,SubQuest_BarL,SubQuest_BarR);
        this.addChild(Master,QuestStuffContainer,SubQuest_check);
        this.child = this.childrenToName();
    };
    //#endregion

    /** @returns {GSAPStatic.Timeline} anime un slot subQuest et return sa timeLine*/
    show(){
        const SubQuest_BarL = this.child.SubQuest_BarL
        const SubQuest_BarR = this.child.SubQuest_BarR
        const SubQuest_bg = this.child.SubQuest_bg
        const QuestStuffContainer = this.child.QuestStuffContainer
        _Texts.Quests[this.questId].quest[this._id].startMotion();
        const tl = gsap.timeline();
        tl.fromTo(SubQuest_BarL, 0.5, {x:0}, {x:-390},0); //todo: zero()
        tl.fromTo(SubQuest_BarR, 0.5, {x:0}, {x:390},0); //todo: zero()
        tl.fromTo(SubQuest_bg.scale, 0.5, {x:0}, {x:1},0.1);
        tl.fromTo(QuestStuffContainer, 0.5, {alpha:0}, {alpha:1}, 0.1);
        return tl;        
    };

    /**@param {DataQuest["subQuest"][any]} subQuest */
    setup(){
        this.clear();
        const dataQuest = this.dataQuest;
        const subQuest = dataQuest && dataQuest.subQuest[this._id];
        if(subQuest){ // dispatch et construit les subQuest selon les types disponible
            this._sizeType = subQuest.sizeType;
            switch (subQuest.type) {
                case _Data_Quests.questType.ITEM:
                    this.setupType_item(subQuest);
                break;
                case _Data_Quests.questType.SWITCH:
                    this.setupType_switch(subQuest);
                break;
                default:
                    break;
            }
        }

    };
    /** Resize quests selon _dataQuests sizeType*/
    resizeQuest(sizeType){
        if(this._sizeType !== sizeType ){
            const Master    = this.child.Master   ;
            switch (sizeType) {
                case _Data_Quests.sizeType.s: Master.scale.y = 0.5; break;
                case _Data_Quests.sizeType.m: Master.scale.y = 1  ; break;
                case _Data_Quests.sizeType.l: Master.scale.y = 2  ; break;
                default:break;
            };
        };
    };

    /**@param {DataQuest["subQuest"][any]} subQuest setup du slotQuest pour le type item */
    setupType_item(subQuest){
        const Master    = this.child.Master   ;
        const QuestStuffContainer = this.child.QuestStuffContainer;
        const param    = subQuest.param;
        const sizeType = subQuest.sizeType;
        const type     = subQuest.type;
        // Les type item affiche un text et un lot items en bas
        Master.scale.y = sizeType;
        this.renderable = true;
        //! description
        const subQuestDesc =  _Texts.Quests[this.questId].quest[this._id];
        //! items
        const containerItems = new PIXI.Container();
        Object.entries(param).forEach((entrie,i) => {
            const itemId = entrie[0];
            const itemNeedQty = entrie[1];
            const itemPossed = $items.itemPossed[+itemId]||0;
            const Item = $items.Items[itemId].createSprite();
            const totalString = `${Math.min(itemPossed,itemNeedQty)} / ${itemNeedQty}`;
            const totalTxt = new PIXI.Text(totalString, $systems.styles[2]);
            totalTxt.anchor.set(0.5);
            Item.x+=100*i;
            totalTxt.x+=100*i;
            containerItems.addChild(Item,totalTxt);
        });
        containerItems.pivot.set(containerItems.width/2,0);
        containerItems.position.set(415,120*this._sizeType)
        QuestStuffContainer.addChild(containerItems,subQuestDesc);
    };

     /**@param {DataQuest["subQuest"][any]} subQuest setup du slotQuest pour le type item */
     setupType_switch(subQuest){
        const Master    = this.child.Master   ;
        const QuestStuffContainer = this.child.QuestStuffContainer;
        const param    = subQuest.param;
        const sizeType = subQuest.sizeType;
        const type     = subQuest.type;
        // Les type item affiche un text et un lot items en bas
        Master.scale.y = sizeType;
        this.renderable = true;
        //! description
        const subQuestDesc =  _Texts.Quests[this.questId].quest[this._id];
        QuestStuffContainer.addChild(subQuestDesc);
    };

    clear(){
        this.questId && this._id<_Texts.Quests[this.questId].quest.length && _Texts.Quests[this.questId].quest[this._id].clear();
        this.renderable = false;
        this.child.QuestStuffContainer.removeChildren();
    };

};

/** Slot reward */
class __Reward extends PIXI.Container {
    constructor(id) {
        super();
        this.name = "_Reward";
        /** @type {{ 'Reward':ContainerDN, 'BB':, 'CC':, 'DD':, 'EE':, 'FF':, }} */
        this.child = null;
        /** id array */
        this._id = id;
        this.initialise_base();
    };
        //#region [GetterSetter]
        get questId() { return __QuestDescription._questId };
        set questId(id) { __QuestDescription._questId = id };
        get Quest() { return _Quests.poolKey[this.questId] };
        get Rewards() { return _Quests.poolKey[this.questId].DataQuest.rewardsType[this._id] };
        //#endregion

        //#region [Initialize]
        initialise_base(){
            const dataBase = $loader.DATA2.Menue_Quests;
            //# data2/Hubs/Quests/SOURCE/images/Bonus-XP.png
            const Reward = $objs.ContainerDN(dataBase,'Bonus-XP','Reward');
                Reward.d.anchor.set(0.5);
                Reward.n.anchor.set(0.5);
            //!end
            this.addChild(Reward);
            this.child = this.childrenToName();
        };
        //#endregion

    setup(){
        this.clear();
        const Rewards = this.Rewards;
        if(Rewards){
            this.renderable = true;
            this.alpha = this.Quest._rewardTake.indexOf(this._id)>-1? 0.3 :1; // si le reward a eter pris ?
            this.swapTextureFromType();
            switch (Rewards.type) {
                case _Data_Quests.rewardType.xp  : this.setupType_xp (); break;
                case _Data_Quests.rewardType.atk : this.setupType_atk(); break;
                case _Data_Quests.rewardType.def : this.setupType_def(); break;
                case _Data_Quests.rewardType.sta : this.setupType_sta(); break;
                case _Data_Quests.rewardType.int : this.setupType_int(); break;
                case _Data_Quests.rewardType.mor : this.setupType_mor(); break;
                case _Data_Quests.rewardType.hp  : this.setupType_hp (); break;
                case _Data_Quests.rewardType.mp  : this.setupType_mp (); break;
                case _Data_Quests.rewardType.hg  : this.setupType_hg (); break;
                case _Data_Quests.rewardType.hy  : this.setupType_hy (); break;
                    
                
                default:
                    break;
            }
        };
    };

    show(){
        const tl = gsap.timeline();
        tl.fromTo(this, 3, {rotation:Math.PI}, {rotation:0,ease:Elastic.easeOut.config(1, 0.3)},0);
        tl.fromTo(this.scale, 1, {x:0,y:0}, {x:1,y:1,ease:Elastic.easeOut.config(1, 0.3)},0);
        return tl;    
    };

    /**Swap la texture du reward selon le type */
    swapTextureFromType(type = this.Rewards.type){
        const dataBase = $loader.DATA2.Menue_Quests;
        const affix = type.toUpperCase();
        const affix_n = type.toUpperCase() + '_n';
        this.child.Reward.d.texture = dataBase.textures[`Bonus-${affix}`];
        this.child.Reward.n.texture = dataBase.textures[`Bonus-${affix_n}`];
    };

    clear(){
        this.renderable = false;
    };

    setupType_xp (){

    };
    setupType_atk(){

    };
    setupType_def(){

    };
    setupType_sta(){

    };
    setupType_int(){

    };
    setupType_mor(){

    };
    setupType_hp (){

    };
    setupType_mp (){

    };
    setupType_hg (){

    };
    setupType_hy (){

    };
};















/** les quest active en jeux */
class _Quests {
    //#region [Static]
    /** @type {Array.<_Quests>} */
    static pool = [];
    static poolComplette = [];
    /** @type {Object.<string, _Quests>} - List id des quests trouver*/
    static poolKey = {};

    /**@param {string} questId - id d'un dataQuest existant (renvoi erreur si existe pas)*/
    static add(questId){
        if(!this.poolKey[questId]){
            if(!$data_quest[questId]){ return console.error(questId, 'existe pas dans $data_quest !',$data_quest) }
            new this($data_quest[questId]);
        }else{
            console.error(questId, 'est deja registered')
        };
    };
    static update(){
        for (let i=0, l=this.pool.length; i<l; i++) {
            this.pool[i].update();
        };
    };
    //#endregion
    /**@param {DataQuest} DataQuest */
    constructor(DataQuest) { 
        this._questId = DataQuest._questId;
        this._progress = -1;
        this._rewardTake = [];
        this._pinnedToHud = false; // si pinned , permet detre afficher generate texture, en jeux et aussi sur map
        this.initialize();
       _Quests.pool.push(this);
       _Quests.poolKey[this._questId] = this;
       this.onCreate();
    };

    /**@returns {DataQuest} - Return les data original du _questId*/
    get DataQuest() { return $data_quest[this._questId] };

    //#region [Initialize]
    initialize(){
    };
    //#endregion


    onCreate(){
       if($gui.MessageIndicator){
            $gui.MessageIndicator.add(_Huds_MessageIndicator.TYPE.QUEST, this._questId);
       }
    };
    update(){
 
    };
};

/**
* @typedef {Object} DataQuest DESCRIPTIONS
* @property {string} DataQuest._questId descriptions
* @property {Number} DataQuest._type - DB.type
* @property {Number} DataQuest._rLevel - level recomander
* @property {Number} DataQuest._extraRewardXp - extra xp lorsque tous les subQuest complette
* @property {Number} DataQuest._extraRewardGold - extra gold lorsque tous les subQuest complette
* @property {Array.<dataReward>} DataQuest.rewardsType - progression des subQuest
* @property {Array.<dataSubQuest>} DataQuest.subQuest - list des subQuest
* */

/** test */
class _Data_Quests {
    static rewardType = {
        xp:'xp',hp:'hp',mp:'mp',hg:'hp',hy:'mp',atk:'atk',def:'def',int:'int',mor:'mor',sta:'sta',
        item:'item',
        recipe:'recipe',
        dice:'dice',
        quest:'quest',
        cbook:'cbook',
        unknow:'unknow',
    };
    static questType = {
        ITEM:0,
        SWITCH:1,
        CASE:2,
    };
    
    static sizeType = {
        s:0.5,
        m:1,
        l:2,
        xl:3,
    };

    static questMode = {
        story:0,
        secondary:1,
    };
    constructor() {

    };
    //#region [Initialize]
    initialise(option){
        this.initialize_base();
        this.initialize_data();
    };
    /** Ini les bases des quests */
    initialize_base(){
        const rewardType = _Data_Quests.rewardType;
        const questType  = _Data_Quests.questType ;
        const sizeType   = _Data_Quests.sizeType  ;
        const questMode  = _Data_Quests.questMode ;
        const createReward = this.createReward;
        const createQuest  = this.createQuest ;

        /**@type DataQuest */
        this.theOrbsQuests = {
            _questId:'theOrbsQuests',
            _type:questMode.story,
            _rLevel:1,
            _extraRewardXp:15,
            _extraRewardGold:15,
            subQuest:[
                createQuest(questType.ITEM, { 1:1, 2:1, 3:1, 4:1, 5:1, 6:1, 7:1 }, sizeType.l ),
            ],
            rewardsType:[
                createReward(rewardType.xp),
            ],
        };
        /**@type DataQuest */
        this.AncienPortalAnubis = {
            _questId:'AncienPortalAnubis',
            _type:questMode.story,
            _rLevel:1,
            _extraRewardXp:15,
            _extraRewardGold:15,
            subQuest:[
                createQuest(questType.ITEM, { 3:1, 4:1, 5:1, 6:4, 7:1 }, sizeType.m ),
                createQuest(questType.ITEM, { 10:1 }, sizeType.m ),
                createQuest(questType.SWITCH, $Switchs.stargate1_operationel, sizeType.m ),
            ],
            rewardsType:[
                createReward(rewardType.xp),
                createReward(rewardType.hp),
                createReward(rewardType.mp),
                createReward(rewardType.xp),
                createReward(rewardType.xp),
                createReward(rewardType.xp),
                createReward(rewardType.xp),
            ],
        };
    };

    /** Ini les data quest selon les options , mode jeux... */
    initialize_data(){
        //DELETEME: DEBUG QUEST HUDS ONLY
        //TODO: generation aleatoir? + penser au loading

    };
    //#endregion

// {Array.<{type:number,param:{},sizeType:number=DB.sizeType.m}>} DataQuest.subQuest - list des subQuest


    /**
    * @typedef {Object} dataSubQuest - Les data des subQuest
    * @property {number} dataSubQuest.type - _Data_Quests.questType
    * @property {{}|[]|function} dataSubQuest.param - descriptions
    * @property {number} dataSubQuest.sizeType - _Data_Quests.sizeType */
    /** creer un quest 
     * @returns {dataSubQuest}
    */
    createQuest(type,param,sizeType){
        return {type,param,sizeType};
    };

    /**
    * @typedef {Object} dataReward - Les data des reward
    * @property {string} dataReward.type - _Data_Quests.rewardType
    * @property {{}|[]} dataReward.param - descriptions */
    /** creer un quest 
     * @returns {dataReward}
    */
    createReward(type,param){
        return {type,param};
    };
  


};
const $data_quest = new _Data_Quests();
