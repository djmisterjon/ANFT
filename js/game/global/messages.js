/** Les events sont sois appeller directement, sois apeller sur un update */
class _Messages{ //TODO: RENDU ICI , REMASTERISER LE MESSAGE AVEC TEXT CACHE
    /** @type {Object.<string, Array>} - Stock les items description cache */
    static POOLDATA = {};
    /** @type {Object.<string, _motionsTxt>} - Stock les items description cache */
    static POOL = {};

    constructor() {
        /**@type {PIXI.Container} - Container pour afficher le mode cine sur le Stage */
        this.CineContainer = null;
        this._currentPage = -1;
        this._totalPage = 0;
        /**Le id actuel de la cible qui parle */
        this._targetId = '';
        /** le id actuel du message en cour */
        this._currentId = '';
        /** pa index actuel */
        this._currentPageId = 0;
        /** @type {{
         * 'MasterContainer':PIXI.projection.Container3d, 
         * 'ContainerButtons':PIXI.projection.Container3d,
         * 'MessageRenderContainer':PIXI.Container,
         * 'ButtonsL':ContainerDN, 
         * 'ButtonsL_xb':ContainerDN, 
         * 'ButtonsR':ContainerDN, 
         * 'ButtonsR_xb':ContainerDN, 
         * 'ButtonsClose_xb':ContainerDN,
         * 'MessageBubble':PIXI.projection.Spine3d,
         * }} */
        this.child;
    };

    /** @returns {_players._p0} */
    getTarget(targetId) {
        switch (targetId) {
            case 'p0': return $players.p0 ;break;
            case 'p1': return $players.p1 ;break;
            //TODO: MORE A FAIR GLOBAL DANS SYSTEM
            default:break;
        }
    }

    get data() {
        return _Messages.POOL[this._currentId];
    }
    //#region [Initialize]
    initialize(){
        this.initialize_base();
        this.initialize_cineMode();
        this.initialize_Messages();
        this.initialize_interactions();
    };

    initialize_base(){
        const dataBase = $loader.DATA2.Buttons;
        const dataBase2 = $loader.DATA2.XboxButonsHelper;
        const dataBase3 = $loader.DATA2.MessageBubble;
        const MasterContainer = new PIXI.projection.Container3d();
            MasterContainer.name = 'MasterContainer';
            MasterContainer.scale3d.set(0.5); // permet un zoom de quality
            MasterContainer.parentGroup = $displayGroup.group[6]; //TODO: CACHER LA SOURIS SUR HOVER
        const ContainerButtons = new PIXI.projection.Container3d();
            ContainerButtons.name = 'ContainerButtons';
            ContainerButtons.position3d.set(-400,-200,0);

        const ButtonsL_xb = $objs.ContainerDN(dataBase2, 'xb_LB','ButtonsL_xb'); //!data2\System\xboxButtonHelper\SOURCE\images\xb_LB.png
        const ButtonsL = $objs.ContainerDN(dataBase, 'btA_L2','ButtonsL'); //!data2\System\buttons\SOURCE\images\btA_L2.png
            ButtonsL.d.anchor.set(0.5);
            ButtonsL.n.anchor.set(0.5);
            ButtonsL_xb.position.x = -125;
            ButtonsL_xb.d.anchor.set(0,0.5);
            ButtonsL_xb.n.anchor.set(0,0.5);
            ButtonsL_xb.addChild(ButtonsL);
        const ButtonsR_xb = $objs.ContainerDN(dataBase2, 'xb_LB','ButtonsR_xb'); //!data2\System\xboxButtonHelper\SOURCE\images\xb_LB.png
        const ButtonsR = $objs.ContainerDN(dataBase, 'btA_R2','ButtonsR'); //!data2\System\buttons\SOURCE\images\btA_R2.png
            ButtonsR.d.anchor.set(0.5);
            ButtonsR.n.anchor.set(0.5);
            ButtonsR_xb.position.x = 125;
            ButtonsR_xb.d.anchor.set(1,0.5);
            ButtonsR_xb.n.anchor.set(1,0.5);
            ButtonsR_xb.addChild(ButtonsR);
        const ButtonsClose_xb = $objs.ContainerDN(dataBase2, 'xb_B','ButtonsClose_xb'); //!data2\System\xboxButtonHelper\SOURCE\images\xb_B.png
            ButtonsClose_xb.position.set(-165,-265);
            ButtonsClose_xb.d.anchor.set(0.5);
            ButtonsClose_xb.n.anchor.set(0.5);
        //!light pour creer le blur blended 
        const ButtonsClose_ligth = new PIXI.lights.PointLight(0xeb0000,5.8);
            ButtonsClose_ligth.name = 'ButtonsClose_ligth';
            ButtonsClose_ligth.lightHeight = 0.02;
            ButtonsClose_ligth.brightness = -6.4;
            ButtonsClose_ligth.falloff = [5.5,-181.8,-1.2];
            ButtonsClose_xb.addChild(ButtonsClose_ligth);
        ContainerButtons.addChild(ButtonsL_xb,ButtonsR_xb,ButtonsClose_xb);
        //!data2\Texts\messageBox\SOURCE\images\bubbleMessage.png"
        const MessageBubble = new PIXI.projection.Spine3d(dataBase3.spineData);
            MessageBubble.name = 'MessageBubble';
            MessageBubble.hackAttachmentGroups("_n",PIXI.lights.normalGroup,PIXI.lights.diffuseGroup);
            MessageBubble.drawDebug(); //DELETE ME:
        //!container text render: (update position avec le bone:'mover') contien les container message et motions..
        const MessageRenderContainer = new PIXI.Container();
            MessageRenderContainer.name = 'MessageRenderContainer';
        //#end
        MasterContainer.addChild(MessageBubble,MessageRenderContainer,ContainerButtons);
        this.child = MasterContainer.childrenToName();
        //TODO: RENDU ICI, INTEGRER LE SPINE BUBBLE
        $camera.view.addChild(MasterContainer); // todo, move dans l'itinialisateur
        MasterContainer.renderable = false;
    }

