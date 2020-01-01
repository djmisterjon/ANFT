// ┌-----------------------------------------------------------------------------┐
// GLOBAL $objs CLASS: _objs
//└------------------------------------------------------------------------------┘

/** @class _DataObj_Base */
class _DataObj_Base {
    //#region [Static]
    /** * List des combatModes selon lavancer des turn de combat 
    * @typedef {Object} ObjsType
    * @property {number} ObjsType.base - mode update des turn
    * @property {number} ObjsType.cases - choisir une action
    * @property {number} ObjsType.door - setup de l'action choisis
    * @property {number} ObjsType.wall - setup de l'action choisis
    * @property {number} ObjsType.chara - setup de l'action choisis
    */
    static TYPE = {
        base: 0,
        cases: 1,
        door: 2,
        wall:3,
        chara:4,
    };
    //#endregion
    /** 
     * @param {String} _dataBaseName
     * @param {String} _textureName
     * @param {Factory} factory
     */
    constructor(_dataBaseName,_textureName, factory) {
        //this.ids = dataBase.ids; // control les ids dans $obj.GLOBAL, LOCAL TODO: repenser
        this._dataBaseName = _dataBaseName;
        this._textureName  = _textureName;
        /** name id */
        this._id = '';
        this._globalId = Infinity;
        this._localId  = Infinity;
        /** indique si l'objet peut etre identifier selon un idType */
        this._identifiable = false;
        /** Indique si l'obj identifiable est identifier */
        this._identified = false;
        /**@type {_Container_Base} Child vers Container display */
        this.child = null; //TODO: AJOUTER GETTER P:MASTER ET CHILD DOIS EST UN {} DE REFERENCE ?
        this._type = _DataObj_Base.TYPE.base; //TODO:  LE TYPE EST TOUJOURS BASES SAUFE SI ON CHANGE LE TYPE DANS EDITEUR
        this.factory = factory;
        Object.defineProperty(this, 'factory', { enumerable : false });// pour editeur probleme create_Inspector()?
        Object.defineProperty(this, 'child', { enumerable : false });
    };
    get dataBase() { return $loader.DATA2[ this._dataBaseName ] };

    //#region [Initialize]
    /** Initialize from _Container_Base */
    initialize_base(){

    };

    initialize_interactive(){

    };
    //#endregion


    //#region [Interactive]
    /** @param {PIXI.interaction.InteractionEvent} e 
      * @param {_ObjsIdentificator} ObjsIdentificator
    */
    pointerover_fromIdentificator(e,ObjsIdentificator){
        
    };
    /** @param {PIXI.interaction.InteractionEvent} e 
      * @param {_ObjsIdentificator} ObjsIdentificator
    */
    pointerout_fromIdentificator(e,ObjsIdentificator){

    };
     /** @param {PIXI.interaction.InteractionEvent} e 
      * @param {_ObjsIdentificator} ObjsIdentificator
     */
    pointerup_fromIdentificator(e,ObjsIdentificator){
            ObjsIdentificator.Destroy();
            this.removeFromRegister();
    };
    //#endregion
    /** suprime du register un dataObj (utile pour editeur)*/
    removeFromRegister(){
        this.child.renderable = false;
        $objs.GLOBAL[this._globalId] = null;
        $objs.LOCAL[this._localId] = null;
        this.child.destroy({children:true});
        this.factory = null;
        this.child = null;
    };

    /** initialize un factory selon les props du child */
    initializeFactory(){
        return this.factory = Factory.createFrom(this);
    };

    /** asign le factory au display objet attacher */
    asignFactory(factory=this.factory){
        if(!factory){return console.error('critical error! no factory existe',factory)};
        factory.g.to(this);
        this.child && this.child.asignFactory(factory);
    };

    /**Proced a l'identification d'un obj */
    doIdentification(){
        //Todo, pour le moment ces basic, ajouter des fx
        if(!this._identified){
            this._identified = true;
            if(this.child){
                this.child.n && (this.child.n.filters = [$systems.PixiFilters.OutlineFilterx4Black]);
            }
            //!TODO: identification.js system ditentification et interaction des obj
            const IdenObj = _ObjsIdentificator.create(this);
            this.child.addChild(IdenObj.p);
            IdenObj.checkNearObjFromPlayer();
        }
    };
    
    /** clone un dataObj avec posibiliter de register */
    clone(needRegister){ //TODO: VERIFIER QUE LE CLONE FONCTIONNER POUR LE SUPER ?
        const newDataObj = $objs.getClassDataObj(this.dataBase._category,this._dataBaseName,this._textureName);
       //if(needRegister){
       //    $objs.addToGlobalRegister(newDataObj,$objs.GLOBAL.findEmptyIndex());
       //    $objs.addtoLocalRegister (newDataObj,$objs.LOCAL .findEmptyIndex());
       //}
        return newDataObj;
        /*const jsonValues = JSON.parse(JSON.stringify(this));
        return new this.constructor(jsonValues._dataBaseName,jsonValues._textureName,jsonValues.dataValues);*/
    };

   
}
