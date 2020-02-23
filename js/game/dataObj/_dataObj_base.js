class _DataObj_Base {
    //#region [Static]
    //#endregion
    /** 
     * @param {String} dataBaseName
     * @param {String} textureName
     * @param {FACTORY} [factory]
    */
    constructor(dataBaseName,textureName,factory) {
        this._dataBaseName = dataBaseName;
        this._textureName  = textureName;
        /**@type {Number} Id global dans le jeux */
        this._globalId = Infinity;
        /**@type {Number} Id Local dans la scene */
        this._localId  = Infinity;
        /** indique si l'objet peut etre identifier selon un idType */
        this._identifiable = false;
        /** Indique si l'obj identifiable est identifier */
        this._identified = false;
        /** indic si l'objet a eter detruit du jeux */
        this._destroyed = false;
        /**@type {FACTORY} - factory du editeur ou loadgame */
        this.factory = factory;
        /**@type {_Container_Sprite|_Container_Animation|_Container_Spine|_Container_Base} Ref vers Container display */
        this.link = null;
        Object.defineProperty(this, 'factory', { enumerable : false });
        Object.defineProperty(this, 'link'  , { enumerable : false });
    }

    //#region [GetterSetter]
    //todo: revoir les categories pour purger un peut tous ca
    get isBackgrounds  () { return this.dataBase._category === _DataBase.CATEGORY.Backgrounds  }
    get isCase         () { return this.dataBase._category === _DataBase.CATEGORY.Case         }
    get isBuildings    () { return this.dataBase._category === _DataBase.CATEGORY.Buildings    }
    get isCharacteres  () { return this.dataBase._category === _DataBase.CATEGORY.Characteres  }
    get isCliffs       () { return this.dataBase._category === _DataBase.CATEGORY.Cliffs       }
    get isDivers       () { return this.dataBase._category === _DataBase.CATEGORY.Divers       }
    get isDoor         () { return this.dataBase._category === _DataBase.CATEGORY.Door         }
    get isFX           () { return this.dataBase._category === _DataBase.CATEGORY.FX           }
    get isFurnitureEXT () { return this.dataBase._category === _DataBase.CATEGORY.FurnitureEXT }
    get isFurnitureINT () { return this.dataBase._category === _DataBase.CATEGORY.FurnitureINT }
    get isGUI          () { return this.dataBase._category === _DataBase.CATEGORY.GUI          }
    get isGrass        () { return this.dataBase._category === _DataBase.CATEGORY.Grass        }
    get isIcons        () { return this.dataBase._category === _DataBase.CATEGORY.Icons        }
    get isMiscs        () { return this.dataBase._category === _DataBase.CATEGORY.Miscs        }
    /** return un id constructor unique */
    get constructorId() {
        return `${this.constructor.name}[${this._globalId}:${this._localId}]`;
    }
    /**@returns {_DataBase} */
    get dataBase() { return $loader.DATA2[ this._dataBaseName ] };
    get p() { return this.link };
    //#endregion

    //#region [Initialize]
    //todo: un obj peut etre juste une base ? si non enlever !
    initialize(){
        this.initialize_base();
        this.initialize_interactive()
    }
    initialize_base(){
    }
    /** Interaction de base qui peuvent appeller les super interaction*/
    initialize_interactive(){
    }
    //#endregion
    //#region [Interactive]
    pointerover(e){
    }
    pointerout(e){
    }
    pointerdown(e){
    }
    pointerup(e){
    }
    /** @param {PIXI.interaction.InteractionEvent} e 
     * @param {_ObjsIdentificator} ObjsIdentificator
    */
    pointerover_fromIdentificator(e,ObjsIdentificator){
        
    }
    /** @param {PIXI.interaction.InteractionEvent} e 
     * @param {_ObjsIdentificator} ObjsIdentificator
    */
    pointerout_fromIdentificator(e,ObjsIdentificator){

    }

    /** @param {PIXI.interaction.InteractionEvent} e 
     * @param {_ObjsIdentificator} ObjsIdentificator
    */
    pointerup_fromIdentificator(e,ObjsIdentificator){
        //si base ? on suprime juste l'objet
        ObjsIdentificator.Destroy();
        this.Destroy();
    }
    //#endregion
    //#region [Method]
    /** asign un displayObjet au dataobj */
    addLink(link){
        this.link = link;
    }
    /** suprime obj du jeux, mais gard ces etas, pour save,load, mais aussi pour conditions*/
    Destroy(){
        this.p.Destroy();
        this._destroyed = true;
        this.link = null;
        this.factory = null;
    }

    /** initialize un factory selon les props du child */
    createFactory(){
        return _Factory.createFrom(this);
    }

    /** asign un ou le factory au dataobj et link
     * @param {FACTORY} [factory=this.factory]
    */
    asignFactory(factory=this.factory){
        if(!factory){return console.error('critical error! no factory existe!',factory)};
        if(this.factory !== factory){
            this.factory = factory;
        }
        factory.g.to(this);
        const link = this.link;
        if(link){
            link.p && factory?.p.to(link.p);
            link.d && factory?.d.to(link.d);
            link.n && factory?.n.to(link.n);
            link.s && factory?.s.to(link.s);
            //link.a && factory?.a.to(link.a);
            //link.l && factory?.l.to(link.l);
            this.update();
        }
    }

    /** update objet link from setting, lorsque on applique un factory, ou loadgame ou ..? 
     * Voir les super class pour un update custom
    */
    update(){

    }

    /**Proced a l'identification d'un obj, discover, show */
    doIdentification(){
        //Todo, pour le moment ces basic, ajouter des fx
        if(!this._identified){
            this._identified = true;
            //message comme quoi l'objet est identifier
            $mouse.showHelpBox('__newobjIdentified')
            if(this.p){
                this.p.n && (this.p.n.filters = [$systems.PixiFilters.OutlineFilterx4Black]);
            }
            //!TODO: identification.js system ditentification et interaction des obj
            const IdenObj = _ObjsIdentificator.create(this);
            this.p.addChild(IdenObj.p);
            IdenObj.checkNearObjFromPlayer();
        }
    }
    
    /** clone un dataObj avec posibiliter de register */
    clone(){
        const factory = this.factory ? this.createFactory() : null;
        return new this.constructor(this._dataBaseName,this._textureName,factory);
    }
    //#endregion
   
}