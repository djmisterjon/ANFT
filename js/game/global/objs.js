/*:
// PLUGIN □────────────────────────────────□OBJS SPRITES , ANIMATIONS, SPINES, EVENTS ...□───────────────────────────────┐
* @author □ Jonathan Lepage (dimisterjon),(jonforum) 
* @plugindesc Manage ,create game objs and events for Scene stage
* V.1.0
* License:© M.I.T
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
Permet de constuire des objets specifiques selon leur type.
Classer egalement par categorie d'interaction. ex: tree,plant,door
Gestionnaire de construiction global des sprites du jeux
Voir le Stages
*/
// penser a faire un local et global ID
// ┌-----------------------------------------------------------------------------┐
// GLOBAL $objs CLASS: _objs
//└------------------------------------------------------------------------------┘
class _Objs{
        /** @type {Array.<_DataObj_Base>} */
    static DataObjs = []; 
    constructor() {
        /** @type {Array.<_DataObj_Base>} */
        this.GLOBAL = []; // obj global du jeux
        /** @type {Array.<_DataObj_Base>} */
        this.LOCAL = []; // objet local du jeux, dans scene
        /** @type {Array.<_DataObj_Case>} */
        this.CASES_G = []; // case global en jeux
        /** @type {Array.<_DataObj_Case>} */
        this.CASES_L = []; // case local en jeux
    };
    //#region [GetterSetter]
    /** @returns {Array.<_DataObj_Case>} - get list of Global game case */
    //get CASES_G() { return this.GLOBAL.filter(o=>{ return o.isCase  })};
    /** @returns {Array.<_DataObj_Case>} - get list of LocalScene game case */
    //get CASES_L() { return this.LOCAL.filter(o=>{ return o.isCase  })};
    //#endregion

    //#region [Initialize]
     /** SceneBoot preConstruits Tous les dataObj parse du loader, dans le jeux tous est OBJS */ 
     initialize(){
        //# Creer tous les dataBase
       // const dataScenes = [].concat(...Object.keys($loader.DATA.scene).filter(sceneName => sceneName.contains('Scene_Map')).map(n=>$loader.DATA.scene[n]._objs));
       const scenesNames = Object.keys($loader.DATA.scene);
       for (let i=0, l=scenesNames.length; i<l; i++) {
            const sceneName = scenesNames[i];
            const sceneData = $loader.DATA.scene[sceneName];
            let _background = sceneData._background ;
            let _objs       = sceneData._objs       ;
            let _lights     = sceneData._lights     ;
            let _sheets     = sceneData._sheets     ;
            if(_objs){
                for (let i=0, l=_objs.length; i<l; i++) {
                    const data = _objs[i];
                    const factory = _Factory.parseFrom(data);
                    const e = this.dataObjFromFactory(factory);
                };
            };
       };
    }

    /** Apply randomizore on objts game */
    initialize_newGame(options){
        const cases = this.CASES_G.filter(c=>c._randomAllowed); // get only cases allowed to randomize
        //! TODO: generate random cases propreties : from map influence, planet,galaxi, need ref id inside dataObj
        const colors = $systems.colorsSystem.keys;
        const bounty = $systems.gameBounties.passive;
        cases.forEach((dataObj,i) => {
            //# _color
            dataObj._color = dataObj.color || colors[~~(Math.random()*colors.length)];
            //# _bounty
            dataObj._bounty = dataObj.bounty || bounty[1] // bounty[~~(Math.random()*bounty.length)];//DELETEME: HACK DEBUG:
            if(dataObj._bounty === 'caseEvent_monsters'){ //TODO: CREER UN POOL DE BOUNTY DATA
                //dataObj._bountyData = [$monsters.generate(0),$monsters.generate(0),$monsters.generate(1),$monsters.generate(2),$monsters.generate(3),$monsters.generate(0)];//todo: ajouter indicateur de dificultet pour heviter trop de monstre puissant ?
            }
        });
    }
    //#endregion