    /** le mode cine mode, lorsque sequence messages */
    initialize_cineMode(){
        //todo: le mode cinema doit etre init au debut d'un events.
        const FramTop = new PIXI.Sprite(PIXI.Texture.WHITE);
            FramTop.width = 1920;
            FramTop.height = 150;
            FramTop.alpha = 1;
            FramTop.tint = 0x000000;
        const FramBottom = new PIXI.Sprite(PIXI.Texture.WHITE);
            FramBottom.width = 1920;
            FramBottom.height = 150;
            FramBottom.alpha = 1;
            FramBottom.anchor.set(0,1);
            FramBottom.tint = 0x000000;
            FramBottom.y = 1080;
        const CineContainer = new PIXI.Container().setName('CineContainer');
            CineContainer.parentGroup = $displayGroup.group[5];
            CineContainer.alpha = 0.85;
            CineContainer.addChild(FramTop,FramBottom);
        this.CineContainer = CineContainer;
    }

    /** Init les text pour messages, utilise les data seulement ici */
    initialize_Messages(){
        // les message sont special et utiliser seuelement ici
        const DataString = $loader.DATA.string.dataString_message.data;
        const localId = $texts._localId+2;
        const styleId = 11;
        const splitBy = _Texts.SPLITBY_WORD;
        const wordWrap = 650; //todo check
        const style2 = {};
        for (let i=1, l=DataString.length; i<l; i++) {
            const data = DataString[i];
            const id = data[0];
            const string = data[localId];
            const target = data[1];
            if(!id){continue};
            _Messages.POOL[id] = _Messages.POOL[id] || [];
            const motionsTxt = new _motionsTxt(id,string,styleId,splitBy,wordWrap,style2 )
            _Messages.POOL[id].push({target,motionsTxt});
        };
    }

    initialize_interactions(){
        this.child.ButtonsR_xb.on("pointerover", this.Buttons_xb_pointerover)
        this.child.ButtonsR_xb.on("pointerout", this.Buttons_xb_pointerout)
        this.child.ButtonsL_xb.on("pointerover", this.Buttons_xb_pointerover)
        this.child.ButtonsL_xb.on("pointerout", this.Buttons_xb_pointerout)
    };
    //#endregion

