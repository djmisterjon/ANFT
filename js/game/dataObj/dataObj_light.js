/*:
// PLUGIN □────────────────────────────────□OBJS LIGHT SHADDER ...□───────────────────────────────┐
* @author □ Jonathan Lepage (dimisterjon),(jonforum) 
* @plugindesc les light obj ne provienne pas de spritesheet et sont isoler des objet base, ce sont des objet
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
class _DataObj_Light extends _DataObj_Base{
    /**
     * @param {String} dataBaseName
     * @param {String} textureName
     * @param {_Factory} factory
     */
    constructor(dataBaseName,textureName,factory) {
        super(dataBaseName,textureName,factory);

    }
    initialize_super(){
        
    }
    getDataValues (fromCage) {
        const dataValues = super.getDataValues(fromCage); // get default dataValues
        dataValues.l = this.getParentValues_light (fromCage);
        return dataValues;
    };

    // les datas pour les spriteAnimations
    getParentValues_light(cage){
        cage = cage && cage.l;
        return {
           // shaderName      : cage? this.shaderName      : "directionalLightShader" , //lock ?
            pivot           : cage? [cage.pivot._x,cage.pivot._y ] : [0,150] ,
            displayOrder    : cage? cage.displayOrder    : 0        ,
            drawMode        : cage? cage.drawMode        : 4        ,
            blendMode       : cage? cage.blendMode       : 1        ,
            radius          : cage? cage.radius          : Infinity ,
            lightHeight     : cage? cage.lightHeight     : 0.075    ,
            brightness      : cage? cage.brightness      : 1        ,
            color           : cage? cage.color           : 16777215 ,
            useViewportQuad : cage? cage.useViewportQuad : true     ,
            indices         : cage? cage.indices         : [0       ,1,2,0,2,3] ,
            falloff         : cage? cage.falloff         : [0.75    ,3,20],
        };
    };


   
}