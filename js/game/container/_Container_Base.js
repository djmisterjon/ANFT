
class _Container_Base extends PIXI.projection.Container3d {
    /**
     *Creates an instance of _Container_Base.
     * @param {_DataObj_Base} dataObj
     * @memberof _Container_Base
     */
    constructor(dataObj) {
        super();
        /**@type {_DataObj_Base} */ //TODO: CREER TYPEDEF QUI REGROUP TOUS
        this.DataObj = dataObj; // attache dataObj
        this.child = null;
        //dataObj && (dataObj.child = this); // register the dataobjchild with this container
        //dataObj.isValid && this.initialize();
    };

    //#region [GetterSetter]
    get parentGroupId(){
        return this.parentGroup? this.parentGroup.zIndex : -1;
    }
    set parentGroupId(id){
        if( id<0 || id === null || id === void 0){
            this.parentGroup = void 0;
        }else{
            if(isNaN(id)){
                $displayGroup[id];
            }else{
                this.parentGroup = $displayGroup.group[id];
            }
        };
    }
    /** @return {PIXI.extras.AnimatedSprite} */
    get a() { return this.child.a }; //todo: o
    /** @returns {_DataObj_Base} */
    get b() { return this.DataObj }; //todo: o
    /** @return {PIXI.projection.Spine3d} */
    get s() { return this.child.s };
    /** @returns {_Container_Base} */
    get p() { return this };
    /** @returns {PIXI.Sprite} - diffuse */
    get d() { return this.child.d || false };
    /** @returns {PIXI.Sprite} - normal */
    get n() { return this.child.n || false }; //
    /** @returns [PIXI.Sprite,PIXI.Sprite] - arrays combat .cd, .cn */
    get c() { return this.DataObj.dataBase.isBackground && [this.child.cd,this.child.cn] || false };
    get register() { return this.DataObj.register || false };
    set register(value) { value? $objs.addToRegister(this)  : $objs.removeToRegister(this) }; // 0 ou 1
    get isReverse() { return this.s?this.s.scale._x < 0 : this.scale._x < 0 }; // TODO: probleme avec spine et animations
    //#endregion

    //#region [Initialize]
    initialize(skipDataBase){
        this.initialize_base();
        this.child = this.childrenToName();
        this.initialize_dataObj(skipDataBase);
        
    }

    initialize_dataObj(skipDataBase){
        const DataObj = this.DataObj;
        DataObj.addLink(this);
        if(!skipDataBase && DataObj){
            DataObj.initialize();
        }
    }

    /** si na pas de class parent , ces une base background*/
    initialize_base(dataObj=this.DataObj) {
        const dataBase = dataObj.dataBase;
        const d = new PIXI.projection.Sprite3d(dataBase.textures[dataObj._textureName]);
        const n = new PIXI.projection.Sprite3d(dataBase.textures_n[dataObj._textureName]);
        //C.parentGroup = $displayGroup.group[0];
        d.parentGroup = PIXI.lights.diffuseGroup;
        n.parentGroup = PIXI.lights.normalGroup;
        this.euler.x = -Math.PI / 2;
        d.anchor.set(0.5);
        n.anchor.set(0.5);
        this.addChild(d,n);

        if(dataBase.isBackground){ //todo: move dans dataobj background init
            //!combat
            const combatTextureName = dataObj._textureName+'_c';
            const cd = this.child.cd = new PIXI.projection.Sprite3d(dataBase.textures[combatTextureName]);
            const cn = this.child.cn = new PIXI.projection.Sprite3d(dataBase.textures_n[combatTextureName]);
            cd.parentGroup = PIXI.lights.diffuseGroup;
            cn.parentGroup = PIXI.lights.normalGroup;
            cd.anchor.set(0.5);
            cn.anchor.set(0.5);
            //!minimap
            //!largeMap
        };
    };
    
    initialize_interactive(dataObj=this.DataObj){
       
    };
    //#endregion

    /** asign les data factory au container */
    asignFactory(factory = this.DataObj.factory){

    };

    asignValues (data) {
        Object.keys(data).forEach(key=>{
            if(this[key] instanceof Object){
               // this[key].copy(data[key])
            }else{
                this[key] = data[key];
            };
        });
    };


    //auto add default parentGroup for 'tileSheet', 'animationSheet'
    asignChildParentGroups (normal) {
        this.d.parentGroup = normal? PIXI.lights.diffuseGroup : null;
        this.n.parentGroup = normal? PIXI.lights.normalGroup : null;
    };

    // default background not affined
    affines (value) {
        this.proj.affine = this.DataObj.dataValues.p.affine;
    };

    /** verifie si a besoin des reverse selon 2 position */
    needReverseFrom(target){
        return this.x>target.x;
    }

    /** Destroy et detache les ref element displayobj du jeux */
    Destroy(){
        this.child = null;
        this.DataObj = null;
        this.destroy({children:true}); //todo: fair un Destroy custom pour container_base
    }

};//END CLASS