    //#region [Interactive]
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    Buttons_xb_pointerover(e) {
        const f = $systems.PixiFilters.OutlineFilterx4white
        this.d.filters = [f];
        this.n.blendMode = 1;
    };

    /** @param {PIXI.interaction.InteractionEvent} e -*/
    Buttons_xb_pointerout(e) {
        this.d.filters = null;
        this.n.blendMode = 0;
    };
    //#endregion

    //#region [Method]

    getDataMessage(messageId){
        return _Messages.POOL[messageId];
    };

    /** creer un message intro test 
     * @returns {Promise}
    */
    show(messageId,target){
        this.cineMode(true);
        return new Promise((resolve, reject) => {
            const dataMessage = this.getDataMessage(messageId);
            const Bubble = new _Bubble(dataMessage,target,resolve);
            $stage.addChild(Bubble.child.Master);
        }).then(()=>this.cineMode(false));
        /*return new Promise(async resolveEvent => {
            //await this.setup(messageId,target);
            //await this.createMessages();
            //this.child.MasterContainer.renderable = false;
            //resolveEvent();
        });*/
    }
    
    /** mode cinema */
    cineMode(show=true){
        if(show){
            $stage.addChild( this.CineContainer );
            gsap.fromTo( this.CineContainer.children, 0.3,{  alpha:0 },{  alpha:1 });
        }else{
            gsap.fromTo( this.CineContainer.children, 0.3,{  alpha:1 }, {  alpha:0 })
            .eventCallback("onComplete", ()=>$stage.removeChild(this.CineContainer) );
        }
        
    };

    /** setup: pass en mode messages cinema */
    setup(messageId,target){
        this.child.MasterContainer.renderable = true;
        this._currentId = messageId;
        this._currentPageId = 0;
        $gui.child.Master.renderable = false;
        return new Promise(resolve => {
            resolve();
        });
    }

    /** position la camera pour voir la buble */
    setupCamera(targetId){
        const target = this.getTarget(targetId);        
        $camera.moveToTarget(target,1,Power4.easeOut,'bubbleTxt');
    };

    /** affiche les interactio de talk */
    setupTalking(targetId){
        //TODO: REPENSER A UN BON SYSTEM DE PLAYER TALK, , un systems de trackIndex predefini
        const target = this.getTarget(targetId);
        if(target instanceof _battler){
            target.s.state.setAnimation(5, 'talk1', false)
            target.s.state.addEmptyAnimation(5,0.1,0)
        }
    };

    /**
     * @param {string} messageId
     * @returns {Promise}
     * */
    createMessages(){ // ces un new event target 
        return new Promise(resolve => {
            this.showPage(0,resolve);
            //this.setupButtons(DataMessages,resolve);
        });
    };
    /** clear la page actuel */
    clearCurrentPage(DataMessages){
        //todo: clear the pool
        const containerTxt = DataMessages.Pages[this._currentPageId];
        const MasterContainer = this.child.MasterContainer;
        const MessageBubble = this.child.MessageBubble;
            MessageBubble.skeleton.setToSetupPose(); // reset
            TweenMax.killTweensOf(MessageBubble.scale);
            containerTxt.children.forEach(txt => TweenMax.killTweensOf(txt) );
            containerTxt.removeAllListeners();
            containerTxt.children.forEach(txt => txt.removeAllListeners() );
            MasterContainer.removeChild(containerTxt);

    };

    showPage(pageIndex,resolve){
        const data = this.data[pageIndex];
        const MotionsTxt = data.motionsTxt;
        const target = this.getTarget(data.target);
        const MasterContainer = this.child.MasterContainer;
            MasterContainer.position3d.set(target.p.position3d.x,-target.p.height,target.p.position3d.z);
        const MessageBubble = this.child.MessageBubble;
        const mover = MessageBubble.skeleton.findBone('mover');
        const MessageRenderContainer = this.child.MessageRenderContainer;
            MessageRenderContainer.position.set(mover.x,-mover.y);
            MessageRenderContainer.addChild(MotionsTxt);
        console.log('mover: ', mover);
        console.log('MotionsTxt: ', MotionsTxt );

        //! point zero
        const moverX = mover.x;
        const moverY = mover.y;
        setInterval(function(){ 
            mover.x = moverX-($mouse.xx)*-1; // easeOption 0.03
            mover.y = moverY-($mouse.yy);
         }, 100);
    }

