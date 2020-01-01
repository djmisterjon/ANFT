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
class _objs{
    constructor() {
        /** @type {Array.<_DataObj_Base>} */
        this.GLOBAL = []; // obj global du jeux
        /**@type {Array.<_DataObj_Base>} */
        this.LOCAL = []; // objet local du jeux, dans scene
    };
    /** get list of Global game case */
    get CASES_G() { return this.GLOBAL.filter(o=>{ return o instanceof DataObj_Case })};
    /**get list of Local cases Scene */
    get CASES_L() { return this.LOCAL.filter(o=>{ return o instanceof DataObj_Case })};

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
        if(!dataBase.textures[textureName]){ throw console.error('mauvais dataBase, ne contien pas de texture nommer:',textureName)};
        const c = new PIXI.Container().setName(name);
        const d = c.d = new PIXI.Sprite(dataBase.textures[textureName]);
        const n = c.n = new PIXI.Sprite(dataBase.textures_n[textureName]);
        d.parentGroup = PIXI.lights.diffuseGroup;
        n.parentGroup = PIXI.lights.normalGroup;
        c.addChild(d,n);
        return c;
    };

    /** Creer un dataObj jeux */
    create(dataBase,_textureName,type){ //TODO: VOIR SI ON PEUT PASSER UN BOOLEAN A FACTORY POUR dataObj.initializeFactory(factory); , SINON CREATE MANUEL
        const dataObj = this.getClassDataObj(dataBase._category,dataBase._dataBaseName,_textureName)
        const container = this.getClassContainer(dataBase._type, dataObj);
        return dataObj;
    };

    /**@returns {_DataObj_Base} creer un container et attche au dataOnj */
    createFrom(dataObj){
        const container = this.getClassContainer(dataObj.dataBase._type,dataObj);
        dataObj.asignFactory(); //TODO: container.asignFactory() PLUTOT ! pourrait avoir des probleme si on ini pas factory avant?: events ...
        this.addtoLocalRegister(dataObj);
        return dataObj;
    };

    /** creer un dataObj to Global avec un parse data*/
    createDataObj(data,needRegister){
        const dataBase = $loader.DATA2[data.g._dataBaseName.value]; // on recupere le dataBase;
        
        const factory = Factory.parseFrom(data); //FIXME: NOT WORK fine, on doi parser les data json en factory data pour les methodes
        const dataObj =this.getClassDataObj(dataBase._category,data.g._dataBaseName.value, data.g._textureName.value, factory);//TODO: a ton vraiment besoin de passer en argument factory
        dataObj.asignFactory(factory);
        this.addToGlobalRegister(dataObj);
       //this.addtoLocalRegister(dataObj, data._localId);
        return dataObj;
    };

    /** get existed global dataObj and return createFrom */
    createFromId(globalId){
        const dataObj = this.GLOBAL[globalId];
        return this.createFrom(dataObj);
    };


    /** return une class container selon le type de dataBase*/
    getClassContainer(_type,dataObj){
        switch (_type) {
            case _DataBase.TYPE._Container_Sprite: return new _Container_Sprite    (dataObj); break;
            case _DataBase.TYPE._Container_Spine: return new _Container_Spine     (dataObj); break;
            case _DataBase.TYPE._Container_Animation: return new _Container_Animation (dataObj); break;
            case _DataBase.TYPE._Container_Base: return new _Container_Base     (dataObj); break;
            default: throw console.error('quelque chose cloche ici'); break;
        };
    };

    /**@returns {_DataObj_Base} creer une nouvelle class et la return*/
    getClassDataObj(category,dataBaseName,textureName,factory){
        switch (category) {
            case 'Case'  : return new DataObj_Case    (dataBaseName,textureName, factory) ;break;
            case 'Door'   : return new DataObj_Door    (dataBaseName,textureName, factory) ;break;
            case 'chara'  : return new DataObj_Chara   (dataBaseName,textureName, factory) ;break;
            case 'tree'   : return new DataObj_Tree    (dataBaseName,textureName, factory) ;break;
            case 'mapItem': return new DataObj_MapItem (dataBaseName,textureName, factory) ;break;
            case 'Light'  : return new DataObj_Light   (dataBaseName,textureName, factory) ;break;
            case 'Wall'   : return new DataObj_Wall    (dataBaseName,textureName, factory) ;break;
            default       : return new _DataObj_Base   (dataBaseName,textureName, factory) ;break;
        };
    };

    //#region [rgba(65, 10, 0,0.1)]
    //!REGISTER
    /** Add objet to register */
    addToGlobalRegister(dataObj,_globalId){
        if( Number.isFinite(_globalId) ){
            dataObj._globalId = _globalId;
        }
        if( Number.isFinite(dataObj._globalId) ){
            this.GLOBAL[dataObj._globalId ] = dataObj;
            return true;
        }
        throw console.error('cant add register',dataObj,_globalId);
    };

    /** ajoute au local register de la scene */
    addtoLocalRegister(dataObj,_localId){
        if( Number.isFinite(_localId) ){
            dataObj._localId = _localId;
        }
        if(Number.isInteger(dataObj._localId)){
            this.LOCAL[dataObj._localId] = dataObj;
        };
    };
    //endregion

     //#region [rgba(10, 50, 0,0.1)]
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
                    const e = this.createDataObj(_objs[i]);
                };
            };
       };
    };

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
    };

    /** clear les objet pendant un changement scene */
    clear(){
        //todo: verifier le clear reference
       //for (let i=0, l=this.LOCAL.length; i<l; i++) {
       //    const o = this.LOCAL[i]
       //    o.child = null;
       //};
        this.LOCAL = [];
    };
    //endregion

};// END CLASS
/** objetManager */
let $objs = new _objs();
console.log1('$objs: ', $objs);
