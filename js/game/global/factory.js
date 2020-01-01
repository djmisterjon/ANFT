
/**@class Factory data manager for objets */
class Factory {
    /** method dangeureuse, scan tous les fichier du jeux pour metre a jours de nouvelle propreties ajouter */
    static updateJsonGameFactory(){

    };
    
    /**  */
    static createFrom(data){ // trusted obtien tous les keys sans verifier, ne pas utiliser sur des objet pixi
        if(data instanceof _DataObj_Base){
            return {
                g:new Factory(data), //TODO: trusted
                p:data.child.p && new Factory(data.child.p,true),
                d:data.child.d && new Factory(data.child.d,true),
                n:data.child.n && new Factory(data.child.n,true),
                s:data.child.s && new Factory(data.child.s,true),
            };
        };
    }
    /** converty un data json in factory */
    static parseFrom(data){ // trusted obtien tous les keys sans verifier, ne pas utiliser sur des objet pixi
        return {
            g:data.g && new Factory().add(data.g), //TODO: trusted
            p:data.p && new Factory().add(data.p),
            d:data.d && new Factory().add(data.d),
            n:data.n && new Factory().add(data.n),
            s:data.s && new Factory().add(data.s),
        };
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
                base:['position','pivot','scale','skew','anchor'],
                proj:['euler','position3d','pivot3d','scale3d'],
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
    /**
     * @param {Object} obj - objet to serialize
     * @param {Boolean} flatters - use flatters template */
    constructor(obj,flatters=false) { // trustable permet de bypass la verification des flatters.
        obj && this.serialize(obj,flatters);
    };

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

Factory.Flatters(Factory.FLATTERS.propreties.ALL, Factory.FLATTERS.Observable.ALL);