    /**@param {Array.<DataMessages>} messages
     * @param {number} pageIndex
     * @param {Promise} resolve
    */
   showPage_old(pageIndex,resolve){
        const MessageRenderContainer = this.child.MessageRenderContainer;
            MessageRenderContainer.removeChildren();
            //! si pageIndex > nb page, ces la fin, resolve cette event message.
            const motionsTxt = this.MotionsTxt[pageIndex];
            if(pageIndex>messages.length-1){return resolve()};
            const DataMessage = messages[pageIndex];
            this.setupTalking(DataMessage.target);
            this.setupCamera(DataMessage.target);
            DataMessage.motionsTexture && MessageRenderContainer.addChild(DataMessage.motionsTexture);
            MessageRenderContainer.addChild(DataMessage.Container);
        //!options zoom FX
        if('option word hover focus txt'){ // note: ok suprimer dans clearCurrentPage() avec removeAllListeners()
            //!cool mouse zoom on text
            DataMessage.Container.children.forEach(spriteTxt => {
                spriteTxt.interactive = true;
                spriteTxt.on('pointerover', ()=>{
                    DataMessage.motionsTexture && TweenLite.to(DataMessage.motionsTexture, 1, {alpha:0.5, ease: Power4.easeOut})
                    TweenLite.to(DataMessage.Container.children, 0.2, {alpha:0.5, ease: Power4.easeOut})
                    TweenLite.killTweensOf(spriteTxt,false,{alpha:true})
                    TweenLite.to(spriteTxt.scale, 1, {x:1.05,y:1.05, ease: Power4.easeOut})
                    TweenLite.set(spriteTxt,{alpha:1})
                });
                spriteTxt.on('pointerout', ()=>{
                    DataMessage.motionsTexture && TweenLite.to(DataMessage.motionsTexture, 1, {alpha:1, ease: Power4.easeOut})
                    TweenLite.to(spriteTxt.scale, 2, {x:1,y:1, ease: Power4.easeOut})
                    TweenLite.to(DataMessage.Container.children, 0.5, {alpha:1, ease: Power4.easeOut})
                });
            });
        };
        //!motions blur
        if('option motionsFx :motionsSprite'){
            const b = $systems.PixiFilters.blurTxt;
            const f = $systems.PixiFilters.MotionBlurFilter;
            const bounds = $camera.view.getBounds();
            DataMessage.motionsTexture.filterArea = bounds;
            DataMessage.motionsTexture.filters = [f,b];
        };
        //!motions words
        if('option motions words show'){
            TweenMax.staggerFromTo(DataMessage.Container.children, 0.5, {alpha:0},{alpha:1, ease: Power1.easeIn}, 0.4);
            const t = TweenMax.staggerTo(DataMessage.Container.children, 4, {x:()=>`+=${Math.randomFrom(4,-8)}`,y:()=>`+=${Math.randomFrom(7,-10)}`
            , ease: Power1.easeInOut, repeat:-1, yoyo:true}, 0.2);
        };
        //!updater
        let MotionBlurFilter;
        const ContainerButtons = this.child.ContainerButtons;
        const MessageBubble = this.child.MessageBubble;
        MessageBubble.skeleton.setToSetupPose(); // reset
        const mover = MessageBubble.skeleton.findBone('mover');
        const moverX = mover.x;
        const moverY = mover.y;
        const freeze = {x: mover.x*10, y: mover.y*10};
        const target = this.getTarget(DataMessage.target);
        const tHeight = target.p.height/2;
        const MasterContainer = this.child.MasterContainer;
        const tl = new TimelineMax();//TODO: PEUT ETRE FAIT UNE FOI CAR MessageRenderContainer EST MINTEANT DANS CHILD
        pageIndex===0 && tl.fromTo( MessageBubble.scale, 0.3, { x:0, y:0},{ x:1, y:1, ease: Back.easeOut.config(1.7) })
        tl.fromTo( MessageBubble.scale, 5, { x:1, y:1},{ x:1.02, y:1.02, ease: Power1.easeInOut, repeat:-1, yoyo:true })
        .eventCallback("onUpdate", ()=>{
            // separated target from mouse to avoid jitters
            const movementX = ($mouse.xx+freeze.x)/10;
            const movementY = ($mouse.yy+freeze.y)/10;
            mover.x += (movementX - mover.x) * 0.03; // easeOption 0.03
            mover.y += (movementY - mover.y) * 0.03;
            MessageRenderContainer.position.set(mover.x,-mover.y-40);
            ContainerButtons.pivot3d.set((moverX-mover.x)/1.25,-(moverY-mover.y)/2.7,0)
            //!positione selon le target
            MasterContainer.position3d.set(target.p.position3d.x+45,target.p.position3d.y-tHeight,target.p.position3d.z);
            //!filters MotionBlurFilter ?
            if(MotionBlurFilter){
                MotionBlurFilter.velocity.x =($mouse.xx-($camera._screenW/2))/50;
             // MotionBlurFilter.velocity.y = ($mouse.yy-(1080/2))/60;
            
            }
        });
        //!buttons events
        const ButtonsL_xb = this.child.ButtonsL_xb; //==<
        const ButtonsR_xb = this.child.ButtonsR_xb; //==>
        ButtonsL_xb.interactive = false;
        ButtonsR_xb.interactive = false;
        ButtonsL_xb.alpha = 0.2;
        ButtonsR_xb.alpha = 0.2;
        //!si pas la page 0, allow backPage
        if(pageIndex!==0){
            ButtonsL_xb.alpha = 1;
            ButtonsL_xb.interactive = true;
            ButtonsL_xb.on('pointerup', ()=>{
                ButtonsL_xb.interactive = false;
                ButtonsL_xb.alpha = 0.2;
                ButtonsR_xb.off('pointerup'); // suprime seulement le pointerup //todo: petit probleme, creer une method
                ButtonsL_xb.off('pointerup'); // suprime seulement le pointerup //todo: petit probleme, creer une method
                this.killPage(DataMessage,MessageBubble);
                this.show(pageIndex-1,messages,resolve);
                
            });
        };
        if(pageIndex<=messages.length){
            ButtonsR_xb.alpha = 1;
            ButtonsR_xb.interactive = true;
            ButtonsR_xb.on('pointerup', ()=>{
                ButtonsR_xb.interactive = false;
                ButtonsR_xb.alpha = 0.2;
                ButtonsR_xb.off('pointerup'); // suprime seulement le pointerup //todo: petit probleme, creer une method
                ButtonsR_xb.off('pointerup'); // suprime seulement le pointerup //todo: petit probleme, creer une method
                this.killPage(DataMessage,MessageBubble);
                this.show(pageIndex+1,messages,resolve);
            });
        };
    };