    /** * List des combatModes selon lavancer des turn de combat  & 
    * @typedef {Object} __ContainerDN
    * @property {PIXI.Sprite} d - DIFFUSE SPRITE
    * @property {PIXI.Sprite} n - NORMAL SPRITE
    * @typedef {__ContainerDN & PIXI.Container} ContainerDN
    */
    /** creer un new PIXI.Container pour diffuse et normal
     * @param dataBase dataBase qui contien textures
     * @param {String} textureName nom texture diffuse et normal
     * @param {String} name container name
     * @returns {ContainerDN}
    */
    ContainerDN(dataBase,textureName, name = textureName) {
        if(!dataBase.textures[textureName]){ throw `Fatal error textureName ${textureName}`};
        const c = new PIXI.Container().setName(name);
        const d = c.d = new PIXI.Sprite(dataBase.textures[textureName]);
        const n = c.n = new PIXI.Sprite(dataBase.textures_n[textureName]);
        d.parentGroup = PIXI.lights.diffuseGroup;
        n.parentGroup = PIXI.lights.normalGroup;
        c.addChild(d,n);
        return c;
    }

    /**
     * Creer un Container selon le dataObj 
     * @param {!_DataObj_Base} [dataObj] //TODO: creer un typeDef jummeler
     * @param {_DataBase} [dataBase]
     * @param {String} [textureName]
     * @param {boolean} [skipDataBase]
     */
    create(dataObj, dataBase, textureName, skipDataBase=false){
        if(!dataObj){
            dataObj = this.dataObjFromDataBase(dataBase, textureName);
        }
        //const container = this.create_Container(dataObj.dataBase._type,dataObj);
        //dataObj.asignFactory(); //TODO: container.asignFactory() PLUTOT ! pourrait avoir des probleme si on ini pas factory avant?: events ...
        //this.addtoLocalRegister(dataObj);
        const Container = this.create_Container(dataObj.dataBase, dataObj);
        Container.initialize(skipDataBase);
        dataObj.asignFactory();
        return Container;
    }

    /** Creer un DataObj from  dataBase
     * @param {_DataBase} dataBase - le dataBase
     * @param {String} textureName - displayObj[texture name] Spine[skinName] animation[aniName]
     * @param {String} name - this.name pour child reference
    */
    dataObjFromDataBase(dataBase, textureName, name = textureName){ //TODO: VOIR SI ON PEUT PASSER UN BOOLEAN A FACTORY POUR dataObj.initializeFactory(factory); , SINON CREATE MANUEL
        const dataBaseName = dataBase._dataBaseName;
        const category = dataBase._category;
        const dataObj = this.create_DataObj(category,dataBaseName,textureName);
        return dataObj;
    }

    /** creer un dataObj from Factory data
     * @param {FACTORY} factory
    */
    dataObjFromFactory(factory){
        const dataBaseName = factory.g._dataBaseName.value;
        const textureName = factory.g._textureName.value;
        const category = $loader.DATA2[factory.g._dataBaseName.value]._category; 
        const dataObj = this.create_DataObj(category,dataBaseName,textureName,factory); //(dataBase._category,data.g._dataBaseName.value, data.g._textureName.value, factory);//TODO: a ton vraiment besoin de passer en argument factory
        if(dataObj.isCase){return console.log1('case not create for debug delete me');}
        /**
        Probleme ces que factory doi etre just pour les save game ou lediteur
        Ensuite pour la progression en jeux on map ca sur dataObj
        les prites pourait etre grarder dans les dataObj, juste besoin de creer une method appeller invalidate=>validate
        Ce qui detrui les textures detache les texture, et tous autre elements
         */
        const container = this.create(dataObj);

        //factory.assignTo(dataObj);
        //dataObj.asignFactory(factory);
        this.addToGlobalRegister(dataObj);
       //this.addtoLocalRegister(dataObj, data._localId);
        return dataObj;
    }

