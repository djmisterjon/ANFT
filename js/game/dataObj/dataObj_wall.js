/*:
// PLUGIN □────────────────────────────────□OBJS SPRITES , ANIMATIONS, SPINES, EVENTS ...□───────────────────────────────┐
* @author □ Jonathan Lepage (dimisterjon),(jonforum) 
* @plugindesc Manage ,create game objs and events for Scene stage
* V.1.0
* License:© M.I.T
└───────────────────────────────────────────────────────────────────────────────────────────────────┘

*/
// ┌-----------------------------------------------------------------------------┐
// GLOBALFROM $objs CLASS: dataObj_case HERITAGE:dataObj_base
//└------------------------------------------------------------------------------┘
/** isometric wall */
class _DataObj_Wall extends _DataObj_Base{
    /**
     * @param {String} dataBaseName
     * @param {String} textureName
     * @param {_Factory} factory
     */
    constructor(dataBaseName,textureName,factory) {
        super(dataBaseName,textureName,factory);

    };
    initialize(){
        this.initialize_base();
        this.initialize_interactive()
    }
    /** from _Container_Base.initialize, initialize des sprites ou extra selon type, si besoin! */
    initialize_base(){
        const dataBase = this.dataBase;
        if(this._textureName === 'tileW0'){
            //cage color 
            //this.child.p.alpha = 0.5;
            const tileW0_L = new PIXI.projection.Sprite3d(dataBase.textures.tileW0_L);
                tileW0_L.parentGroup = $displayGroup.DiffuseGroup;
                tileW0_L.anchor.set(0,1);
                tileW0_L.euler.y = -Math.PI / 4;
            const tileW0_R = new PIXI.projection.Sprite3d(dataBase.textures.tileW0_R);
                tileW0_R.parentGroup = $displayGroup.DiffuseGroup;
                tileW0_R.anchor.set(1,1);
                tileW0_R.euler.y = Math.PI / 4;
            const tileW0_T = new PIXI.projection.Sprite3d(dataBase.textures.tileW0_T);
                tileW0_T.parentGroup = $displayGroup.DiffuseGroup;
                tileW0_T.anchor.set(0,1);
                tileW0_T.euler.x = -Math.PI / 2;
                tileW0_T.pivot.y = tileW0_L.height;
                tileW0_L.addChild(tileW0_T)

                
                
            this.p.p.addChild(tileW0_L,tileW0_R);
        };
    };

};//END CLASS