    /** kill les tweens,filters actif de la page current */
    killPage(DataMessage,MessageBubble){
        TweenLite.killTweensOf(DataMessage.Container.children);
        TweenLite.killTweensOf(MessageBubble.scale);
        DataMessage.motionsTexture.filters = null;
        DataMessage.Container.children.forEach(child => {
            child.removeAllListeners()
        });
    };
    //#endregion
};

let $messages = new _Messages();
console.log1('$messages: ', $messages);

/** Bubble interactive message */
class _Bubble{
    constructor(dataMessage,target,resolve) {
        this.dataMessage = dataMessage;
        this.target = target;
        this.resolve = resolve;
        this._maxWidth = 300;
        this._maxHeight = 150;
        this._targetId = null;
        this._curvX = 10;
        this._curvY = 0.7;
        this._pinX = 0;
        this._pinY = 0;
        this._radian = 0;
        this._currentPageIndex = -1;
        /** Hauteur y de la tete du target pour talk */
        this._headPosY = 0;
        /** pour animations de la bubble */
        this.quadCurv = {
            t:{cpX:0,cpY:0},
            r:{cpX:0,cpY:0},
            b:{cpX:0,cpY:0},
            l:{cpX:0,cpY:0},
        };
        /** @type {{ 'Master':PIXI.Container, 'MessagesContainer':PIXI.Container, 
         * 'Bubble':PIXI.Graphics, 'BubblePin':PIXI.Graphics,
         * 'Button_A':PIXI.Sprite, 'Button_B':PIXI.Sprite,
         * }} */
        this.child = null;
      // var rt = PIXI.RenderTexture.create(rx, ry);
      // var sprite = PIXI.Sprite.from(rt);
      // renderer.render(graphics, rt);

        this.initialize();
        //Inspectors.DisplayObj(this.quadCurv, true)
        //Inspectors.DisplayObj(this, ['_radian'])
    }

