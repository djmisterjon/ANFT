/** ce son les tile thumb pour la libs2 */
class _Editor_TileSheet extends PIXI.Container {

    constructor(dataBase,textureName) {
        super();
        this.dataBase = dataBase;
        this._textureName = textureName;
        /** @type {{ 'Container':(_Container_Sprite|_Container_Spine|_Container_Animation|_Container_Base), 'BB':, 'CC':, 'DD':, 'EE':, 'FF':, }} */
        this.child = null;
        this.initialize();
    }

    //#region [GetterSetter]
    get EDITOR() {
        return $EDITOR;
    }
    get textureWidth() {
        return this.dataBase.textures?.[this._textureName]?.width || this.children[0].a?.width || this.children[0].s?.width || 0
    }
    get textureHeight() {
        return this.dataBase.textures?.[this._textureName]?.height || this.children[0].a?.height || this.children[0].s?.height || 0
    }
    //#endregion

    //#region [Initialize]
    initialize() {
        this.initialize_base()
        this.initialize_debug()
        this.child = this.childrenToName()
        this.initialize_interactions()
    }
        
    initialize_base() {
        const dataBase = this.dataBase;
        const textureName = this._textureName;
        const Container = $objs.create(null, dataBase, textureName, true).setName('Container');
        if(dataBase.isSpineSheets){
            Container.s.hackAttachmentGroups("_n", null,null);
            Container.s.state.setAnimation(0, textureName, true);
            Container.position.set(210/2,210);
        }else
        if(dataBase.isAnimationSheets){
            Container.a.loop = true;
            Container.a.anchor.set(0);
            Container.a.parentGroup = null;
            if(dataBase._normal){
                Container.n.anchor.set(0);
                Container.n.parentGroup = null;
            }
            Container.a.play();
        }else
        if(dataBase.isSpriteSheets){
            Container.d.anchor.set(0);
            Container.n.anchor.set(0);
            Container.d.parentGroup = null;
            Container.n.parentGroup = null;
            Container.n.renderable = false; // todo: hover
        }
        Container.scale.set( $app.getRatio(Container, 210, 210) );
        Container.pivot.set((Container.width-210)/2,(Container.height-210)/2);
        this.addChild(Container);
    }

    initialize_debug(){
        const dataBase = this.dataBase;
        const textureName = this._textureName;
            //!bg
            const Background = new PIXI.Sprite(PIXI.Texture.WHITE).setName('Background');
                Background.alpha = 0.4;
                Background.width = 210;
                Background.height = 210;
            //!text
            const txt = new PIXI.Text(`${textureName} [${~~this.textureWidth} ,${~~this.textureHeight}]`,{fontSize:15,fontWeight:'900'});
            txt.width = Math.min(txt.width,210);
            const txtCat = new PIXI.Text(`${dataBase._category}`,{fill:'#a22f97',fontSize:14,fontWeight:'900'});
                txtCat.anchor.y = 1;
                txtCat.y = 210;
            const txtTotal = new PIXI.Text(`000`,{fontSize:15,fontWeight:'900'}); //todo: total de tile dans la map
                txtTotal.anchor.set(1,1);
                txtTotal.position.set(210);
            //txt.alpha = 0;
            //!bg text
            const bgtxt = new PIXI.Sprite(PIXI.Texture.WHITE);
            [bgtxt.width,bgtxt.height] = [210,txt.height+4];
            bgtxt.alpha = 0.5;
            this.addChildAt(Background, 0);
            this.addChild(bgtxt,txt,txtCat,txtTotal);
    }

    initialize_interactions() {
        //!interactive
       this.interactive = true;
       this.on ('pointerover'      , this.pointerover_tile , this ) ;
       this.on ('pointerout'       , this.pointerout_tile  , this ) ;
       this.on ('pointerdown'      , this.pointerdown_tile , this ) ;
       this.on ('pointerupoutside' , this.pointerup_tile   , this ) ;
       this.on ('pointerup'        , this.pointerup_tile   , this ) ;
       this.on ('scrollwheel'      , this.scrollwheel      , this ) ;
    }
    //#endregion

    //#region [Interactive]
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerover_tile(e){
        gsap.to(this, 0.2,{alpha:4});
        this.filters = [this.EDITOR.FILTERS.OUTLINE1];
    }
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerout_tile(e){
        gsap.to(this, 0.6,{alpha:1})
        this.filters = null;
    }
    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerdown_tile(e){// todo: rendu ici , moyen de holclick release, pour scroll
        const context = this.EDITOR.child.Library2;
        gsap.IntervalCallId(0.15, context.scrollLib, 'editorScrollMode',context);
    }

    /** @param {PIXI.interaction.InteractionEvent} e -*/
    pointerup_tile(e){
        const ani = gsap.getById('editorScrollMode');
        const isActive = ani?.isActive();
        ani?.kill();
        if(isActive){
            this.EDITOR.child.Library2.fitScroll();
        }else{
            this.createObjMap();
        }
    }
    scrollwheel(e){
        this.EDITOR.child.Library2.scrollwheel(e)
    }
    //#endregion
    //#region [Method]
    createObjMap(){
        const Container = this.child.Container
        this.EDITOR.createObj(Container.DataObj.clone())
    }
    
    //#endregion
}