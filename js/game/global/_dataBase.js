

/** Cache des base textures et data du loader*/
class _DataBase {
    //#region [Static]
     /**@returns {_DataBase}*/
    static create(res){
        const DataBase = new this(res);
        this.pool.push(DataBase);
        return DataBase;
    };
    static pool = [];
    static DATA2 = {};
    static TYPE = {
        _Container_Base     :0,
        _Container_Sprite   :1,
        _Container_Animation:2,
        _Container_Spine    :3,
        keys() { return Object.keys(this) },
    };

    //#endregion

    /**@param {PIXI.loaders.Resource} res */
    constructor (res) {
        this.data = res.data;
        res.spineData && (this.spineData = res.spineData);
        this._perma = res.name[0] === res.name[0].toUpperCase();//FIXME: Les perma ne son plus sceneBoot, mais commence par une lettre masjuscule, mes ces pas une bonne idea
        this._normal = !!res.spineData || !!res.data.meta && !!res.data.meta.normal_map; //TODO: trouver une solution pour spine avec les skin ?ou toujours normal
        this._dataBaseName =  res.name;
        this._extension = res.extension;
        this._url = res.url;
        this._category = res.url.split('/')[1];
        this._type = res.spineData? _DataBase.TYPE._Container_Spine:
        res.data.animations? _DataBase.TYPE._Container_Animation:
        (!this.isBackground&&!this.isVideo)? _DataBase.TYPE._Container_Sprite : _DataBase.TYPE._Container_Base;

        /*this.textures = {};
        this.textures_n = {};
        this.BaseTextures = {};*/ //bug dans editor, remapper isSpine...
        this.addToCache(res)
    };

    //#region [GetterSetter]
    get type() { return _DataBase.TYPE.keys()[this._type] };
    get isMultiPacks   () { return this.data.meta && !!this.data.meta.related_multi_packs  };
    get isVideo   () { return this._category === "Video" };
    get Light   () { return this._category === "Light" };
    get isSpineSheets   () { return this._type     === _DataBase.TYPE._Container_Spine };
    get isSpriteSheets   () { return this._type     === _DataBase.TYPE._Container_Sprite };
    get isAnimationSheets() { return this._type     === _DataBase.TYPE._Container_Animation };
    get isBackground     () { return this._category === "Backgrounds" }; 
    //#endregion

    /** reference les ressource au cache , selon besoin*/
    addToCache(res){
        if(this.isSpriteSheets || this.isAnimationSheets || this.isBackground ){
            this.spritesheet = res.spritesheet;
            /**@type {Object.<string, PIXI.Texture>} */
            this.textures = res.textures;
            /**@type {Object.<string, PIXI.Texture>} */
            this.textures_n = res.textures_n;
            this.BaseTextures = {
                d:$loader.TextureCache[this._url.replace('.json','.png')],
                n:$loader.TextureCache[this._url.replace('.json','_n.png')],
            };
            if(this.isBackground){ //TODO: UNBIND TEXTURE GL CACHE et fair aussi pareil pour isAnimationSheets
                for (const key in this.textures) {
                    $app.renderer.bindTexture(this.textures[key])
                    $app.renderer.bindTexture(this.textures_n[key])
                }
            };
            delete res.spritesheet;
            delete res.textures;
            delete res.textures_n;
        };
        if(this.isSpineSheets){
            this.spineData = res.spineData;
            this.spineAtlas = res.spineAtlas;
            this.BaseTextures = {
                d:$loader.TextureCache[this._url.replace('.json','.png')],
                n:$loader.TextureCache[this._url.replace('.json','_n.png')],
            };
            delete res.spineData;
            delete res.spineAtlas;
        }
        if(this.isVideo){
            this.BaseTextures = {

            };
        }
        Object.defineProperty(this, '_cached', { value:true, enumerable: false });
    };

    /** destroy cache and base */
    destroy(){

    };
};