    //#region [GetterSetter]
    get targetX() { return $players.p0.p.position3d.x-this.child.Master.position3d.x; }
    get targetY() { return $players.p0.p.position3d.y-this.child.Master.position3d.y; }
    get targetZ() { return $players.p0.p.position3d.z-this.child.Master.position3d.z; }
    /** @returns {_motionsTxt} - renvoi le motions text affiche */
    get motionsTxt(){ return this.dataMessage[this._currentPageIndex].motionsTxt };
    //#endregion

    //#region [Initialize]
    initialize() {
        this.initialize_base();
        this.initialize_interactions()
        $app.ticker.add(this.update,this,PIXI.UPDATE_PRIORITY.UTILITY);
       //this.child = this.childrenToName()
        /*setInterval(()=>{
            this.target && this.update();
        }, 16);*/
        this.nextPage();
    };
        
    initialize_base() {
        const dataBase = $loader.DATA2.XboxButonsHelper
        const Master = new PIXI.Container().setName('Master');
            Master.position.set(0);
            Master.filters = [$systems.PixiFilters.OutlineFilterx4Black];
            Master.parentGroup =  $displayGroup.group[5];
        //!button xbox
        //# data2\System\xboxButtonHelper\SOURCE\images\xb_A.png
        const Button_A = new PIXI.Sprite(dataBase.textures.xb_A).setName('Button_A');
            Button_A.position.set(0,0);
            Button_A.anchor.set(0.5);
        //# data2\System\xboxButtonHelper\SOURCE\images\xb_b.png
        const Button_B = new PIXI.Sprite(dataBase.textures.xb_B).setName('Button_B');
            Button_B.position.set(0,0);
            Button_B.anchor.set(0.5);
            Button_B.scale.set(0.85);
        //#bubble
        const Bubble = new PIXI.Graphics().setName('Bubble');
        const BubblePin = new PIXI.Graphics().setName('BubblePin');
        //#container text render: (update position avec le bone:'mover') contien les container message et motions..
        const MessagesContainer = new PIXI.Container().setName('MessagesContainer');
            MessagesContainer.position.set(20); // marge 20px
        //!end
        Master.addChild(BubblePin,Bubble,Button_B,Button_A,MessagesContainer);
        this.child = Master.childrenToName();
    }

    initialize_interactions() {
        const Bubble = this.child.Bubble;
        Bubble.interactive = true;
        //Bubble.on('pointerover'       , this.pointerover_Bubble    , this);
        //Bubble.on('pointerout'        , this.pointerout_Bubble   , this);
        //Bubble.on('pointerdown'       , this.pointerdown_Bubble    , this);
        Bubble.on('pointerup'         , this.pointerup_Bubble    , this);
    }
    //#endregion

    //#region [Interactive]
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerup_Bubble(e){
        this.nextPage();
    }
    //#endregion
    
    nextPage(){
        if(this._currentPageIndex+1<this.dataMessage.length){
            this.showPage(this._currentPageIndex+1);
        }else{
            //!end message
            this.Destroy();
            this.resolve && this.resolve()

        }
    }

    /** affiche un index de page */
    showPage(pageIndex){
        const data = this.dataMessage[pageIndex];
        this.clearPage();
        this.setupPage(pageIndex, data.motionsTxt, data.target);
        this.playPage();
    }

