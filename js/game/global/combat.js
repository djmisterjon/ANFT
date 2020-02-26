/*:
// PLUGIN □────────────────────────────────□ COMBAT CORE ENGINE □───────────────────────────────┐
* @author □ Jonathan Lepage (dimisterjon),(jonforum) 
* @plugindesc manage combats
* V.0.1a
* License:© M.I.T
└───────────────────────────────────────────────────────────────────────────────────────────────────┘
*/
// ┌-----------------------------------------------------------------------------┐
// GLOBAL $combats CLASS: _combats
//└------------------------------------------------------------------------------┘
//TODO: RENDU ICI, en mode combat utiliser un seul dice ou click pour attacker
class _Combats {
    /**@type {_Combats} - La scene Combat en cour*/
    static Active = null;
    constructor(bountyData) {
        /** @type {Array.<_monster_Base>} */
        this.bountyData = bountyData;
        /** @type {Array.<_monsters>} */
        this.Monsters = [];
        _Combats.Active = this;
        this.child = null;
        this.initialize();
    }
    
    //#region [Initialize]
    /**initialise les etapes de combats, le setup du combat est passer en options.
     * @param {_DataObj_Case} dataObj 
     * @param {Promise<Token>} resolve promise to the token.
     * */
    initialize(){
        $stage.interactiveChildren = false;
        this.intitialize_culling();
        this.intitialize_battlers();
        //this.intitialize_tiker();
        //this.intitialize_environement();
        //this.battleStartAnimations();
        Inspectors.Combats();

    }

    intitialize_culling(){
        $camera._culling = false;
        const cullZoom = 0.5; // norme culling pour combat
        const cullPerspective = -1; // norme culling pour combat
        const zoom = $camera._zoom;
        const perspective = $camera._perspective;
        $camera.zoom = cullZoom;
        $camera.perspective = cullPerspective;
        $camera.doCulling(false,true);
        $camera.zoom = zoom;
        $camera.perspective = perspective;
    }

    /** creer les battlers disponible */
    intitialize_battlers(){
        this.bountyData.forEach(DataMonsters => {
            const Monster = new _monsters(DataMonsters);
            this.Monsters.push( Monster );
           
        })
        $stage.scene.addChild(...this.Monsters.map(m=>m.p));
        this.battlers = [...$players.group,...this.Monsters];
        //!asign un id de combat unique et permanent
        for (let i=0, l=this.battlers.length; i<l; i++) {
            this.battlers[i]._battlerID = i;
        }
    }
    //#endregion

}


