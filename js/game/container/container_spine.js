
/*:
// PLUGIN □────────────────────────────────□CONTAINER SPINE2D MANAGER□───────────────────────────────┐
* @author □ Jonathan Lepage (dimisterjon),(jonforum) 
* @module manage container and sprite from pixijs
* V.0.1
* License:© M.I.T
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
*/

/** @memberof _Container_Base */
class _Container_Spine extends _Container_Base {
    /**
     *Creates an instance of _Container_Spine.
     * @param {_DataObj_Base} dataObj
     * @memberof _Container_Spine
     */
    constructor(dataObj) {
        super(dataObj);
        /** @type {[Array.<PIXI.projection.Sprite3d|PIXI.projection.Mesh3d>,Array.<PIXI.projection.Sprite3d|PIXI.projection.Mesh3d>]} - contien les d,n du spine*/
        this.dn = null;
    };
    //#region [GetterSetter]
    get timeScale() {
        return this.s.state.timeScale;
    }
    set timeScale(values) {
        this.s.state.timeScale = values;
    }
    get defaultMix() {
        return this.s.state.defaultMix;
    }
    set defaultMix(values) {
        this.s.state.defaultMix = values;
    }
    /** Return le Spine3d container */
    get s() { return this.child.s };
    /** Return les Diffuses lister dans un array */
    get d() { return this.dn[0] };
    /** Return les Normals lister dans un array */
    get n() { return this.dn[1] };
    //#endregion


    //#region [Initialize]
    initialize_base () {
        const DataObj = this.DataObj;
        const DataBase = DataObj.dataBase;
        const s = new PIXI.projection.Spine3d(DataBase.spineData).setName('s');
        this.dn = s.hackAttachmentGroups("_n", PIXI.lights.normalGroup, PIXI.lights.diffuseGroup);
        this.addChild(s);
        if(s.spineData.findAnimation('idle')){
            //s.state.setAnimation(0, "idle", true);//DELETEME:
        }else{
            const ani = s.spineData.animations[0].name
            //s.state.setAnimation(0, ani, true);//DELETEME:
        }
    };
    //#endregion

    // dispatch values asigment for spine
    asignDataValues_spine (dataObj) {
        this.computeValue(dataValues.p);
        this.computeValue.call(this.Sprites.d, dataValues.d);
        // can set false, if need keep temp old values for HTML dataEditor
        if(storeValues){ this.dataValues = dataValues };
    };

    //add default parentGroup 
    asignChildParentGroups (normal) {
        this.s.hackAttachmentGroups("_n", PIXI.lights.normalGroup, PIXI.lights.diffuseGroup); // (nameSuffix, group)
    };


};

//END CLASS
    
    