    /**joue la page et animation */
    playPage(){
        // todo: mettrand dans class message ?
        gsap.fromTo(this.child.Bubble, 1.2, {rotation:1},{rotation:0, ease:Elastic.easeOut.config(1.2, 0.5) });
        gsap.fromTo(this.child.Master.scale, 1, {x:1,y:0},{ 
            x:1, y:1,
        });
        gsap.fromTo(this.child.Master.position, 1.2, {x:(1920/2),y:(1080/2)},{ 
            x:Math.max((1920/2)-this._maxWidth-40,0), y: Math.max((1080/2)-this._maxHeight-this.target.p.height-40,0),
            ease: Elastic.easeOut.config(0.7, 0.5)
        });
        gsap.fromTo(this.child.BubblePin.scale, 0.2, {x:0,y:0},{ 
            x:1, y: 1,
            delay:0.4,
        });
        $camera.moveToTarget(this.target,3,Power4.easeOut)
        if(this.target instanceof _battler){
            this.target.s.state.setAnimation(5, 'talk1', false)
            this.target.s.state.addEmptyAnimation(5,0.1,0)
        }
        this.motionsTxt.start(true);
    
    }

    /** prepare la bulles avec la nouvelle page */
    setupPage(pageIndex, MotionsTxt, targetId){
        this._currentPageIndex = pageIndex;
        this._targetId = targetId;

        const maxWidth = this._maxWidth = MotionsTxt.width+50;
        const maxHeight = this._maxHeight = MotionsTxt.height+50;
        this.quadCurv = {
            t:{cpX:maxWidth   ,cpY:0        },
            r:{cpX:maxWidth+20,cpY:maxHeight},
            b:{cpX:maxWidth   ,cpY:maxHeight},
            l:{cpX:-30        ,cpY:maxHeight},
        };

        gsap.to(this, 0.7, { // marge 20
            _maxWidth:maxWidth, _maxHeight: maxHeight,
            ease: Elastic.easeOut.config(1.2, 0.5)
        });
        this.child.Button_A.position.set(maxWidth,maxHeight);
        this.child.Button_B.position.set(maxWidth+20,maxHeight-40);
        switch (targetId) {
            case 'p0': this.target = $players.p0 ;break;
            case 'p1': this.target = $players.p1 ;break;
            //TODO: MORE A FAIR GLOBAL DANS SYSTEM
            default:break;
        }
        this._headPosY = this.target.p.height/2;
        const MessagesContainer = this.child.MessagesContainer;
            MessagesContainer.addChild(MotionsTxt);
    }

    /** clear page message */
    clearPage(){
        const MessagesContainer = this.child.MessagesContainer;
        MessagesContainer.removeChildren();
    }

    draw_Bubble(){
        const Master = this.child.Master; 
        const maxWidth = this._maxWidth;
        const maxHeight = this._maxHeight;
        const curv1 = 20; //todo: dinamyc ?
        const Bubble = this.child.Bubble;
        const jellyFroceXR = this._jellyFroceXR *4;
        const jellyFroceXL = this._jellyFroceXL *4;
        const jellyFroceYT = this._jellyFroceYT *4;
        const jellyFroceYB = this._jellyFroceYB *4;
        Bubble.clear();
        Bubble.lineStyle(0).beginFill(0xffffff, 1);
        Bubble.moveTo(0,0)
        Bubble.quadraticCurveTo(this.quadCurv.t.cpX              , this.quadCurv.t.cpY+jellyFroceYB, maxWidth, 20          ); // top
        Bubble.quadraticCurveTo(this.quadCurv.r.cpX-jellyFroceXR , this.quadCurv.r.cpY             , maxWidth, maxHeight   ); //right
        Bubble.quadraticCurveTo(this.quadCurv.b.cpX              , this.quadCurv.b.cpY-jellyFroceYT, 0       , maxHeight+20); //bottom
        Bubble.quadraticCurveTo(this.quadCurv.l.cpX+jellyFroceXL , this.quadCurv.l.cpY             , 0       , 0           ); //left
        Bubble.endFill();
    }

    getDistanceFrom(p1,p2){
        const deltaX = p1.x - p2.x;
        const deltaY = p1.y - p2.y;
        const deltaZ = p1.z - p2.z;
        return {
            d:Math.sqrt( deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ ),
            a:-Math.atan2(p2.z - p1.z, p2.x - p1.x),
        }
    }

