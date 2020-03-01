// note: les bg peut etre decouper en arrays[[1,2,3],[1,2,3]] pour textures packer, et textureName pourrai etre diferent version , season !?

class _Container_Background extends _Container_Base {
        /**
     *Creates an instance of _Container_Spine.
     * @param {_DataObj_Base} dataObj
     * @memberof _Container_Spine
    */
    constructor(dataObj) {
        super(dataObj);
        this.child = null;
    };
    get realWidh() {
        return this.DataObj?.dataBase.textures[this.DataObj._textureName].width || 1080;
    }
    get realHeight() {
        return this.DataObj?.dataBase.textures[this.DataObj._textureName].height || 1080;
    }


    //#region [Initialize]
    initialize_base () {
        // TODO: les bg pourrai etre parfoi decouper en arrays dans textures packer
        const DataObj = this.DataObj;
        const dataBase = DataObj.dataBase;
        const textureName = DataObj._textureName;
        const texturesCombat = dataBase.textures[textureName+'_c'] || PIXI.Texture.WHITE;
        const d = new PIXI.projection.Sprite3d(dataBase.textures[DataObj._textureName]).setName('d');
        const n = new PIXI.projection.Sprite3d(dataBase.textures_n[DataObj._textureName]).setName('n');
        const c = new PIXI.projection.Sprite3d(texturesCombat).setName('c');
            c.parentGroup = PIXI.lights.diffuseGroup;
            d.parentGroup = PIXI.lights.diffuseGroup;
            n.parentGroup = PIXI.lights.normalGroup;
            d.anchor.set(0.5);
            n.anchor.set(0.5);
            c.anchor.set(0.5);
            c.renderable = false;
            c.visible = false;
        this.addChild(d,n,c);
    }
    //#endregion

    //#region [Method]
    /** applani la scene affine euler */
    setPlane(){
        this.zOrder = -1;
        this.parentGroup = $displayGroup.group[0];
        this.euler.x = -Math.PI/2;
        //this.affine = 0;
    }
    //#endregion

}

//END CLASS
    
    