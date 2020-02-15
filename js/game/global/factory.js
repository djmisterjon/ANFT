/**
    * @typedef {Object} Factory_G factory.g
    * @property {{value:String}} Factory_G._dataBaseName 
    * @property {{value:String}} Factory_G._textureName 
    * @property {{value:Number}} Factory_G._globalId 
    * @property {{value:Number}} Factory_G._localId 
    * @property {{value:Number}} Factory_G._type 
*/
/**
    * @typedef {Object} Factory_P factory.p
    * @property {{value:Number}} Factory_P.alpha
    * @property {{value:Number}} Factory_P.rotation
    * @property {{value:Number}} Factory_P.parentGroupId
    * @property {{value:{}}} Factory_P.proj
    * @property {{value:PIXI.ObservablePoint}} Factory_P.position
    * @property {{value:PIXI.ObservablePoint}} Factory_P.pivot
    * @property {{value:PIXI.ObservablePoint}} Factory_P.scale
    * @property {{value:PIXI.ObservablePoint}} Factory_P.skew
    * @property {{value:PIXI.projection.Euler}} Factory_P.euler
    * @property {{value:PIXI.projection.Point3d}} Factory_P.pivot3d
    * @property {{value:PIXI.projection.Point3d}} Factory_P.scale3d
*/
/**
    * @typedef {Factory_P} Factory_D factory.d
    * @typedef {Factory_D} Factory_N factory.n
    * @property {{value:Number}} Factory_D.tint
    * @property {{value:Number}} Factory_D.blendMode
    * @property {{value:PIXI.ObservablePoint}} Factory_D.anchor
*/
/**
    * @typedef {Object} Factory_S factory.s
*/
/**
    * @typedef {Object} FACTORY - factory data
    * @property {Factory_G} FACTORY.g
    * @property {Factory_P} FACTORY.p
    * @property {Factory_D} FACTORY.d
    * @property {Factory_N} FACTORY.n
    * @property {Factory_S} FACTORY.s
*/

/**@class Factory data manager for objets (Gestion des sauvegard et editor seulement) */
class _Factory {
    //#region [Static]
    /** method dangeureuse, scan tous les fichier du jeux pour metre a jours de nouvelle propreties ajouter */
    static updateJsonGameFactory(){

    };
    
    /** @returns {FACTORY} */
    static createFrom(data){ // trusted obtien tous les keys sans verifier, ne pas utiliser sur des objet pixi
        if(data instanceof _DataObj_Base){
            return {
                g:new _Factory(data), //TODO: trusted
                p:data.p.p && new _Factory(data.p.p,true),
                d:data.p.d && new _Factory(data.p.d,true),
                n:data.p.n && new _Factory(data.p.n,true),
                s:data.p.s && new _Factory(data.p.s,true),
            };
        };
    }
    /** converty un data json in factory 
     * @returns {FACTORY}
    */
    static parseFrom(data){ // trusted obtien tous les keys sans verifier, ne pas utiliser sur des objet pixi
        const f = new _Factory();
        Object.assign(f, {
            g:data.g && new _Factory().add(data.g), //TODO: trusted
            p:data.p && new _Factory().add(data.p),
            d:data.d && new _Factory().add(data.d),
            n:data.n && new _Factory().add(data.n),
            s:data.s && new _Factory().add(data.s),
        })
        return f;
    }
    /** Parent proprety of objet to includes in FactoryPoint */
    static FLATTERS = (()=>{
        const factory = {
            propreties:{
                container:['alpha','rotation','parentGroupId'],
                sprite:['alpha','tint','blendMode','rotation'],
                spines:['timeScale','defaultMix'],
                animations:['animationSpeed','loop','playing','currentFrame','totalFrames'],
                proj:['affine','affinePreserveOrientation','cameraMode','scaleAfterAffine'],
            },
            Observable:{
                proj:['euler','position3d','pivot3d','scale3d'],
                base:['skew','anchor','position','pivot','scale'],
            }
        };

        Object.defineProperty(factory.propreties, "ALL", {
            get : function(){ return [].concat(...Object.values(this)) }
        });
        Object.defineProperty(factory.Observable, "ALL", {
            get : function(){ return [].concat(...Object.values(this)) }
        });
        return factory;
    })();

    /** set flatters options */
    static Flatters(props,obersvables) {
        Object.defineProperty(this.prototype, '_flatters', {
            value:{props,obersvables},
            configurable:true,
        });
    };
    //#endregion

    /**
     * @param {Object} obj - objet to serialize
     * @param {Boolean} flatters - use flatters template */
    constructor(obj,flatters=false) { // trustable permet de bypass la verification des flatters.
        obj && this.serialize(obj,flatters);
    };

    assignTo(dataObj){
        this.g && this.g.to(dataObj        );
        this.p && this.p.to(dataObj.child.p);
        this.d && this.d.to(dataObj.child.d);
        this.n && this.n.to(dataObj.child.n);
        this.s && this.s.to(dataObj.child.s);
    }

    /** serialize obj */
    serialize(obj,flatters){ // new Factory(temp1)
        const serials = ['String','Number','Boolean','Array']
        function check(o,KEYS,obersvable) {
            const json = {};
            KEYS.forEach(key => {
                const entry = o[key];
                if(entry !== undefined && entry !== null && entry.constructor){
                    const type = entry.constructor.name;
                    const value = o[key];
                    (serials.indexOf(type)>-1)? json[key] = { value, type }
                    : obersvable? json[key] = {value:{ x:value.x, y:value.y, z:value.z }, type:'ObservablePoint' }
                    : json[key] = { value:check( value, flatters?KEYS:Object.keys(value) ), type:'Object' };
                }
            });
            return json;
        };
        const a = check(obj,flatters?this._flatters.props:Object.keys(obj))
        const b = flatters && check(obj,this._flatters.obersvables,true) || {};
        const r = Object.assign(this,a,b);
    };

    /** asign factory value to a Object */
    to(obj){
        function asign(obj,thats) {
            for (const key in thats) {
                const o = thats[key];
                switch (o.type) {
                    case 'ObservablePoint': obj[key].copy(o.value); break;
                    case 'Object': asign(obj[key],o.value); break;
                    default: obj[key] = o.value ;break;
                };    
            };  
        };
        asign(obj,this);
    };

    add(data){
        Object.assign(this, data);
        return this;
    }
};

_Factory.Flatters(_Factory.FLATTERS.propreties.ALL, _Factory.FLATTERS.Observable.ALL);