    draw_BubblePin(){
        const Master = this.child.Master; 
        const BubblePin = this.child.BubblePin;
        const point3d = new PIXI.Point3d();
        point3d.copy(this.target.p.position3d)
        point3d.x-=35; // decal selon dir du player
        point3d.y-=this._headPosY; // hauteur de la bouche
        this.target.p.position3d
        const pos = $stage.toLocal(point3d,$camera.view,void 0,true) //this.target.p.toLocal(BubblePin.getGlobalPosition());
        const pox = pos.x-Master.x//pos.x/$camera._zoom;
        const poy = pos.y-Master.y//(pos.y+this._headPosY)/$camera._zoom;
        const ratioX = Master.x/$camera._screenW;
        const ratioY = Master.y/$camera._sceneH; 
        this._pinX = (this._maxWidth-20)*ratioX;
        this._pinY = this._maxHeight-20;

        BubblePin.clear();
        BubblePin.lineStyle(0).beginFill(0xffffff, 1);
        //BubblePin.drawRect(0, 0, 30, 30)
        BubblePin.moveTo(40,0)
        BubblePin.quadraticCurveTo(-100, 140, pox-this._pinX, poy-this._pinY);
        BubblePin.quadraticCurveTo(-140, 170, 0, 0);
        //BubblePin.quadraticCurveTo(this._curvX, poy/this._curvY, pox, poy);
        //BubblePin.moveTo(pox,poy+10)
        //BubblePin.quadraticCurveTo(this._curvX, poy/this._curvY, 0, 0);
        BubblePin.endFill();
        BubblePin.position.set(this._pinX, this._pinY)//(this._pinX,this._pinY);

    }

    update(){
        const Master = this.child.Master;
        const MessagesContainer = this.child.MessagesContainer;
            MessagesContainer.position.set(20+(-this._jellyFroceXR+this._jellyFroceXL)*1.5,20+(-this._jellyFroceYT+this._jellyFroceYB)*1.5);
        //! updata ease
        let _jellyFroceXR = this._jellyFroceXR || 0;
        let _jellyFroceXL = this._jellyFroceXL || 0;
        let _jellyFroceYT = this._jellyFroceYT || 0;
        let _jellyFroceYB = this._jellyFroceYB || 0;
        if($mouse.xx>Master.x+this._maxWidth){
            _jellyFroceXL = _jellyFroceXL - _jellyFroceXL*0.1;
            _jellyFroceXR = (Master.x-$mouse.xx+this._maxWidth)*-0.03;
            //Master.x+= _jellyFroceXR;
        }else
        if($mouse.xx<Master.x){
            _jellyFroceXR = _jellyFroceXR - _jellyFroceXR*0.1;
            _jellyFroceXL = (Master.x-$mouse.xx)*0.03;
            //Master.x-= _jellyFroceXL;
        }else{
            _jellyFroceXR = _jellyFroceXR - _jellyFroceXR*0.07;
            _jellyFroceXL = _jellyFroceXL - _jellyFroceXL*0.07;
            //Master.x+=(_jellyFroceXR+_jellyFroceXL);
        };
    
        if($mouse.yy>Master.y+this._maxHeight){
            _jellyFroceYB = _jellyFroceYB - _jellyFroceYB*0.1;
            _jellyFroceYT = (Master.y-$mouse.yy+this._maxHeight)*-0.03;
            //Master.y+= _jellyFroceYT
        }else
        if($mouse.yy<Master.y){
            _jellyFroceYT = _jellyFroceYT - _jellyFroceYT*0.1;
            _jellyFroceYB = Math.abs(Master.y-$mouse.yy)*0.03;
            //Master.y-= _jellyFroceYB
        }else{
            _jellyFroceYT = _jellyFroceYT - _jellyFroceYT*0.07;
            _jellyFroceYB = _jellyFroceYB - _jellyFroceYB*0.07;
            //Master.y+=(_jellyFroceYT+_jellyFroceYB);
        };
        this._jellyFroceXR = _jellyFroceXR;
        this._jellyFroceXL = _jellyFroceXL;
        this._jellyFroceYT = _jellyFroceYT;
        this._jellyFroceYB = _jellyFroceYB;
        
        this.draw_Bubble();
        this.draw_BubblePin();
    }

    /** Destroy de bubble */
    Destroy(){
        this.clearPage();
        $app.ticker.remove(this.update,this);
        const Master = this.child.Master;
        Master.destroy({children:true});
    }
};


