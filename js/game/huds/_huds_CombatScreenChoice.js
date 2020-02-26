/**@class Affiche choix lorsque sur un bounty cases combat (avant commencer combat) */
class _Huds_CombatScreenChoice extends _Huds_Base {
    constructor() {
        super();
        /**@type {Promise.resolve} */
        this.resolve = null;
        this.bountyData = null;
        /** @type {{ xButton_A:_objs.ContainerDN,xButton_X:_objs.ContainerDN,xb_B:_objs.ContainerDN,monsterIcoBG:_objs.ContainerDN,mIcon_?:_objs.ContainerDN, } */
        this.child = null;
        this.renderable = false;
        this.visible = false;
    };
    //#region [Initialize]
    initialize() {
        this.initialize_choiceBar();
        this.initialize_infoBar(); //todo mettre dans une method
        this.child = this.childrenToName();
        this.initialize_interaction();
        TweenLite.fromTo(this, 0.2,{alpha:0},{ alpha:1, ease: Power4.easeOut });
    };

    initialize_choiceBar(){
        const graphics = new PIXI.Graphics();
        graphics.beginFill(0x000000).drawRect(0, 0, $app.screen.width, 60).endFill();
        const bar = this.bar1 = new PIXI.Sprite($app.renderer.generateTexture(graphics) );
        bar.anchor.set(0,0.5);
        bar.parentGroup = PIXI.lights.diffuseGroup;
        bar.position.set(0,420);
        bar.alpha = 0.6;
        const dataBase = $loader.DATA2.XboxButonsHelper;
        //!data2/System/xboxButtonHelper/SOURCE/images/xb_A.png
        const xButton_A = $objs.ContainerDN(dataBase, 'xb_A','xButton_A');
            xButton_A.d.anchor.set(0.5);
            xButton_A.n.anchor.set(0.5);
            xButton_A.position.set(700,420);
            const txt_A = new PIXI.Text('FIGHT',$systems.styles[2]);
            txt_A.anchor.set(0,0.5);
            txt_A.position.set(700+50,420);
        const xButton_X = $objs.ContainerDN(dataBase, 'xb_X','xButton_X');
            xButton_X.d.anchor.set(0.5);
            xButton_X.n.anchor.set(0.5);
            xButton_X.position.set(900,420);
            const txt_X = new PIXI.Text('AUTO',$systems.styles[2]);
            txt_X.anchor.set(0,0.5);
            txt_X.position.set(900+50,420);
        const xButton_B = $objs.ContainerDN(dataBase, 'xb_B','xButton_B');
            xButton_B.d.anchor.set(0.5);
            xButton_B.n.anchor.set(0.5);
            xButton_B.position.set(1100,420);
            const txt_B = new PIXI.Text('RAN (~69.8%)',$systems.styles[2]);
            txt_B.anchor.set(0,0.5);
            txt_B.position.set(1100+50,420);
        this.addChild( bar,xButton_A,txt_A,xButton_X,txt_X,xButton_B,txt_B  );
    };
    initialize_infoBar(){
        const graphics = new PIXI.Graphics();
        graphics.beginFill(0x000000).drawRect(0, 0, $app.screen.width, 150).endFill();
        const bar = this.bar2 = new PIXI.Sprite($app.renderer.generateTexture(graphics) );
        bar.anchor.set(0,0.5);
        bar.parentGroup = PIXI.lights.diffuseGroup;
        bar.position.set(0,160);
        bar.alpha = 0.7;
        //!monster icon container
        const ContainerMonsterIcons = new PIXI.Container();
            ContainerMonsterIcons.name = 'ContainerMonsterIcons';
            ContainerMonsterIcons.position.set($app.screen.width/2,160);
        this.addChild( bar,ContainerMonsterIcons );
    }

    initialize_interaction(){
        ['xButton_A','xButton_X','xButton_B'].forEach(xb => {
            const xButton = this.child[xb];
            xButton.interactive = true;
            xButton.on("mouseover", this.mouseover_xButton,this);
            xButton.on("mouseout" , this.mouseout_xButton,this);
            xButton.on("mouseup"  , this.mouseup_xButton,this);
        });
    
    };
    //#endregion

    //#region [Interactive]
    /**@param {PIXI.interaction.InteractionEvent} e */
    mouseover_xButton(e){
        $audio._sounds.BT_A.play("BT_A015");
        const ee = e.currentTarget;
        TweenLite.to(ee.scale, 0.3,{ x:1.1,y:1.1, ease: Expo.easeOut});
    };
    /**@param {PIXI.interaction.InteractionEvent} e */
    mouseout_xButton(e){
        const ee = e.currentTarget;
        TweenLite.to(ee.scale, 0.3,{ x:1,y:1, ease: Expo.easeOut});
    };
    /**@param {PIXI.interaction.InteractionEvent} e */
    mouseup_xButton(e){
        const ee = e.currentTarget;
        $audio._sounds.BT_A.play("BT_A015");
        const resolve = this.resolve;
        this.resolve = null;
        this.resolve = null;
        this.bountyData = null;
        this.child = null;
        $stage.removeChild(this);
        this.renderable = false;
        this.visible = false;
        resolve(ee.name);
    };
    //#endregion

    //#region [Method]
    /** Affiche les choix info combat 
     * @param {Promise.resolve} resolve
     * @param {[]} bountyData
    */
    show(resolve,bountyData=[]){
        $stage.interactiveChildren = true;
        $stage.scene.interactiveChildren = false;
        this.resolve = resolve;
        this.bountyData = bountyData;
        this.create_combatInfo();
        this.renderable = true;
        this.visible = true;
    };

    /** ajoute les informations de combat et monster */
    create_combatInfo(){
        const dataBase = $loader.DATA2.MonsterIcons;
        const ContainerMonsterIcons = this.child.ContainerMonsterIcons;
        let x = 140;
        for (let i=0, l=this.bountyData.length; i<l; i++) {
            const _monster_Base = this.bountyData[i];
            const c = new PIXI.Container();
            const monsterIcoBG = $objs.ContainerDN(dataBase, 'monsterIcoBG');
                monsterIcoBG.d.anchor.set(0.5);
                monsterIcoBG.n.anchor.set(0.5);
            const mIcon = $objs.ContainerDN(dataBase, `mIcon_${_monster_Base._id}`);
                mIcon.d.anchor.set(0.5);
                mIcon.n.anchor.set(0.5);
            const txt_lv = new PIXI.Text(`Lv:${_monster_Base._level}`,$systems.styles[2]);
                txt_lv.anchor.set(0.5);
                txt_lv.position.y = 60;
            c.addChild(monsterIcoBG,mIcon,txt_lv);
            c.position.x = x;
            ContainerMonsterIcons.addChild(c);
            x+=140;
        };
        ContainerMonsterIcons.pivot.x = x/2;
        TweenMax.staggerFrom(ContainerMonsterIcons.children, 0.4, {x:x/2, ease:Back.easeInOut.config(1.3) }, 0.12);
    };


    destroys(){

    };
    //#endregion
};
