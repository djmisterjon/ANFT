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
class _DataObj_MapItem extends _DataObj_Base{
    /**
     * @param {String} dataBaseName
     * @param {String} textureName
     * @param {_Factory} factory
     * @memberof _DataObj_Wall
     */
    constructor(dataBaseName,textureName,factory) {
        super(dataBaseName,textureName,factory);

    }
    initialize_super(){
        
    }
}