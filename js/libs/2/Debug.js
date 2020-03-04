/**Permet de debug des elements du jeux ou les position */
//TODO: RENDU ICI, femrer tous les huds quand bood, + add a Inspector debug pour activer les hud

class Debug extends PIXI.Container {
    /** creer un inspector avec les commands debug */
    static CreateInspector(){
        const Command = {
            addTravelPoint:this.addTravelPoint,
            addStatusPoisonToPlayer1:this.addStatusPoisonToPlayer1,
            addStatusHungerToPlayer1:this.addStatusHungerToPlayer1,
            reset_HG_toMax:this.reset_HG_toMax,
            StartCombat_x1:this.StartCombat_x1,
            StartCombat_x5:this.StartCombat_x5,
        }
        Inspectors.Objects(Command,'DEBUG HACK');
    }
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
    static addTravelPoint() {
        $gui.showAll();
        $gui.Travel.sta = 100;
    };

    static addStatusPoisonToPlayer1() {
        $players.p0.addStatus('poison',true)

    };
    static addStatusHungerToPlayer1() {
        $players.p0.status['hunger'] = $statesManager.create('hunger',  $players.p0)
        $players.p0.HP;
       
    };
    static reduit_HG_deMotier() {
        $players.p0.add_HG(-$players.p0._HG/2.5);

    };
    static reset_HG_toMax() {
        $players.p0.add_HG(999);
    };
    
    static StartCombat_x1() {
        $players.p0.s.state.addAnimation(3, "visiteCase", false,0);
        const bountyData = [
            _DataBattlers.generate(0),
        ];
        new Promise((resolve, reject) => { // resolve()
            $gui.CombatScreenChoice.show(resolve,bountyData);
        }).then((value) => {
            switch (value) {
                case 'xButton_A': new _Combats(bountyData);break;
                default:break;
            }
        });
    }
    static StartCombat_x5() {
        $players.p0.s.state.addAnimation(3, "visiteCase", false,0);
        const bountyData = [
            _DataBattlers.generate(0),
            _DataBattlers.generate(1),
            _DataBattlers.generate(2),
            _DataBattlers.generate(3),
            _DataBattlers.generate(3),
        ];
        new Promise((resolve, reject) => { // resolve()
            $gui.CombatScreenChoice.show(resolve,bountyData);
        }).then((value) => {
            switch (value) {
                case 'xButton_A': new _Combats(bountyData);break;
                default:break;
            }
        });
    };

    /**@description debug camera for test pixi-projections, also need move ticker and update to $app update */
    static CameraLines(force=false) {
        if(!force && this._CameraLines){return};
        this._CameraLines = true;
        //!debug line
        const line = new PIXI.Graphics();
        line.lineStyle(1, 0xFFFFFF,0.3).moveTo(1920/2, 0).lineTo(1920/2, 1080).moveTo(0, 1080/2).lineTo(1920, 1080/2);
        $camera.view.parent.addChild( new PIXI.Sprite($app.renderer.generateTexture(line)) );
    }

    /**@description debug camera for test pixi-projections, also need move ticker and update to $app update */
    static CameraInspector(force=false,toggle) {
        if(Inspectors.GUI['CAMERA']){ return };
        const thats = $camera;
        const gui = new Inspectors('CAMERA','view-port and culling controlers');
        //TODO: BREADCUM styte scan les parent et children
        const f1 = gui.addFolder('CAMERA INFORMATIONS').disable().close();
        f1.add(thats, '_sceneName').listen();
        f1.add(thats, '_screenW'  ).listen();
        f1.add(thats, '_screenH'  ).listen();
        f1.add(thats, '_sceneW'   ).listen();
        f1.add(thats, '_sceneH'   ).listen();
        const f2 = gui.addFolder('camera.TRANSFORM').listen().slider();
        f2.add(thats, '_inteliCam');
        f2.add(thats, '_orthographic');
        f2.add(thats, '_culling').listen();
        f2.add(thats, '_cullingCount').listen().disable();
        f2.add(thats, '_zoom'        ).min (0.1).max(3).step(0.01);
        f2.add(thats, '_ang'         ).min (-Math.PI/2).max(Math.PI/2).step(0.02);
        f2.add(thats, '_perspective' ).min (-1.4).max(-0.1).step(0.02);
        f2.addLine('view.setPlanes change focal');
        const onChangePlane = ()=>{ thats.view.setPlanes(thats._focus, thats._near, thats._far, thats._orthographic) };
        f2.add(thats, '_focus' ).step(5).onChange(onChangePlane);
        f2.add(thats, '_near'  ).step(10).onChange(onChangePlane);
        f2.add(thats, '_far'   ).step(10).onChange(onChangePlane);
        const f3 = gui.addFolder('camera.view.TRANSLATE').listen().slider();
        f3.add(thats.view, 'position3d', ['x','y','z'] ).step(1);
        f3.add(thats.view, 'pivot3d', ['x','y','z'] ).step(1);
    }

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