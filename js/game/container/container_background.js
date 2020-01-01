
/*:
// PLUGIN □────────────────────────────────□CONTAINER BACKGROUND MANAGER□───────────────────────────────┐
* @author □ Jonathan Lepage (dimisterjon),(jonforum) 
* @module manage container and sprite from pixijs
* V.0.1
* License:© M.I.T
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
*/

/** @memberof _Container_Base */
class Container_Background extends _Container_Base {
    // note: les bg peut etre decouper en arrays[[1,2,3],[1,2,3]] pour textures packer, et textureName pourrai etre diferent version , season !?
    constructor(dataObj) {
        super(dataObj);
    };
    // getters for ContainerTiles

    initialize_base () {
        // TODO: les bg pourrai etre parfoi decouper en arrays dans textures packer
        const dataObj = this.dataObj;
        const dataBase = dataObj.dataBase;
        const textureName = dataObj.textureName;

        const td = textureName? dataBase.textures   [textureName.d ] : PIXI.Texture.WHITE;
        const tn = textureName? dataBase.textures_n [textureName.n ] : PIXI.Texture.WHITE;
        const d = new PIXI.projection.Sprite2d(td);
        const n = new PIXI.projection.Sprite2d(tn);
        //TODO: AJOUTER UN TYPE C POUR COMBAT
        const tc = $Loader.combatMap;
        const c = new PIXI.projection.Sprite2d(tc);
        c.anchor.set(0.5,1);
        c.renderable = false;

        this.Sprites = {d,n,c};
        this.addChild(c,d,n);
    };

    asignDataObjValues() {
        super.asignDataObjValues();
        const dataObj = this.dataObj;
        if(!dataObj.textureName){
            // si pas de texture? ces un background vide, que on ajust a lecrant
            this.d.scale.set($app.screen.width/10, $app.screen.height/10); 
            this.n.scale.set($app.screen.width/10, $app.screen.height/10); 
        }
        this.parentGroup = $displayGroup.group[0];
        this.d.parentGroup = PIXI.lights.diffuseGroup;
        this.c.parentGroup = PIXI.lights.diffuseGroup;
        this.n.parentGroup = PIXI.lights.normalGroup;
    };

    affines (value) {
        this.affine = 0;
    };
};

//END CLASS
    
    