    /** get existed global dataObj and return createFrom */
    createFromId(globalId){
        const dataObj = this.GLOBAL[globalId];
        return this.create(dataObj);
    }


    
    /**
     * Create a Container selon le type dataBase pour les objet jeux
     *
     * @param {_DataBase} dataBase
     * @param {String} textureName
     * @param {String} name
     * @returns {(_Container_Sprite|_Container_Spine|_Container_Animation|_Container_Base)} creer une nouvelle class et la return
     * @memberof _Objs
     */
    create_Container(dataBase, dataObj){
        const type = dataBase._type;
        switch (type) {
            case _DataBase.TYPE._Container_Sprite   : return new _Container_Sprite    (dataObj); break;
            case _DataBase.TYPE._Container_Spine    : return new _Container_Spine     (dataObj); break;
            case _DataBase.TYPE._Container_Animation: return new _Container_Animation (dataObj); break;
            case _DataBase.TYPE._Container_Base     : return new _Container_Base      (dataObj); break;
            default: throw "FATAL ERROR TYPE"; break;
        };
    }

    /**
     * @param {String} category
     * @param {String} dataBaseName
     * @param {String} textureName
     * @param {FACTORY} factory
     * @returns {_DataObj_Case|_DataObj_Door} creer une nouvelle class et la return*/
    create_DataObj(category,dataBaseName,textureName,factory){
        switch (category) {
            case _DataBase.CATEGORY.Case       : return new _DataObj_Case         (dataBaseName,textureName,factory) ;break;
            case _DataBase.CATEGORY.Door       : return new _DataObj_Door         (dataBaseName,textureName,factory) ;break;
            case _DataBase.CATEGORY.Characteres: return new _DataObj_Characteres (dataBaseName,textureName,factory) ;break;
            case _DataBase.CATEGORY.Trees      : return new _DataObj_Tree         (dataBaseName,textureName,factory) ;break;
            case _DataBase.CATEGORY.Wall       : return new _DataObj_Wall        (dataBaseName,textureName,factory) ;break;
            default                            : return new _DataObj_Base        (dataBaseName,textureName,factory) ;break;
        };
    }

    //#region [rgba(65, 10, 0,0.1)]
    //!REGISTER
    /** Add objet to register */
    addToGlobalRegister(dataObj){
        if(Number.isFinite(dataObj._globalId)){
            this.GLOBAL[dataObj._globalId] = dataObj;
            if(dataObj.isCase){
                this.CASES_G[dataObj._globalCaseId] = dataObj;
            }
        }else{
            throw `FATAL Error corrupt GlobalID not number ${dataObj._globalId}`
        }
    }

    /** ajoute au local register de la scene */
    addtoLocalRegister(dataObj){
        if(Number.isFinite(dataObj._localId)){
            this.LOCAL[dataObj._localId] = dataObj;
            if(dataObj.isCase){
                this.CASES_L[dataObj._localCaseId] = dataObj;
            }
        }else{
            throw `FATAL Error corrupt GlobalID not number ${dataObj._localId}`
        }
    }
    /** suprim du register un dataObj*/
    removeFromRegister(dataObj){
        this.GLOBAL[dataObj._globalId] && this.GLOBAL.splice(dataObj._globalId,1, void 0);
        this.LOCAL[dataObj._localId] && this.LOCAL.splice(dataObj._localId,1, void 0);
    }
    //endregion

    /** clear les objet pendant un changement scene */
    clear(){
        //todo: verifier le clear reference
       //for (let i=0, l=this.LOCAL.length; i<l; i++) {
       //    const o = this.LOCAL[i]
       //    o.child = null;
       //};
        this.LOCAL = [];
        this.CASES_L = [];
    };

};// END CLASS

/** objetManager */
let $objs = new _Objs();
console.log1('$objs: ', $objs);
